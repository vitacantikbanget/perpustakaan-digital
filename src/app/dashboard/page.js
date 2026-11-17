import { getCurrentUser, logoutAction } from '../actions/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    // Ambil data statistik untuk ditampilkan di Dashboard
    const totalBuku = (await db.query('SELECT COUNT(*) as total FROM buku'))[0].total;
    const totalUser = (await db.query('SELECT COUNT(*) as total FROM user WHERE Role = "peminjam"'))[0].total;
    const bukuDipinjam = (await db.query('SELECT COUNT(*) as total FROM peminjaman WHERE StatusPeminjaman = "Dipinjam"'))[0].total;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">

                {/* HEADER: Sapaan & Tombol Aksi */}
                <div className="bg-white p-6 rounded shadow text-black mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-gray-600">Selamat datang, <span className="font-semibold">{user.NamaLengkap}</span> ({user.Role})</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/profil" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
                            Profil
                        </Link>
                        <form action={logoutAction}>
                            <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                                Logout
                            </button>
                        </form>
                    </div>
                </div>

                {/* STATISTIK CARDS (Hanya Admin & Petugas) */}
                {(user.Role === 'admin' || user.Role === 'petugas') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500 text-black">
                            <p className="text-gray-500 text-sm">Total Buku</p>
                            <p className="text-3xl font-bold">{totalBuku}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500 text-black">
                            <p className="text-gray-500 text-sm">Total Peminjam</p>
                            <p className="text-3xl font-bold">{totalUser}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500 text-black">
                            <p className="text-gray-500 text-sm">Buku Sedang Dipinjam</p>
                            <p className="text-3xl font-bold">{bukuDipinjam}</p>
                        </div>
                    </div>
                )}

                {/* MENU BERDASARKAN ROLE */}
                <div className="bg-white p-6 rounded shadow text-black">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">Menu Navigasi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Menu Administrator */}
                        {user.Role === 'admin' && (
                            <>
                                <MenuCard title="Kelola User" href="/dashboard/user" />
                                <MenuCard title="Pendataan Buku" href="/dashboard/buku" />
                                <MenuCard title="Kelola Kategori" href="/dashboard/kategori" />
                                <MenuCard title="Generate Laporan" href="/dashboard/laporan" />
                            </>
                        )}

                        {/* Menu Petugas */}
                        {user.Role === 'petugas' && (
                            <>
                                <MenuCard title="Pendataan Buku" href="/dashboard/buku" />
                                <MenuCard title="Kelola Kategori" href="/dashboard/kategori" />
                                <MenuCard title="Generate Laporan" href="/dashboard/laporan" />
                            </>
                        )}

                        {/* Menu Peminjam */}
                        {user.Role === 'peminjam' && (
                            <>
                                <MenuCard title="Daftar Buku" href="/dashboard/buku" />
                                <MenuCard title="Peminjaman Saya" href="/dashboard/peminjaman" />
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function MenuCard({ title, href }) {
    return (
        <Link href={href} className="block p-4 border rounded hover:bg-blue-50 transition text-center font-medium text-blue-700 shadow-sm">
            {title}
        </Link>
    );
}