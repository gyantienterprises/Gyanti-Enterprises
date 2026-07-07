const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
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

// Lead Submission Endpoint
app.post('/api/leads', async (req, res) => {
  const { name, contact, monthlyBill, kwNeeded, moneySaved } = req.body;

  // 1. Basic Backend Validation Guard
  if (!name || !contact || !monthlyBill) {
    return res.status(400).json({ error: "Missing required form data." });
  }

  try {
    // 2. Check if the user number already exists in Neon
    const checkUser = await pool.query('SELECT id FROM solar_leads WHERE contact = $1', [contact]);
    const isExisting = checkUser.rows.length > 0;

    // Clean up commas from formatted money strings
    const numericSavings = parseInt(String(moneySaved).replace(/,/g, ''));
    let result;

    if (isExisting) {
      // 3. If they exist: Perform an UPDATE
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
      // 4. If they don't exist: Perform a fresh INSERT
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

// Start Server
app.listen(PORT, () => {
  console.log(`Solar backend operational on port ${PORT}`);
});