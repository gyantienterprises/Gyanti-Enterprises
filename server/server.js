const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Neon Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- ADMIN SECURITY MIDDLEWARE ---
// This blocks unauthorized requests from reading or deleting your Neon data
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next(); // Token is valid, proceed to the route handler
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired session token." });
  }
};


// --- PUBLIC ENDPOINTS ---

// Lead Submission Endpoint
app.post('/api/leads', async (req, res) => {
  const { name, contact, monthlyBill, kwNeeded, moneySaved } = req.body;

  if (!name || !contact || !monthlyBill) {
    return res.status(400).json({ error: "Missing required form data." });
  }

  try {
    const checkUser = await pool.query('SELECT id FROM solar_leads WHERE contact = $1', [contact]);
    const isExisting = checkUser.rows.length > 0;

    const numericSavings = parseInt(String(moneySaved).replace(/,/g, ''));
    let result;

    if (isExisting) {
      const updateQuery = `
        UPDATE solar_leads 
        SET name = $1, monthly_bill = $2, kw_needed = $3, money_saved = $4, created_at = CURRENT_TIMESTAMP
        WHERE contact = $5
        RETURNING *;
      `;
      result = await pool.query(updateQuery, [name, parseInt(monthlyBill), parseFloat(kwNeeded), numericSavings, contact]);
      
      return res.status(200).json({ 
        success: true, 
        message: "We found an existing profile under this number. Your consultation metrics have been successfully updated!",
        lead: result.rows[0] 
      });
    } else {
      const insertQuery = `
        INSERT INTO solar_leads (name, contact, monthly_bill, kw_needed, money_saved)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      result = await pool.query(insertQuery, [name, contact, parseInt(monthlyBill), parseFloat(kwNeeded), numericSavings]);
      
      return res.status(201).json({ 
        success: true, 
        message: "Your consultation has been successfully booked!",
        lead: result.rows[0] 
      });
    }

  } catch (error) {
    console.error("Database Handling Error Details:", error);
    return res.status(500).json({ error: "Internal server database error." });
  }
});


// --- NEW ADMIN SECURE ENDPOINTS ---

// 1. Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }

  // Verifies password against server-side environment variables securely
  if (password === process.env.ADMIN_PASSWORD) {
    // Generate a secure token valid for 2 hours
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ success: true, token });
  }

  return res.status(401).json({ error: "Incorrect password. Access denied." });
});

// 2. Fetch All Leads (Protected)
app.get('/api/admin/leads', authenticateAdmin, async (req, res) => {
  try {
    // Fetch data out of your Neon database sorted by newest first
    const result = await pool.query('SELECT id, name, contact as phone, monthly_bill, kw_needed, money_saved, created_at FROM solar_leads ORDER BY created_at DESC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return res.status(500).json({ error: "Failed to fetch database records." });
  }
});

// 3. Delete an Entry (Protected)
app.delete('/api/admin/leads/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = 'DELETE FROM solar_leads WHERE id = $1 RETURNING *;';
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Record not found." });
    }

    return res.status(200).json({ success: true, message: "Lead successfully removed." });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return res.status(500).json({ error: "Failed to delete database record." });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Solar backend operational on port ${PORT}`);
});