
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // your MySQL root password
  database: "schoolportal_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});


//login
// login
// LOGIN endpoint for both students & teachers
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // First check student accounts
  const studentQuery = "SELECT student_id AS username, password_hash, 'student' AS role FROM accounts WHERE student_id = ?";
  db.query(studentQuery, [username], (err, studentResults) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });

    if (studentResults.length > 0) {
      const student = studentResults[0];
      if (password === student.password_hash) {
        return res.json({ success: true, role: "student", username: student.username });
      } else {
        return res.status(400).json({ success: false, message: "Invalid password" });
      }
    }

    // If not a student, check teacher accounts
    const teacherQuery = "SELECT teacher_id AS username, password_hash, 'teacher' AS role FROM teacher_accounts WHERE teacher_id = ?";
    db.query(teacherQuery, [username], (err, teacherResults) => {
      if (err) return res.status(500).json({ success: false, message: "Server error" });

      if (teacherResults.length > 0) {
        const teacher = teacherResults[0];
        if (password === teacher.password_hash) {
          return res.json({ success: true, role: "teacher", username: teacher.username });
        } else {
          return res.status(400).json({ success: false, message: "Invalid password" });
        }
      }

      // Not found in either table
      return res.status(404).json({ success: false, message: "User not found" });
    });
  });
});











//get the information for dashboard
//get the information for dashboard
app.get("/student/dashboard/:student_id", (req, res) => {
  const student_id = req.params.student_id;

  const selectQuery = `
    SELECT 
      a.student_id, 
      CONCAT(s.first_name, ' ', s.middle_name, '. ', s.last_name) AS full_name, 
      c.course_name AS course, 
      y.year_level_name AS year_level, 
      AVG(g.final_grade) AS average_final 
    FROM accounts a
    JOIN students s ON a.studentUser_id = s.studentUser_id 
    JOIN courses c ON s.course_id = c.course_id 
    JOIN year_levels y ON s.year_level_id = y.year_level_id 
    JOIN grades g ON s.studentUser_id = g.studentUser_id 
    WHERE a.student_id = ? 
    GROUP BY a.student_id, full_name, c.course_name, y.year_level_name;
  `;

  db.query(selectQuery, [student_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(rows[0]); // ✅ return only one row
  });
});









// Change password API
// Change password API (plain text version - NOT SECURE)
app.put("/api/change-password", (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  const query = "SELECT * FROM accounts WHERE student_id = ?";
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid username" });
    }

    const user = results[0];

    // ✅ Just compare plain text
    if (oldPassword !== user.password_hash) {
      return res.status(400).json({ success: false, message: "Invalid old password" });
    }

    // ✅ Store new password as plain text
    const updateQuery = "UPDATE accounts SET password_hash = ? WHERE student_id = ?";
    db.query(updateQuery, [newPassword, username], (err) => {
      if (err) return res.status(500).json({ success: false, message: "Update failed" });

      return res.json({ success: true, message: "Password changed successfully" });
    });
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});