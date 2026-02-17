const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",         // change if needed
  password: "1234",     // change if needed
  database: "customerportfolio"
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("✅ MySQL connected successfully!");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        address VARCHAR(255),
        item VARCHAR(255) NOT NULL,
        weight DECIMAL(10,2),
        idproof VARCHAR(255),
        date DATE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        payment VARCHAR(50),
        notes TEXT
      )
    `;

    db.query(createTableQuery, (err, result) => {
      if (err) {
        console.error("❌ Error creating table:", err);
      } else {
        console.log("✅ Customers table ready!");
      }
    });
  }
});

// Create customer API
app.post("/api/customers", (req, res) => {
  const { name, gender, phone, email, address, item, weight, idproof, date, price, payment, notes } = req.body;

  if (!name || !phone || !item || !date || !price) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const query = `
    INSERT INTO customers (name, gender, phone, email, address, item, weight, idproof, date, price, payment, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [name, gender, phone, email, address, item, weight, idproof, date, price, payment, notes];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("❌ Error inserting customer:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.status(201).json({ id: result.insertId, ...req.body });
    }
  });
});

// Get all customers API
app.get("/api/customers", (req, res) => {
  db.query("SELECT * FROM customers ORDER BY date DESC", (err, results) => {
    if (err) {
      console.error("❌ Error fetching customers:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// Search API
app.get("/api/customers/search", (req, res) => {
  const searchTerm = `%${req.query.term}%`;

  const query = `
    SELECT * FROM customers
    WHERE name LIKE ? OR phone LIKE ? OR item LIKE ?
  `;

  db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("❌ Search error:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
