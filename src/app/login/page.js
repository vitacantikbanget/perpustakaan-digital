'use client';

import { useState } from 'react';
import { loginAction } from '../actions/auth';
import Link from 'next/link';

export default function LoginPage() {
    const [error, setError] = useState('');

    async function handleSubmit(formData) {
        const res = await loginAction(formData);
        if (res?.error) setError(res.error);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Login Perpustakaan</h1>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form action={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" name="username" required className="mt-1 block w-full border border-gray-300 rounded p-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" required className="mt-1 block w-full border border-gray-300 rounded p-2 text-black" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Masuk
                    </button>
                </form>
                <p className="text-center text-sm mt-4 text-gray-600">
                    Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline">Daftar di sini</Link>
                </p>
            </div>
        </div>
    );
}