'use client';

import { useState } from 'react';
import { registerAction } from '../actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleSubmit(formData) {
        setError('');
        const res = await registerAction(formData);
        if (res?.error) {
            setError(res.error);
        } else if (res?.success) {
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Registrasi Peminjam</h1>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-4">Registrasi berhasil! Mengarahkan ke login...</p>}

                <form action={handleSubmit} className="flex flex-col gap-4 text-black">
                    <input type="text" name="username" placeholder="Username" required className="border p-2 rounded" />
                    <input type="password" name="password" placeholder="Password" required className="border p-2 rounded" />
                    <input type="email" name="email" placeholder="Email" required className="border p-2 rounded" />
                    <input type="text" name="nama" placeholder="Nama Lengkap" required className="border p-2 rounded" />
                    <textarea name="alamat" placeholder="Alamat" rows="2" className="border p-2 rounded"></textarea>
                    <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Daftar
                    </button>
                </form>

                <p className="text-center text-sm mt-4 text-gray-600">
                    Sudah punya akun? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}