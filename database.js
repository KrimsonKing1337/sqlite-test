const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

const DBSOURCE = 'db.sqlite';

const db = new sqlite3.Database(DBSOURCE, (dataBaseError) => {
  if (dataBaseError) {
    // Cannot open database
    console.error(dataBaseError.message);

    throw dataBaseError;
  }

  console.log('Connected to the SQLite database.');

  db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
  (runCommandError) => {
    if (runCommandError) return;

    const insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)';

    db.run(insert, ['admin', 'admin@example.com', md5('admin123456')]);
    db.run(insert, ['user', 'user@example.com', md5('user123456')]);
  });
});


module.exports = db;
