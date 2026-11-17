import { getCurrentUser } from '../../../actions/auth';
import { getDetailBuku } from '../../../actions/buku';
import { kirimUlasan } from '../../../actions/transaksi';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DetailBukuPage({ params }) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    // Await params di Next.js 15+
    const { id } = await params;
    const buku = await getDetailBuku(id);

    if (!buku) {
        return <div className="p-8 text-center text-black">Buku tidak ditemukan.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black">Detail Buku</h1>
                    <Link href="/dashboard/buku" className="text-blue-600 hover:underline">
                        &larr; Kembali ke Daftar Buku
                    </Link>
                </div>

                {/* INFO BUKU */}
                <div className="bg-white p-6 rounded shadow mb-6 flex flex-col md:flex-row gap-6 text-black">
                    {buku.Gambar ? (
                        <img src={`/uploads/${buku.Gambar}`} alt={buku.Judul} className="w-48 h-64 object-cover rounded" />
                    ) : (
                        <div className="w-48 h-64 bg-gray-200 flex items-center justify-center rounded text-gray-500">No Image</div>
                    )}

                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2">{buku.Judul}</h2>
                        <p className="text-gray-600 mb-4">oleh <span className="font-semibold">{buku.Penulis}</span></p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Penerbit</p>
                                <p className="font-medium">{buku.Penerbit} ({buku.TahunTerbit})</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Kategori</p>
                                <p className="font-medium">{buku.Kategori || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Stok Tersedia</p>
                                <p className={`font-bold ${buku.Stok > 0 ? 'text-green-600' : 'text-red-600'}`}>{buku.Stok} Buku</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rating Rata-rata</p>
                                <p className="font-bold text-yellow-500">⭐ {buku.RataRata} ({buku.TotalUlasan} Ulasan)</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">Deskripsi / Sinopsis</p>
                            <p className="text-gray-800 text-sm leading-relaxed">{buku.Deskripsi || 'Belum ada deskripsi.'}</p>
                        </div>
                    </div>
                </div>

                {/* AREA ULASAN */}
                <div className="bg-white p-6 rounded shadow text-black">
                    <h3 className="text-xl font-bold mb-4">Ulasan Pembaca</h3>

                    {/* FORM TAMBAH ULASAN (Hanya Peminjam) */}
                    {user.Role === 'peminjam' && (
                        <form action={async (formData) => {
                            'use server';
                            await kirimUlasan(formData);
                        }} className="mb-6 p-4 border rounded bg-gray-50">
                            <input type="hidden" name="buku_id" value={buku.BukuID} />
                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                                <select name="rating" required className="border p-2 rounded w-full md:w-1/3">
                                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                    <option value="4">⭐⭐⭐⭐ (4)</option>
                                    <option value="3">⭐⭐⭐ (3)</option>
                                    <option value="2">⭐⭐ (2)</option>
                                    <option value="1">⭐ (1)</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">Ulasan</label>
                                <textarea name="ulasan" required rows="3" placeholder="Tulis ulasanmu di sini..." className="border p-2 rounded w-full"></textarea>
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Kirim Ulasan
                            </button>
                        </form>
                    )}

                    {/* DAFTAR ULASAN */}
                    <div className="space-y-4">
                        {buku.DaftarUlasan.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center">Belum ada ulasan untuk buku ini.</p>
                        ) : (
                            buku.DaftarUlasan.map((u) => (
                                <div key={u.UlasanID} className="border-b pb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-sm">{u.NamaLengkap}</span>
                                        <span className="text-yellow-500 text-sm">{'⭐'.repeat(u.Rating)}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{u.Ulasan}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}