const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- OPTIMIZED NEON CONNECTION POOL ---
// Added parameters to wait out Neon's serverless cold starts gracefully
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                 // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // Maximum time to wait for a connection slot before timing out
});

// --- IN-MEMORY REALTIME WEB DASHBOARD CLIENTS ---
let adminClients = [];

// --- PUSH NOTIFICATION HELPERS ---
const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    const result = await response.json();
    console.log("Push result:", JSON.stringify(result));
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

const notifyAllDevices = async (title, body, data = {}) => {
  try {
    const result = await pool.query("SELECT token FROM device_tokens");
    for (const row of result.rows) {
      try {
        await sendPushNotification(row.token, title, body, data);
      } catch (err) {
        console.error("Failed sending to token:", row.token, err);
      }
    }
  } catch (error) {
    console.error("Error notifying devices:", error);
  }
};

// --- REALTIME WEB BROADCAST HELPER ---
const broadcastToWebAdmins = (leadData) => {
  const normalizedData = {
    ...leadData,
    phone: leadData.contact
  };
  adminClients.forEach(client => {
    try {
      client.write(`data: ${JSON.stringify(normalizedData)}\n\n`);
    } catch (err) {
      console.error("Error writing to SSE client:", err);
    }
  });
};

// --- DEVICE REGISTRATION ---
app.post("/api/register-device", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required." });
  }
  try {
    await pool.query(
      "INSERT INTO device_tokens (token) VALUES ($1) ON CONFLICT (token) DO NOTHING",
      [token],
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving device token:", error);
    return res.status(500).json({ error: "Failed to save token." });
  }
});

// --- REALTIME SSE STREAM FOR WEB ADMIN APP ---
app.get("/api/admin/leads/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  adminClients.push(res);

  req.on("close", () => {
    adminClients = adminClients.filter(client => client !== res);
  });
});

// --- PUBLIC LEAD SUBMISSION WITH INTEGRATED REALTIME HOOKS ---
app.post("/api/leads", async (req, res) => {
  const { name, contact, monthlyBill, kwNeeded, moneySaved } = req.body;

  if (!name || !contact || !monthlyBill) {
    return res.status(400).json({ error: "Missing required form data." });
  }

  try {
    const checkUser = await pool.query(
      "SELECT id FROM solar_leads WHERE contact = $1",
      [contact],
    );
    const isExisting = checkUser.rows.length > 0;
    
    const numericSavings = parseInt(String(moneySaved || 0).replace(/,/g, "")) || 0;
    const parsedMonthlyBill = parseInt(monthlyBill) || 0;
    const parsedKwNeeded = parseFloat(kwNeeded) || 0;
   
    let result;

    if (isExisting) {
      const updateQuery = `
        UPDATE solar_leads 
        SET name = $1, monthly_bill = $2, kw_needed = $3, money_saved = $4, created_at = CURRENT_TIMESTAMP
        WHERE contact = $5
        RETURNING *;
      `;
      result = await pool.query(updateQuery, [
        name,
        parsedMonthlyBill,
        parsedKwNeeded,
        numericSavings,
        contact,
      ]);

      res.status(200).json({
        success: true,
        message: "Your consultation metrics have been successfully updated!",
        lead: result.rows[0],
      });

    } else {
      const insertQuery = `
        INSERT INTO solar_leads (name, contact, monthly_bill, kw_needed, money_saved)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      result = await pool.query(insertQuery, [
        name,
        contact,
        parsedMonthlyBill,
        parsedKwNeeded,
        numericSavings,
      ]);

      res.status(201).json({
        success: true,
        message: "Your consultation has been successfully booked!",
        lead: result.rows[0],
      });
    }

    const freshLead = result.rows[0];
    notifyAllDevices(
      isExisting ? "Lead Updated" : "New Solar Lead! ☀️",
      `${name} — ₹${parsedMonthlyBill}/mo`,
      { lead: freshLead }
    ).catch(err => console.error("Notification thread error:", err));

    broadcastToWebAdmins(freshLead);

  } catch (error) {
    console.error("Database Handling Error Details:", error);
    return res.status(500).json({ error: "Internal server database error." });
  }
});

// --- OPEN DASHBOARD ENDPOINTS ---
app.get("/api/admin/leads", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, contact as phone, monthly_bill, kw_needed, money_saved, created_at FROM solar_leads ORDER BY created_at DESC"
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.warn("Snake_case fetch failed, attempting camelCase fallback...", error.message);
    
    try {
      const fallbackResult = await pool.query(
        'SELECT id, name, contact as phone, "monthlyBill", "kwNeeded", "moneySaved", "createdAt" FROM solar_leads ORDER BY "createdAt" DESC'
      );
      
      const normalizedRows = fallbackResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        monthly_bill: row.monthlyBill,
        kw_needed: row.kwNeeded,
        money_saved: row.moneySaved,
        created_at: row.createdAt
      }));

      return res.status(200).json(normalizedRows);
    } catch (fallbackError) {
      console.error("Both database schema styles failed:", fallbackError);
      return res.status(500).json({ 
        error: "Failed to fetch database records.", 
        details: fallbackError.message 
      });
    }
  }
});

app.delete("/api/admin/leads/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = "DELETE FROM solar_leads WHERE id = $1 RETURNING *;";
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Record not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Lead successfully removed." });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return res.status(500).json({ error: "Failed to delete database record." });
  }
});

// --- DYNAMIC SCHEMA CHECK ---
const initializeSchema = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS solar_leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(50) UNIQUE NOT NULL,
        monthly_bill NUMERIC NOT NULL,
        kw_needed NUMERIC,
        money_saved NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        token TEXT PRIMARY KEY
      );
    `);
    console.log("Neon database structures verified successfully.");
  } catch (err) {
    console.error("Schema sync note:", err.message);
  }
};

app.listen(PORT, async () => {
  console.log(`Solar backend operational on port ${PORT}`);
  // Give Neon a brief 1.5-second buffer to stabilize connections on boot
  setTimeout(async () => {
    await initializeSchema();
  }, 1500);
});