const path = require('path');
const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function buildStudentPayload(student, descriptorRows) {
  const descriptors = descriptorRows
    .filter(row => row.student_id === student.id)
    .map(row => {
      try {
        const parsed = typeof row.descriptor === 'string'
          ? JSON.parse(row.descriptor)
          : row.descriptor;
        return Array.isArray(parsed) ? parsed.map(Number) : [];
      } catch (error) {
        console.warn('Failed to parse descriptor for student', student.id, error);
        return [];
      }
    })
    .filter(item => item.length);

  return {
    id: student.id,
    courseId: student.course_id,
    name: student.name,
    createdAt: student.created_at,
    descriptors
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/courses', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, created_at FROM courses ORDER BY created_at DESC'
  );
  res.json(rows.map(row => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at
  })));
}));

app.post('/api/courses', asyncHandler(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ message: 'Course name is required.' });
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.query(
      'SELECT id, name, created_at FROM courses WHERE LOWER(name) = LOWER(?) LIMIT 1',
      [name]
    );

    if (existingRows.length) {
      await connection.commit();
      res.status(200).json({
        course: {
          id: existingRows[0].id,
          name: existingRows[0].name,
          createdAt: existingRows[0].created_at
        },
        created: false
      });
      return;
    }

    const [result] = await connection.query(
      'INSERT INTO courses (name) VALUES (?)',
      [name]
    );

    const [insertedRows] = await connection.query(
      'SELECT id, name, created_at FROM courses WHERE id = ?',
      [result.insertId]
    );
    await connection.commit();

    res.status(201).json({
      course: {
        id: insertedRows[0].id,
        name: insertedRows[0].name,
        createdAt: insertedRows[0].created_at
      },
      created: true
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.get('/api/courses/:courseId/students', asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (Number.isNaN(courseId)) {
    res.status(400).json({ message: 'Invalid course id.' });
    return;
  }

  const [courseRows] = await pool.query(
    'SELECT id FROM courses WHERE id = ? LIMIT 1',
    [courseId]
  );
  if (!courseRows.length) {
    res.status(404).json({ message: 'Course not found.' });
    return;
  }

  const [students] = await pool.query(
    'SELECT id, course_id, name, created_at FROM students WHERE course_id = ? ORDER BY name ASC',
    [courseId]
  );

  if (!students.length) {
    res.json([]);
    return;
  }

  const studentIds = students.map(student => student.id);
  const [descriptorRows] = await pool.query(
    `SELECT student_id, descriptor FROM face_descriptors WHERE student_id IN (${studentIds.map(() => '?').join(',')})`,
    studentIds
  );

  res.json(students.map(student => buildStudentPayload(student, descriptorRows)));
}));

app.post('/api/courses/:courseId/students', asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (Number.isNaN(courseId)) {
    res.status(400).json({ message: 'Invalid course id.' });
    return;
  }

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const descriptorsPayload = Array.isArray(req.body.descriptors)
    ? req.body.descriptors
    : req.body.descriptor
      ? [req.body.descriptor]
      : [];

  if (!name) {
    res.status(400).json({ message: 'Student name is required.' });
    return;
  }

  if (!descriptorsPayload.length) {
    res.status(400).json({ message: 'At least one face descriptor is required.' });
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [courseRows] = await connection.query(
      'SELECT id FROM courses WHERE id = ? LIMIT 1',
      [courseId]
    );
    if (!courseRows.length) {
      await connection.rollback();
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    const [existingRows] = await connection.query(
      'SELECT id, course_id, name, created_at FROM students WHERE course_id = ? AND LOWER(name) = LOWER(?) LIMIT 1',
      [courseId, name]
    );

    let studentId;
    let studentRecord;

    if (existingRows.length) {
      studentId = existingRows[0].id;
      studentRecord = existingRows[0];
    } else {
      const [insertResult] = await connection.query(
        'INSERT INTO students (course_id, name) VALUES (?, ?)',
        [courseId, name]
      );
      studentId = insertResult.insertId;
      const [studentRows] = await connection.query(
        'SELECT id, course_id, name, created_at FROM students WHERE id = ?',
        [studentId]
      );
      studentRecord = studentRows[0];
    }

    const descriptorTuples = descriptorsPayload.map(item => {
      const descriptorArray = Array.isArray(item) ? item.map(Number) : [];
      if (!descriptorArray.length) {
        return null;
      }
      return [studentId, JSON.stringify(descriptorArray)];
    }).filter(Boolean);

    if (!descriptorTuples.length) {
      await connection.rollback();
      res.status(400).json({ message: 'Provided descriptor payload is invalid.' });
      return;
    }

    await connection.query(
      'INSERT INTO face_descriptors (student_id, descriptor) VALUES ?',
      [descriptorTuples]
    );

    const [descriptorRows] = await connection.query(
      'SELECT student_id, descriptor FROM face_descriptors WHERE student_id = ?',
      [studentId]
    );

    await connection.commit();
    res.status(201).json(buildStudentPayload(studentRecord, descriptorRows));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.get('/api/courses/:courseId/attendance', asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (Number.isNaN(courseId)) {
    res.status(400).json({ message: 'Invalid course id.' });
    return;
  }

  const [rows] = await pool.query(
    `SELECT a.id,
            a.student_id AS studentId,
            s.name AS studentName,
            a.course_id AS courseId,
            c.name AS courseName,
            a.recorded_at AS recordedAt
     FROM attendance a
     INNER JOIN students s ON s.id = a.student_id
     INNER JOIN courses c ON c.id = a.course_id
     WHERE a.course_id = ?
     ORDER BY a.recorded_at DESC`,
    [courseId]
  );
  res.json(rows);
}));

app.post('/api/courses/:courseId/attendance', asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const studentId = Number(req.body.studentId);
  const timestamp = req.body.timestamp;

  if (Number.isNaN(courseId) || Number.isNaN(studentId)) {
    res.status(400).json({ message: 'Invalid course or student id.' });
    return;
  }

  const recordedAt = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(recordedAt.getTime())) {
    res.status(400).json({ message: 'Invalid timestamp.' });
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [validationRows] = await connection.query(
      'SELECT id FROM students WHERE id = ? AND course_id = ? LIMIT 1',
      [studentId, courseId]
    );
    if (!validationRows.length) {
      await connection.rollback();
      res.status(404).json({ message: 'Student not found in this course.' });
      return;
    }

    const [result] = await connection.query(
      'INSERT INTO attendance (student_id, course_id, recorded_at) VALUES (?, ?, ?)',
      [studentId, courseId, recordedAt]
    );

    const [rows] = await connection.query(
      `SELECT a.id,
              a.student_id AS studentId,
              s.name AS studentName,
              a.course_id AS courseId,
              c.name AS courseName,
              a.recorded_at AS recordedAt
       FROM attendance a
       INNER JOIN students s ON s.id = a.student_id
       INNER JOIN courses c ON c.id = a.course_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    await connection.commit();
    res.status(201).json(rows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error.' });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
