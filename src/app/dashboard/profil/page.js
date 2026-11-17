'use client';

import { useState } from 'react';
import { gantiPasswordAction } from '../../actions/auth';
import Link from 'next/link';

export default function ProfilPage() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData) {
        setError('');
        setSuccess('');
        setLoading(true);

        const res = await gantiPasswordAction(formData);
        setLoading(false);

        if (res?.error) setError(res.error);
        if (res?.success) setSuccess('Password berhasil diubah!');
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-black">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">Ganti Password</h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">&larr; Kembali</Link>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

                <form action={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Password Lama</label>
                        <input type="password" name="password_lama" required className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password Baru</label>
                        <input type="password" name="password_baru" required className="border p-2 rounded w-full" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Menyimpan...' : 'Simpan Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}