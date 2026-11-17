import { getCurrentUser } from '../../actions/auth';
import { getKategori } from '../../actions/buku';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function KategoriPage() {
    const user = await getCurrentUser();
    if (!user || (user.Role !== 'admin' && user.Role !== 'petugas')) {
        redirect('/dashboard');
    }

    const daftarKategori = await getKategori();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black">Kelola Kategori</h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Kembali</Link>
                </div>

                <div className="bg-white p-6 rounded shadow mb-8 text-black">
                    <h2 className="text-lg font-semibold mb-4">Tambah Kategori</h2>
                    <form action={async (formData) => {
                        'use server';
                        const nama = formData.get('nama');
                        if (nama) {
                            await db.query('INSERT INTO kategoribuku (NamaKategori) VALUES (?)', [nama]);
                            revalidatePath('/dashboard/kategori');
                        }
                    }} className="flex gap-4">
                        <input type="text" name="nama" placeholder="Nama Kategori" required className="border p-2 rounded flex-1" />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Simpan</button>
                    </form>
                </div>

                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left text-black">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3">No</th>
                                <th className="p-3">Nama Kategori</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daftarKategori.map((k, index) => (
                                <tr key={k.KategoriID} className="border-t">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{k.NamaKategori}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}