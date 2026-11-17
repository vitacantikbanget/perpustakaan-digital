import { getCurrentUser } from '../../actions/auth';
import db from '@/lib/db';
import { getKategori, tambahBuku, hapusBuku } from '../../actions/buku';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ajukanPeminjaman } from '../../actions/transaksi';

export default async function BukuPage({ searchParams }) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const canEdit = user.Role === 'admin' || user.Role === 'petugas';

    // Ambil parameter dari URL (Search, Filter, Halaman)
    const params = await searchParams;
    const search = params?.search || '';
    const kategoriFilter = params?.kategori || '';
    const currentPage = Number(params?.page) || 1;
    const itemsPerPage = 5; // Tampilkan 5 buku per halaman
    const offset = (currentPage - 1) * itemsPerPage;

    // Query Dasar
    let query = `
        SELECT b.*, GROUP_CONCAT(k.NamaKategori SEPARATOR ', ') as Kategori 
        FROM buku b
        LEFT JOIN kategoribuku_relasi r ON b.BukuID = r.BukuID
        LEFT JOIN kategoribuku k ON r.KategoriID = k.KategoriID
        WHERE 1=1
    `;
    let queryParams = [];

    // Terapkan Pencarian (Berdasarkan Judul atau Penulis)
    if (search) {
        query += ` AND (b.Judul LIKE ? OR b.Penulis LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Terapkan Filter Kategori
    if (kategoriFilter) {
        query += ` AND k.KategoriID = ?`;
        queryParams.push(kategoriFilter);
    }

    // Group by dan Limit (Pagination)
    query += ` GROUP BY b.BukuID ORDER BY b.BukuID ASC LIMIT ? OFFSET ?`;
    queryParams.push(itemsPerPage, offset);

    const daftarBuku = await db.query(query, queryParams);
    const daftarKategori = await getKategori();

    // Hitung Total Data untuk Pagination
    let countQuery = `
        SELECT COUNT(DISTINCT b.BukuID) as total 
        FROM buku b
        LEFT JOIN kategoribuku_relasi r ON b.BukuID = r.BukuID
        LEFT JOIN kategoribuku k ON r.KategoriID = k.KategoriID
        WHERE 1=1
    `;
    let countParams = [];
    if (search) {
        countQuery += ` AND (b.Judul LIKE ? OR b.Penulis LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`);
    }
    if (kategoriFilter) {
        countQuery += ` AND k.KategoriID = ?`;
        countParams.push(kategoriFilter);
    }

    const totalDataResult = await db.query(countQuery, countParams);
    const totalData = totalDataResult[0].total;
    const totalPages = Math.ceil(totalData / itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black">
                        {canEdit ? 'Pendataan Buku' : 'Daftar Buku'}
                    </h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        &larr; Kembali ke Dashboard
                    </Link>
                </div>

                {/* FORM TAMBAH BUKU */}
                {canEdit && (
                    <div className="bg-white p-6 rounded shadow mb-8 text-black">
                        <h2 className="text-lg font-semibold mb-4">Tambah Buku Baru</h2>
                        <form action={async (formData) => {
                            'use server';
                            await tambahBuku(formData);
                        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="judul" placeholder="Judul Buku" required className="border p-2 rounded" />
                            <input type="text" name="penulis" placeholder="Penulis" required className="border p-2 rounded" />
                            <input type="text" name="penerbit" placeholder="Penerbit" required className="border p-2 rounded" />
                            <input type="number" name="tahun" placeholder="Tahun Terbit" required className="border p-2 rounded" />
                            <input type="number" name="stok" placeholder="Jumlah Stok" defaultValue="1" required className="border p-2 rounded" />
                            <select name="kategori" className="border p-2 rounded">
                                <option value="">-- Pilih Kategori --</option>
                                {daftarKategori.map((k) => (
                                    <option key={k.KategoriID} value={k.KategoriID}>{k.NamaKategori}</option>
                                ))}
                            </select>
                            <textarea name="deskripsi" placeholder="Deskripsi / Sinopsis Buku" rows="2" className="border p-2 rounded md:col-span-2"></textarea>
                            <input type="file" name="gambar" accept="image/*" className="border p-2 rounded md:col-span-2" />

                            <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700 md:col-span-2">
                                Simpan Buku
                            </button>
                        </form>
                    </div>
                )}

                {/* FITUR PENCARIAN & FILTER */}
                <div className="bg-white p-4 rounded shadow mb-4 text-black">
                    <form className="flex flex-col md:flex-row gap-4" method="GET">
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Cari Judul atau Penulis..."
                            className="border p-2 rounded flex-1"
                        />
                        <select name="kategori" defaultValue={kategoriFilter} className="border p-2 rounded">
                            <option value="">Semua Kategori</option>
                            {daftarKategori.map((k) => (
                                <option key={k.KategoriID} value={k.KategoriID}>{k.NamaKategori}</option>
                            ))}
                        </select>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Cari
                        </button>
                        {(search || kategoriFilter) && (
                            <Link href="/dashboard/buku" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-center">
                                Reset
                            </Link>
                        )}
                    </form>
                </div>

                {/* TABEL DAFTAR BUKU */}
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left text-black">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3">No</th>
                                <th className="p-3">Gambar</th>
                                <th className="p-3">Judul</th>
                                <th className="p-3">Penulis</th>
                                <th className="p-3">Stok</th>
                                <th className="p-3">Kategori</th>
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daftarBuku.length === 0 ? (
                                <tr><td colSpan="7" className="p-4 text-center text-gray-500">Buku tidak ditemukan.</td></tr>
                            ) : (
                                daftarBuku.map((b, index) => (
                                    <tr key={b.BukuID} className="border-t">
                                        <td className="p-3">{offset + index + 1}</td>
                                        <td className="p-3">
                                            {b.Gambar ? (
                                                <img src={`/uploads/${b.Gambar}`} alt={b.Judul} className="w-12 h-16 object-cover rounded" />
                                            ) : <span className="text-gray-400 text-xs">-</span>}
                                        </td>
                                        <td className="p-3 font-semibold">
                                            {/* LINK KE HALAMAN DETAIL */}
                                            <Link href={`/dashboard/buku/${b.BukuID}`} className="text-blue-600 hover:underline">
                                                {b.Judul}
                                            </Link>
                                        </td>
                                        <td className="p-3">{b.Penulis}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${b.Stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {b.Stok}
                                            </span>
                                        </td>
                                        <td className="p-3">{b.Kategori || '-'}</td>
                                        <td className="p-3 flex gap-2">
                                            {canEdit && (
                                                <form action={async () => {
                                                    'use server';
                                                    await hapusBuku(b.BukuID);
                                                }}>
                                                    <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Hapus</button>
                                                </form>
                                            )}

                                            {!canEdit && (
                                                <>
                                                    {b.Stok > 0 ? (
                                                        <form action={async (formData) => {
                                                            'use server';
                                                            await ajukanPeminjaman(formData);
                                                        }} className="flex gap-1 items-center">
                                                            <input type="hidden" name="buku_id" value={b.BukuID} />
                                                            <input type="date" name="tgl_kembali" required min={new Date().toISOString().split('T')[0]} className="border p-1 text-xs rounded" />
                                                            <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Pinjam</button>
                                                        </form>
                                                    ) : (
                                                        <span className="text-red-500 text-xs font-bold px-2 py-1 border border-red-500 rounded">Stok Habis</span>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 text-black">
                        <div>
                            Menampilkan halaman {currentPage} dari {totalPages}
                        </div>
                        <div className="flex gap-2">
                            {/* Tombol Previous */}
                            {currentPage > 1 ? (
                                <Link
                                    href={`?search=${search}&kategori=${kategoriFilter}&page=${currentPage - 1}`}
                                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    &laquo; Prev
                                </Link>
                            ) : (
                                <span className="bg-gray-100 px-4 py-2 rounded text-gray-400 cursor-not-allowed">&laquo; Prev</span>
                            )}

                            {/* Tombol Next */}
                            {currentPage < totalPages ? (
                                <Link
                                    href={`?search=${search}&kategori=${kategoriFilter}&page=${currentPage + 1}`}
                                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Next &raquo;
                                </Link>
                            ) : (
                                <span className="bg-gray-100 px-4 py-2 rounded text-gray-400 cursor-not-allowed">Next &raquo;</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}