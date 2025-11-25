const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'data.sqlite');

if (!fs.existsSync(DB_FILE)) {
  // file will be created by sqlite when connecting
}

const db = new sqlite3.Database(DB_FILE);

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      serialId TEXT PRIMARY KEY,
      enrollmentNo TEXT,
      fullName TEXT,
      fatherName TEXT,
      dob TEXT,
      email TEXT,
      year TEXT,
      course TEXT,
      branch TEXT,
      photoUrl TEXT,
      participationInterests TEXT,
      feeAmount TEXT,
      verificationStatus TEXT,
      checkedIn INTEGER DEFAULT 0,
      checkedInAt TEXT,
      createdAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      passwordHash TEXT
    )
  `);
});

module.exports = db;
