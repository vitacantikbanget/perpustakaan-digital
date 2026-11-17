'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';

// 1. Ambil semua data buku
export async function getBuku() {
    const query = `
    SELECT b.*, GROUP_CONCAT(k.NamaKategori SEPARATOR ', ') as Kategori 
    FROM buku b
    LEFT JOIN kategoribuku_relasi r ON b.BukuID = r.BukuID
    LEFT JOIN kategoribuku k ON r.KategoriID = k.KategoriID
    GROUP BY b.BukuID
  `;
    return await db.query(query);
}

// 2. Ambil semua kategori
export async function getKategori() {
    return await db.query('SELECT * FROM kategoribuku');
}

// 3. Tambah Buku (Dengan Stok & Deskripsi)
export async function tambahBuku(formData) {
    const Judul = formData.get('judul');
    const Penulis = formData.get('penulis');
    const Penerbit = formData.get('penerbit');
    const TahunTerbit = formData.get('tahun');
    const Stok = formData.get('stok');
    const Deskripsi = formData.get('deskripsi');
    const KategoriID = formData.get('kategori');
    const file = formData.get('gambar');

    if (!Judul || !Penulis || !Penerbit || !TahunTerbit) {
        return { error: 'Semua field wajib diisi!' };
    }

    let namaFileGambar = null;
    if (file && file.size > 0 && file.name !== 'undefined') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        namaFileGambar = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const pathFile = path.join(process.cwd(), 'public/uploads', namaFileGambar);
        await writeFile(pathFile, buffer);
    }

    const result = await db.query(
        'INSERT INTO buku (Judul, Penulis, Penerbit, TahunTerbit, Stok, Deskripsi, Gambar) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [Judul, Penulis, Penerbit, TahunTerbit, Stok || 1, Deskripsi, namaFileGambar]
    );

    if (KategoriID) {
        await db.query(
            'INSERT INTO kategoribuku_relasi (BukuID, KategoriID) VALUES (?, ?)',
            [result.insertId, KategoriID]
        );
    }

    revalidatePath('/dashboard/buku');
    return { success: true };
}

// 4. Hapus Buku
export async function hapusBuku(BukuID) {
    const buku = await db.query('SELECT Gambar FROM buku WHERE BukuID = ?', [BukuID]);
    await db.query('DELETE FROM buku WHERE BukuID = ?', [BukuID]);

    if (buku.length > 0 && buku[0].Gambar) {
        const pathFile = path.join(process.cwd(), 'public/uploads', buku[0].Gambar);
        try {
            const { unlink } = await import('fs/promises');
            await unlink(pathFile);
        } catch (e) { }
    }

    revalidatePath('/dashboard/buku');
    return { success: true };
}

// 5. Ambil Detail 1 Buku + Rata-rata Rating
export async function getDetailBuku(BukuID) {
    const queryBuku = `
    SELECT b.*, GROUP_CONCAT(k.NamaKategori SEPARATOR ', ') as Kategori 
    FROM buku b
    LEFT JOIN kategoribuku_relasi r ON b.BukuID = r.BukuID
    LEFT JOIN kategoribuku k ON r.KategoriID = k.KategoriID
    WHERE b.BukuID = ?
    GROUP BY b.BukuID
  `;
    const buku = await db.query(queryBuku, [BukuID]);

    if (buku.length === 0) return null;

    // Ambil rata-rata rating
    const queryRating = `
    SELECT AVG(Rating) as RataRata, COUNT(UlasanID) as TotalUlasan 
    FROM ulasanbuku WHERE BukuID = ?
  `;
    const rating = await db.query(queryRating, [BukuID]);

    // Ambil daftar ulasan
    const queryUlasan = `
    SELECT u.*, us.NamaLengkap 
    FROM ulasanbuku u
    JOIN user us ON u.UserID = us.UserID
    WHERE u.BukuID = ?
    ORDER BY u.UlasanID DESC
  `;
    const ulasan = await db.query(queryUlasan, [BukuID]);

    return {
        ...buku[0],
        RataRata: rating[0].RataRata ? Number(rating[0].RataRata).toFixed(1) : 0,
        TotalUlasan: rating[0].TotalUlasan,
        DaftarUlasan: ulasan
    };
}