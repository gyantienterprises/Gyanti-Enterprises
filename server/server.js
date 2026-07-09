const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const webpush = require("web-push");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- WEB PUSH CONFIGISTRATION ---
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// --- OPTIMIZED NEON CONNECTION POOL ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Prevent idle connection drops from throwing unhandled exceptions
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err.message);
});

// --- IN-MEMORY REALTIME WEB DASHBOARD CLIENTS ---
let adminClients = [];

// --- DEPLOYMENT HEALTH CHECK ENDPOINT ---
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check database failure:", error.message);
    return res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

// --- WEB PUSH NOTIFICATION HELPER ---
const notifyAllDevices = async (title, body, data = {}) => {
  const payload = JSON.stringify({ title, body, data });

  try {
    const result = await pool.query("SELECT token FROM device_tokens");
    
    // Concurrently distribute push requests to native push endpoints
    const pushPromises = result.rows.map(async (row) => {
      try {
        const subscription = JSON.parse(row.token);
        await webpush.sendNotification(subscription, payload);
      } catch (err) {
        // If a device token is expired or untrusted (Status 410 or 404), purge it from DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query("DELETE FROM device_tokens WHERE token = $1", [row.token]);
          console.log("Purged expired push token from database.");
        } else {
          console.error("Web Push sub-delivery failure:", err.message);
        }
      }
    });

    await Promise.allSettled(pushPromises);
  } catch (error) {
    console.error("Error executing device notifications batch:", error.message);
  }
};

// --- REALTIME WEB BROADCAST HELPER (SSE) ---
const broadcastToWebAdmins = (leadData) => {
  const normalizedData = {
    ...leadData,
    phone: leadData.contact,
  };

  // Pre-filter disconnected/stale sockets
  adminClients = adminClients.filter((client) => client.writable);

  adminClients.forEach((client) => {
    try {
      client.write(`data: ${JSON.stringify(normalizedData)}\n\n`);
    } catch (err) {
      console.error("Error writing to SSE client:", err.message);
    }
  });
};

// --- WEB PUSH SUBSCRIPTION REGISTRATION ---
app.post("/api/register-device", async (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Valid Web Push subscription payload is required." });
  }

  try {
    const subscriptionString = JSON.stringify(subscription);
    await pool.query(
      "INSERT INTO device_tokens (token) VALUES ($1) ON CONFLICT (token) DO NOTHING",
      [subscriptionString]
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving device subscription payload:", error.message);
    return res.status(500).json({ error: "Failed to save operational push mapping." });
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
    adminClients = adminClients.filter((client) => client !== res);
  });
});

// --- PUBLIC LEAD SUBMISSION WITH DATA BOUNDS SANITIZATION ---
app.post("/api/leads", async (req, res) => {
  const { name, contact, monthlyBill, kwNeeded, moneySaved } = req.body;

  if (!name || !contact || monthlyBill === undefined) {
    return res.status(400).json({ error: "Missing required form data fields." });
  }

  // Sanitize and normalize fields safely
  const parsedMonthlyBill = parseInt(monthlyBill, 10);
  const parsedKwNeeded = parseFloat(kwNeeded) || 0;
  const numericSavings = parseInt(String(moneySaved || 0).replace(/,/g, ""), 10) || 0;

  // Strict validation bounds checking to prevent db integer overflows (Fixes the 500 Error)
  if (isNaN(parsedMonthlyBill) || parsedMonthlyBill < 0 || parsedMonthlyBill > 9999999) {
    return res.status(400).json({ error: "Invalid monthly bill value provided." });
  }

  try {
    const checkUser = await pool.query("SELECT id FROM solar_leads WHERE contact = $1", [contact]);
    const isExisting = checkUser.rows.length > 0;

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

    // Trigger async broadcast streams in background threads cleanly
    notifyAllDevices(
      isExisting ? "Lead Metrics Updated 🔄" : "New Solar Lead! ☀️",
      `${name} — ₹${parsedMonthlyBill}/mo`,
      { lead: freshLead }
    ).catch((err) => console.error("Notification processing loop error:", err.message));

    broadcastToWebAdmins(freshLead);

  } catch (error) {
    console.error("Database Transaction Handling Error:", error.message);
    return res.status(500).json({ error: "Internal server handling error." });
  }
});

// --- OPEN DASHBOARD DATA ENDPOINTS ---
app.get("/api/admin/leads", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, contact as phone, monthly_bill, kw_needed, money_saved, created_at FROM solar_leads ORDER BY created_at DESC"
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.warn("Snake_case fallback active. Reason:", error.message);
    try {
      const fallbackResult = await pool.query(
        'SELECT id, name, contact as phone, "monthlyBill", "kwNeeded", "moneySaved", "createdAt" FROM solar_leads ORDER BY "createdAt" DESC'
      );

      const normalizedRows = fallbackResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        monthly_bill: row.monthlyBill,
        kw_needed: row.kwNeeded,
        money_saved: row.moneySaved,
        created_at: row.createdAt,
      }));

      return res.status(200).json(normalizedRows);
    } catch (fallbackError) {
      console.error("Critical: Dual Database schema parse mismatch:", fallbackError.message);
      return res.status(500).json({ error: "Failed to fetch database records securely." });
    }
  }
});

app.delete("/api/admin/leads/:id", async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "Malformed record locator ID." });
  }

  try {
    const result = await pool.query("DELETE FROM solar_leads WHERE id = $1 RETURNING *;", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Target structural record not found." });
    }
    return res.status(200).json({ success: true, message: "Lead successfully removed." });
  } catch (error) {
    console.error("Error deleting entry:", error.message);
    return res.status(500).json({ error: "Failed to drop database record row references." });
  }
});

// --- SCHEMA SYNCHRONIZATION ---
const initializeSchema = async () => {
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
  console.log("Neon database tables structural integrity verified.");
};

// --- SYNCHRONOUS LIFECYCLE BOOTSTRAPPER ---
const startServer = async () => {
  try {
    // Assert structural readiness before running listener bind allocations
    await initializeSchema();
    
    const server = app.listen(PORT, () => {
      console.log(`Solar backend enterprise cluster online on port ${PORT}`);
    });

    // Handle container orchestration shutdowns safely (Render & AWS SIGTERM defaults)
    const handleTermination = async () => {
      console.log("SIGTERM/SIGINT sequence parsed. Terminating database pools gracefully...");
      server.close(() => console.log("HTTP Network interfaces flushed."));
      await pool.end();
      console.log("Pool connection mappings exited safely. Closing runtime instance.");
      process.exit(0);
    };

    process.on("SIGTERM", handleTermination);
    process.on("SIGINT", handleTermination);

  } catch (err) {
    console.error("Critical System Initialization Interruption:", err.message);
    process.exit(1);
  }
};

startServer();