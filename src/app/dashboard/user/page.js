import { getCurrentUser } from '../../actions/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function KelolaUserPage() {
    const user = await getCurrentUser();

    // Proteksi: Hanya Admin
    if (!user || user.Role !== 'admin') redirect('/dashboard');

    const daftarUser = await db.query('SELECT * FROM user ORDER BY UserID ASC');

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black">Kelola User</h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Kembali</Link>
                </div>

                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left text-black">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Nama Lengkap</th>
                                <th className="p-3">Username</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daftarUser.map((u) => (
                                <tr key={u.UserID} className="border-t">
                                    <td className="p-3">{u.UserID}</td>
                                    <td className="p-3">{u.NamaLengkap}</td>
                                    <td className="p-3">{u.Username}</td>
                                    <td className="p-3">
                                        {/* Form Ubah Role */}
                                        <form action={async (formData) => {
                                            'use server';
                                            const newRole = formData.get('role');
                                            await db.query('UPDATE user SET Role = ? WHERE UserID = ?', [newRole, u.UserID]);
                                            revalidatePath('/dashboard/user');
                                        }} className="flex gap-2 items-center">
                                            <select name="role" defaultValue={u.Role} className="border p-1 rounded text-sm">
                                                <option value="admin">Admin</option>
                                                <option value="petugas">Petugas</option>
                                                <option value="peminjam">Peminjam</option>
                                            </select>
                                            <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">Ubah</button>
                                        </form>
                                    </td>
                                    <td className="p-3">
                                        {/* Form Hapus User (Kecuali diri sendiri) */}
                                        {u.UserID !== user.UserID && (
                                            <form action={async () => {
                                                'use server';
                                                await db.query('DELETE FROM user WHERE UserID = ?', [u.UserID]);
                                                revalidatePath('/dashboard/user');
                                            }}>
                                                <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Hapus</button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}