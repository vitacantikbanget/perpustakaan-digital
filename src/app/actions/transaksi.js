'use server';

import db from '@/lib/db';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

// 1. Fungsi Peminjam Mengajukan Peminjaman
export async function ajukanPeminjaman(formData) {
    const user = await getCurrentUser();
    if (!user || user.Role !== 'peminjam') return { error: 'Akses ditolak' };

    const BukuID = formData.get('buku_id');
    const TanggalPeminjaman = new Date().toISOString().split('T')[0];
    const TanggalPengembalian = formData.get('tgl_kembali');

    if (!BukuID || !TanggalPengembalian) return { error: 'Data tidak lengkap' };
    if (TanggalPengembalian < TanggalPeminjaman) return { error: 'Tanggal tidak valid!' };

    // CEK STOK
    const buku = await db.query('SELECT Stok FROM buku WHERE BukuID = ?', [BukuID]);
    if (buku.length === 0 || buku[0].Stok <= 0) {
        return { error: 'Stok buku habis!' };
    }

    // KURANGI STOK
    await db.query('UPDATE buku SET Stok = Stok - 1 WHERE BukuID = ?', [BukuID]);

    // SIMPAN PEMINJAMAN
    await db.query(
        'INSERT INTO peminjaman (UserID, BukuID, TanggalPeminjaman, TanggalPengembalian, StatusPeminjaman) VALUES (?, ?, ?, ?, ?)',
        [user.UserID, BukuID, TanggalPeminjaman, TanggalPengembalian, 'Dipinjam']
    );

    revalidatePath('/dashboard/peminjaman');
    revalidatePath('/dashboard/buku');
    return { success: true };
}

// 2. Ambil Riwayat Peminjaman
export async function getRiwayatPeminjaman() {
    const user = await getCurrentUser();
    if (!user) return [];

    const query = `
    SELECT p.*, b.Judul 
    FROM peminjaman p
    JOIN buku b ON p.BukuID = b.BukuID
    WHERE p.UserID = ?
    ORDER BY p.PeminjamanID DESC
  `;
    return await db.query(query, [user.UserID]);
}

// 3. Kirim Ulasan (Hanya ada SATU fungsi ini sekarang)
export async function kirimUlasan(formData) {
    const user = await getCurrentUser();
    if (!user || user.Role !== 'peminjam') return { error: 'Akses ditolak' };

    const BukuID = formData.get('buku_id');
    const Ulasan = formData.get('ulasan');
    const Rating = formData.get('rating');

    if (!Ulasan || !Rating) return { error: 'Ulasan dan Rating wajib diisi!' };

    await db.query(
        'INSERT INTO ulasanbuku (UserID, BukuID, Ulasan, Rating) VALUES (?, ?, ?, ?)',
        [user.UserID, BukuID, Ulasan, Rating]
    );

    revalidatePath(`/dashboard/buku/${BukuID}`); // Revalidate halaman detail
    return { success: true };
}