-- SIKESULIN - Sistem Surat Keluar, Masuk, dan Disposisi Kelurahan Sungai Ulin
-- Jalankan file ini sekali di database MySQL Anda (mis. via phpMyAdmin atau CLI).

CREATE DATABASE IF NOT EXISTS pkk_sikesulin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pkk_sikesulin;

-- Tabel pengguna admin/operator
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  role ENUM('admin', 'operator', 'pimpinan') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, password, nama_lengkap, role)
VALUES ('admin', 'admin123', 'Administrator SIKESULIN', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Tabel surat masuk
CREATE TABLE IF NOT EXISTS surat_masuk (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL,
  pengirim VARCHAR(150) NOT NULL,
  perihal VARCHAR(200) NOT NULL,
  keterangan TEXT NULL,
  status ENUM('baru', 'proses', 'selesai', 'arsip') DEFAULT 'baru',
  file_path VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tanggal_surat (tanggal_surat),
  INDEX idx_nomor_surat (nomor_surat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel surat keluar
CREATE TABLE IF NOT EXISTS surat_keluar (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL,
  tujuan VARCHAR(150) NOT NULL,
  perihal VARCHAR(200) NOT NULL,
  keterangan TEXT NULL,
  status ENUM('draft', 'dikirim', 'arsip') DEFAULT 'draft',
  file_path VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tanggal_surat (tanggal_surat),
  INDEX idx_nomor_surat (nomor_surat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel disposisi (terkait surat masuk)
CREATE TABLE IF NOT EXISTS disposisi (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  surat_masuk_id INT UNSIGNED NOT NULL,
  tanggal_disposisi DATE NOT NULL,
  diteruskan_kepada VARCHAR(150) NOT NULL,
  isi_disposisi TEXT NOT NULL,
  catatan TEXT NULL,
  status ENUM('proses', 'selesai', 'arsip') DEFAULT 'proses',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_disposisi_surat_masuk
    FOREIGN KEY (surat_masuk_id) REFERENCES surat_masuk(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_tanggal_disposisi (tanggal_disposisi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

