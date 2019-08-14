// Create express app
const express = require('express');
const bodyParser = require('body-parser');

const md5 = require('md5');
const db = require('./database.js');

const app = express();

// Server port
const HTTP_PORT = 8000;
// Start server
app.listen(HTTP_PORT, () => {
  console.log(`Server running on http://localhost:${HTTP_PORT}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Ok' });
});

// Insert here other API endpoints

app.get('/api/users-all', (req, res) => {
  const sql = 'select * from user';
  const params = [];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });

      return;
    }

    res.json({
      message: 'success',
      data: rows,
    });
  });
});

app.get('/api/user/:id', (req, res) => {
  const sql = 'select * from user where id = ?';
  const params = [req.params.id];

  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });

      return;
    }

    res.json({
      message: 'success',
      data: row,
    });
  });
});

app.post('/api/user/', (req, res) => {
  const errors = [];

  if (!req.body.password) {
    errors.push('No password specified');
  }

  if (!req.body.email) {
    errors.push('No email specified');
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });

    return;
  }

  const data = {
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password),
  };

  const sql = 'INSERT INTO user (name, email, password) VALUES (?,?,?)';
  const params = [data.name, data.email, data.password];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });

      return;
    }

    res.json({
      message: 'success',
      data,
      id: this.lastID,
    });
  });
});

app.patch('/api/user/:id', (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password ? md5(req.body.password) : null,
  };

  db.run(
    `UPDATE user set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           password = COALESCE(?,password) 
           WHERE id = ?`,
    [data.name, data.email, data.password, req.params.id],
    function (err) {
      if (err) {
        res.status(400).json({ error: res.message });

        return;
      }

      res.json({
        message: 'success',
        data,
        changes: this.changes,
      });
    },
  );
});

app.delete('/api/user/:id', (req, res) => {
  db.run(
    'DELETE FROM user WHERE id = ?',
    req.params.id,
    function (err) {
      if (err) {
        res.status(400).json({ error: res.message });

        return;
      }

      res.json({ message: 'deleted', changes: this.changes });
    },
  );
});

// Default response for any other request
app.use((req, res) => {
  res.status(404);
});
