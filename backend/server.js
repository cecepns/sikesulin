const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS for Vite dev server
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

app.use(express.json());
app.use('/uploads-pkk', express.static(path.join(__dirname, 'uploads-pkk')));

// Multer setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, 'uploads-pkk'));
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const upload = multer({ storage });

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pkk_sikesulin',
  waitForConnections: true,
  connectionLimit: 10,
});

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Health check error', err);
    res.status(500).json({ status: 'error' });
  }
});

// Ringkasan statistik untuk dashboard / landing
app.get('/api/stats/summary', async (_req, res) => {
  try {
    const [rowsSuratMasuk] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM surat_masuk
       WHERE MONTH(tanggal_surat) = MONTH(CURDATE())
         AND YEAR(tanggal_surat) = YEAR(CURDATE())`,
    );

    const [rowsSuratKeluar] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM surat_keluar
       WHERE MONTH(tanggal_surat) = MONTH(CURDATE())
         AND YEAR(tanggal_surat) = YEAR(CURDATE())`,
    );

    const [rowsDisposisiAktif] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM disposisi
       WHERE status = 'proses'`,
    );

    const [rowsUsers] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM users`,
    );

    const suratMasukBulanIni = rowsSuratMasuk[0]?.total || 0;
    const suratKeluarBulanIni = rowsSuratKeluar[0]?.total || 0;
    const disposisiAktif = rowsDisposisiAktif[0]?.total || 0;
    const penggunaAktif = rowsUsers[0]?.total || 0;

    res.json({
      suratMasukBulanIni,
      suratKeluarBulanIni,
      disposisiAktif,
      penggunaAktif,
    });
  } catch (err) {
    console.error('Stats summary error', err);
    res.status(500).json({ message: 'Gagal mengambil statistik' });
  }
});

// Data ringkasan dan aktivitas terbaru untuk dashboard home
app.get('/api/dashboard/overview', async (_req, res) => {
  try {
    const [rowsMasukToday] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM surat_masuk
       WHERE tanggal_surat = CURDATE()`,
    );
    const [rowsKeluarToday] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM surat_keluar
       WHERE tanggal_surat = CURDATE()`,
    );
    const [rowsDisposisiProses] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM disposisi
       WHERE status = 'proses'`,
    );
    const [rowsDisposisiSelesai] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM disposisi
       WHERE status = 'selesai'`,
    );

    const [rowsLastMasuk] = await pool.query(
      `SELECT nomor_surat, perihal, tanggal_surat AS tanggal, status
       FROM surat_masuk
       ORDER BY tanggal_surat DESC, id DESC
       LIMIT 1`,
    );
    const [rowsLastKeluar] = await pool.query(
      `SELECT nomor_surat, perihal, tanggal_surat AS tanggal, status
       FROM surat_keluar
       ORDER BY tanggal_surat DESC, id DESC
       LIMIT 1`,
    );
    const [rowsLastDisposisi] = await pool.query(
      `SELECT d.tanggal_disposisi AS tanggal, d.status, sm.nomor_surat, sm.perihal AS perihal
       FROM disposisi d
       LEFT JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
       ORDER BY d.tanggal_disposisi DESC, d.id DESC
       LIMIT 1`,
    );

    const overview = {
      suratMasukHariIni: rowsMasukToday[0]?.total || 0,
      suratKeluarHariIni: rowsKeluarToday[0]?.total || 0,
      disposisiProses: rowsDisposisiProses[0]?.total || 0,
      disposisiSelesai: rowsDisposisiSelesai[0]?.total || 0,
    };

    const aktivitasTerbaru = [];
    if (rowsLastMasuk[0]) {
      aktivitasTerbaru.push({
        jenis: 'Surat Masuk',
        ...rowsLastMasuk[0],
      });
    }
    if (rowsLastKeluar[0]) {
      aktivitasTerbaru.push({
        jenis: 'Surat Keluar',
        ...rowsLastKeluar[0],
      });
    }
    if (rowsLastDisposisi[0]) {
      aktivitasTerbaru.push({
        jenis: 'Disposisi',
        ...rowsLastDisposisi[0],
      });
    }

    res.json({
      overview,
      aktivitasTerbaru,
    });
  } catch (err) {
    console.error('Dashboard overview error', err);
    res.status(500).json({ message: 'Gagal mengambil data dashboard' });
  }
});

// Simple auth (username/password from users table)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, nama_lengkap, role FROM users WHERE username = ? AND password = ? LIMIT 1',
      [username, password],
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const user = rows[0];
    res.json({
      message: 'Login berhasil',
      user,
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Helpers
const handleDbError = (res, err, context) => {
  console.error(`${context} error`, err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
};

// Surat Masuk CRUD
app.get('/api/surat-masuk', async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page || '1', 10);
    const perPage = Number.parseInt(req.query.per_page || '10', 10);
    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safePerPage = Number.isNaN(perPage) || perPage < 1 ? 10 : perPage;
    const offset = (safePage - 1) * safePerPage;

    const [rows] = await pool.query(
      'SELECT * FROM surat_masuk ORDER BY tanggal_surat DESC, id DESC LIMIT ? OFFSET ?',
      [safePerPage, offset],
    );

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM surat_masuk');
    const total = countRows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / safePerPage));

    res.json({
      data: rows,
      pagination: {
        page: safePage,
        perPage: safePerPage,
        total,
        totalPages,
      },
    });
  } catch (err) {
    handleDbError(res, err, 'Get surat_masuk');
  }
});

app.post('/api/surat-masuk', upload.single('file'), async (req, res) => {
  const {
    nomor_surat,
    tanggal_surat,
    pengirim,
    perihal,
    keterangan,
    status,
  } = req.body;

  const file_path = req.file ? `/uploads-pkk/${req.file.filename}` : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO surat_masuk 
      (nomor_surat, tanggal_surat, pengirim, perihal, keterangan, status, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nomor_surat, tanggal_surat, pengirim, perihal, keterangan || null, status || 'baru', file_path],
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    handleDbError(res, err, 'Create surat_masuk');
  }
});

app.put('/api/surat-masuk/:id', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const {
    nomor_surat,
    tanggal_surat,
    pengirim,
    perihal,
    keterangan,
    status,
  } = req.body;

  const file_path = req.file ? `/uploads-pkk/${req.file.filename}` : req.body.file_path || null;

  try {
    await pool.query(
      `UPDATE surat_masuk
       SET nomor_surat = ?, tanggal_surat = ?, pengirim = ?, perihal = ?, keterangan = ?, status = ?, file_path = ?
       WHERE id = ?`,
      [nomor_surat, tanggal_surat, pengirim, perihal, keterangan || null, status || 'baru', file_path, id],
    );

    res.json({ message: 'Surat masuk diperbarui' });
  } catch (err) {
    handleDbError(res, err, 'Update surat_masuk');
  }
});

app.delete('/api/surat-masuk/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM surat_masuk WHERE id = ?', [id]);
    res.json({ message: 'Surat masuk dihapus' });
  } catch (err) {
    handleDbError(res, err, 'Delete surat_masuk');
  }
});

// Surat Keluar CRUD
app.get('/api/surat-keluar', async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page || '1', 10);
    const perPage = Number.parseInt(req.query.per_page || '10', 10);
    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safePerPage = Number.isNaN(perPage) || perPage < 1 ? 10 : perPage;
    const offset = (safePage - 1) * safePerPage;

    const [rows] = await pool.query(
      'SELECT * FROM surat_keluar ORDER BY tanggal_surat DESC, id DESC LIMIT ? OFFSET ?',
      [safePerPage, offset],
    );

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM surat_keluar');
    const total = countRows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / safePerPage));

    res.json({
      data: rows,
      pagination: {
        page: safePage,
        perPage: safePerPage,
        total,
        totalPages,
      },
    });
  } catch (err) {
    handleDbError(res, err, 'Get surat_keluar');
  }
});

app.post('/api/surat-keluar', upload.single('file'), async (req, res) => {
  const {
    nomor_surat,
    tanggal_surat,
    tujuan,
    perihal,
    keterangan,
    status,
  } = req.body;

  const file_path = req.file ? `/uploads-pkk/${req.file.filename}` : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO surat_keluar 
      (nomor_surat, tanggal_surat, tujuan, perihal, keterangan, status, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nomor_surat, tanggal_surat, tujuan, perihal, keterangan || null, status || 'draft', file_path],
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    handleDbError(res, err, 'Create surat_keluar');
  }
});

app.put('/api/surat-keluar/:id', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const {
    nomor_surat,
    tanggal_surat,
    tujuan,
    perihal,
    keterangan,
    status,
  } = req.body;

  const file_path = req.file ? `/uploads-pkk/${req.file.filename}` : req.body.file_path || null;

  try {
    await pool.query(
      `UPDATE surat_keluar
       SET nomor_surat = ?, tanggal_surat = ?, tujuan = ?, perihal = ?, keterangan = ?, status = ?, file_path = ?
       WHERE id = ?`,
      [nomor_surat, tanggal_surat, tujuan, perihal, keterangan || null, status || 'draft', file_path, id],
    );

    res.json({ message: 'Surat keluar diperbarui' });
  } catch (err) {
    handleDbError(res, err, 'Update surat_keluar');
  }
});

app.delete('/api/surat-keluar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM surat_keluar WHERE id = ?', [id]);
    res.json({ message: 'Surat keluar dihapus' });
  } catch (err) {
    handleDbError(res, err, 'Delete surat_keluar');
  }
});

// Disposisi CRUD (berkaitan dengan surat_masuk)
app.get('/api/disposisi', async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page || '1', 10);
    const perPage = Number.parseInt(req.query.per_page || '10', 10);
    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safePerPage = Number.isNaN(perPage) || perPage < 1 ? 10 : perPage;
    const offset = (safePage - 1) * safePerPage;

    const [rows] = await pool.query(
      `SELECT d.*, sm.nomor_surat, sm.perihal AS perihal_surat
       FROM disposisi d
       LEFT JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
       ORDER BY d.tanggal_disposisi DESC, d.id DESC
       LIMIT ? OFFSET ?`,
      [safePerPage, offset],
    );

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM disposisi');
    const total = countRows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / safePerPage));

    res.json({
      data: rows,
      pagination: {
        page: safePage,
        perPage: safePerPage,
        total,
        totalPages,
      },
    });
  } catch (err) {
    handleDbError(res, err, 'Get disposisi');
  }
});

app.post('/api/disposisi', async (req, res) => {
  const {
    surat_masuk_id,
    tanggal_disposisi,
    diteruskan_kepada,
    isi_disposisi,
    catatan,
    status,
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO disposisi
      (surat_masuk_id, tanggal_disposisi, diteruskan_kepada, isi_disposisi, catatan, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        surat_masuk_id,
        tanggal_disposisi,
        diteruskan_kepada,
        isi_disposisi,
        catatan || null,
        status || 'proses',
      ],
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    handleDbError(res, err, 'Create disposisi');
  }
});

app.put('/api/disposisi/:id', async (req, res) => {
  const { id } = req.params;
  const {
    surat_masuk_id,
    tanggal_disposisi,
    diteruskan_kepada,
    isi_disposisi,
    catatan,
    status,
  } = req.body;

  try {
    await pool.query(
      `UPDATE disposisi
       SET surat_masuk_id = ?, tanggal_disposisi = ?, diteruskan_kepada = ?, isi_disposisi = ?, catatan = ?, status = ?
       WHERE id = ?`,
      [
        surat_masuk_id,
        tanggal_disposisi,
        diteruskan_kepada,
        isi_disposisi,
        catatan || null,
        status || 'proses',
        id,
      ],
    );

    res.json({ message: 'Disposisi diperbarui' });
  } catch (err) {
    handleDbError(res, err, 'Update disposisi');
  }
});

app.delete('/api/disposisi/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM disposisi WHERE id = ?', [id]);
    res.json({ message: 'Disposisi dihapus' });
  } catch (err) {
    handleDbError(res, err, 'Delete disposisi');
  }
});

app.listen(PORT, () => {
  console.log(`SIKESULIN backend running on http://localhost:${PORT}`);
});

