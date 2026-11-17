import { getCurrentUser } from '../../actions/auth';
import { getRiwayatPeminjaman } from '../../actions/transaksi';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PeminjamanPage() {
    const user = await getCurrentUser();
    if (!user || user.Role !== 'peminjam') {
        redirect('/dashboard');
    }

    const riwayat = await getRiwayatPeminjaman();

    // FUNGSI BANTU: Untuk mengubah objek Date menjadi string format Indonesia (YYYY-MM-DD)
    const formatTanggal = (dateObj) => {
        if (!dateObj) return '-';
        // Jika mysql2 mengembalikan objek Date
        if (dateObj instanceof Date) {
            return dateObj.toISOString().split('T')[0];
        }
        // Jika sudah berupa string, langsung kembalikan
        return dateObj;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black">Riwayat Peminjaman Saya</h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Kembali</Link>
                </div>

                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left text-black">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3">No</th>
                                <th className="p-3">Judul Buku</th>
                                <th className="p-3">Tanggal Pinjam</th>
                                <th className="p-3">Tanggal Kembali</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayat.length === 0 ? (
                                <tr><td colSpan="5" className="p-4 text-center text-gray-500">Belum ada riwayat peminjaman.</td></tr>
                            ) : (
                                riwayat.map((p, index) => (
                                    <tr key={p.PeminjamanID} className="border-t">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">{p.Judul}</td>
                                        {/* GUNAKAN FUNGSI formatTanggal DI SINI */}
                                        <td className="p-3">{formatTanggal(p.TanggalPeminjaman)}</td>
                                        <td className="p-3">{formatTanggal(p.TanggalPengembalian)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${p.StatusPeminjaman === 'Dipinjam' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                                                {p.StatusPeminjaman}
                                            </span>
                                        </td>
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