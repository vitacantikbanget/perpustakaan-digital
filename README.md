# Aplikasi Perpustakaan Digital (UKK RPL)

Aplikasi berbasis web untuk manajemen perpustakaan yang dibangun menggunakan **Next.js (App Router)**, **Tailwind CSS**, dan **MySQL/MariaDB**. Project ini dibuat untuk memenuhi Ujian Kompetensi Keahlian (UKK) Rekayasa Perangkat Lunak.

## 🚀 Fitur Utama
- **Multi-Role Authentication**: Administrator, Petugas, dan Peminjam.
- **Manajemen Buku**: CRUD Buku (dengan upload cover), Stok, dan Deskripsi.
- **Manajemen Kategori**: CRUD Kategori buku.
- **Peminjaman**: Sistem pinjam buku dengan pengurangan stok otomatis.
- **Ulasan & Rating**: Peminjam dapat memberikan ulasan dan rating bintang 1-5.
- **Pencarian & Filter**: Cari buku berdasarkan judul/penulis dan filter kategori.
- **Pagination**: Tampilan data buku yang rapi per halaman.
- **Keamanan**: Password di-hash menggunakan Bcrypt.
- **Laporan**: Rekapitulasi data peminjaman untuk Admin & Petugas.
- **Dashboard**: Statistik ringkasan (Total Buku, Peminjam, dll).

## 🛠️ Prasyarat
- Node.js (v18 atau lebih baru)
- XAMPP (MySQL / MariaDB)
- Git

## 💻 Cara Instalasi & Menjalankan

1. **Clone repository ini:**
   ```bash
   git clone [URL_GITHUB_KAMU]
   cd perpustakaan-app