const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// In a true production environment, restrict CORS to your frontend domains:
// app.use(cors({ origin: ['https://yourfrontend.com', 'https://admin.yourfrontend.com'] }));
app.use(cors());
app.use(express.json());

// --- ROOT ROUTE ---
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gyanti Enterprises API is running 🚀",
  });
});

// --- OPTIMIZED NEON CONNECTION POOL ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Prevent background DB disconnections from crashing the Node process
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle database client", err);
  process.exit(-1);
});

// --- IN-MEMORY REALTIME WEB DASHBOARD CLIENTS ---
let adminClients = [];

// --- DEPLOYMENT HEALTH CHECK ---
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
    if (result.data && result.data.status === "error") {
      console.warn("Expo Push Error:", result.data);
    }
  } catch (error) {
    console.error(`Error sending push notification to ${expoPushToken}:`, error.message);
  }
};

const notifyAllDevices = async (title, body, data = {}) => {
  try {
    const result = await pool.query("SELECT token FROM device_tokens");
    // Run push notifications concurrently so it doesn't block the thread for large tables
    const pushPromises = result.rows.map((row) =>
      sendPushNotification(row.token, title, body, data)
    );
    await Promise.allSettled(pushPromises);
  } catch (error) {
    console.error("Error notifying devices:", error.message);
  }
};

// --- REALTIME WEB BROADCAST HELPER ---
const broadcastToWebAdmins = (leadData) => {
  const normalizedData = {
    ...leadData,
    phone: leadData.contact,
  };
  
  // Clean up dead clients before broadcasting
  adminClients = adminClients.filter((client) => client.writable);
  
  adminClients.forEach((client) => {
    try {
      client.write(`data: ${JSON.stringify(normalizedData)}\n\n`);
    } catch (err) {
      console.error("Error writing to SSE client:", err.message);
    }
  });
};

// --- DEVICE REGISTRATION ---
app.post("/api/register-device", async (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Valid push token is required." });
  }
  
  try {
    await pool.query(
      "INSERT INTO device_tokens (token) VALUES ($1) ON CONFLICT (token) DO NOTHING",
      [token]
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving device token:", error.message);
    return res.status(500).json({ error: "Failed to save device token." });
  }
});

// --- REALTIME SSE STREAM ---
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

// --- PUBLIC LEAD SUBMISSION ---
app.post("/api/leads", async (req, res) => {
  const { name, contact, monthlyBill, kwNeeded, moneySaved } = req.body;

  // 1. Strict existence validation
  if (!name || !contact || monthlyBill === undefined) {
    return res.status(400).json({ error: "Missing required form data." });
  }

  // 2. Data sanitation and safe parsing
  const parsedMonthlyBill = parseInt(monthlyBill, 10);
  const parsedKwNeeded = parseFloat(kwNeeded) || 0;
  const numericSavings = parseInt(String(moneySaved || 0).replace(/,/g, ""), 10) || 0;

  // 3. Strict limits to prevent Database Integer Overflows (The 500 error fix)
  if (isNaN(parsedMonthlyBill) || parsedMonthlyBill < 0 || parsedMonthlyBill > 9999999) {
    return res.status(400).json({ error: "Invalid monthly bill amount provided." });
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

    // Trigger async processes without blocking the client response
    const freshLead = result.rows[0];
    
    notifyAllDevices(
      isExisting ? "Lead Updated" : "New Solar Lead! ☀️",
      `${name} — ₹${parsedMonthlyBill}/mo`,
      { lead: freshLead }
    ).catch((err) => console.error("Notification thread error:", err.message));

    broadcastToWebAdmins(freshLead);
    
  } catch (error) {
    console.error("Database Handling Error:", error.message);
    return res.status(500).json({ error: "Internal server processing error." });
  }
});

// --- DASHBOARD ENDPOINTS ---
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
      console.error("Database fetch failed:", fallbackError.message);
      return res.status(500).json({ error: "Failed to fetch database records." });
    }
  }
});

app.delete("/api/admin/leads/:id", async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "Invalid ID format." });
  }

  try {
    const deleteQuery = "DELETE FROM solar_leads WHERE id = $1 RETURNING *;";
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Record not found." });
    }
    return res.status(200).json({ success: true, message: "Lead successfully removed." });
  } catch (error) {
    console.error("Error deleting entry:", error.message);
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
    console.error("Critical Schema sync error:", err.message);
    throw err; 
  }
};

// --- SERVER BOOT AND GRACEFUL SHUTDOWN ---
const startServer = async () => {
  try {
    // 1. Ensure the DB is ready BEFORE accepting requests
    await initializeSchema();
    
    // 2. Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`Solar backend operational on port ${PORT}`);
    });

    // 3. Graceful shutdown handlers for Render deployments
    const gracefulShutdown = async () => {
      console.log("Shutting down gracefully...");
      server.close(() => console.log("HTTP server closed."));
      await pool.end();
      console.log("Database connection pool closed.");
      process.exit(0);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();