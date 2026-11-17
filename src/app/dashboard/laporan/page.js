import { getCurrentUser } from '../../actions/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LaporanPage() {
    const user = await getCurrentUser();

    // Proteksi: Hanya Admin & Petugas
    if (!user || (user.Role !== 'admin' && user.Role !== 'petugas')) {
        redirect('/dashboard');
    }

    const query = `
    SELECT p.*, u.NamaLengkap, b.Judul 
    FROM peminjaman p
    JOIN user u ON p.UserID = u.UserID
    JOIN buku b ON p.BukuID = b.BukuID
    ORDER BY p.PeminjamanID DESC
  `;
    const laporan = await db.query(query);

    // Fungsi format tanggal (mencegah error objek Date)
    const formatTanggal = (dateObj) => {
        if (!dateObj) return '-';
        if (dateObj instanceof Date) return dateObj.toISOString().split('T')[0];
        return dateObj;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black">Laporan Peminjaman Buku</h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        &larr; Kembali
                    </Link>
                </div>

                {/* AREA LAPORAN */}
                <div className="bg-white p-8 rounded shadow text-black">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold">PERPUSTAKAAN DIGITAL</h2>
                        <p className="text-gray-600">Laporan Data Peminjaman Buku</p>
                        <hr className="mt-4 border-t-2 border-black" />
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="p-2">No</th>
                                <th className="p-2">Nama Peminjam</th>
                                <th className="p-2">Judul Buku</th>
                                <th className="p-2">Tgl Pinjam</th>
                                <th className="p-2">Tgl Kembali</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.length === 0 ? (
                                <tr><td colSpan="6" className="p-4 text-center text-gray-500">Belum ada data peminjaman.</td></tr>
                            ) : (
                                laporan.map((l, index) => (
                                    <tr key={l.PeminjamanID} className="border-b">
                                        <td className="p-2">{index + 1}</td>
                                        <td className="p-2">{l.NamaLengkap}</td>
                                        <td className="p-2">{l.Judul}</td>
                                        <td className="p-2">{formatTanggal(l.TanggalPeminjaman)}</td>
                                        <td className="p-2">{formatTanggal(l.TanggalPengembalian)}</td>
                                        <td className="p-2">{l.StatusPeminjaman}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}