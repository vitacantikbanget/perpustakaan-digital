'use server';

import db from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

// 1. Fungsi Login (Dengan Bcrypt)
export async function loginAction(formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    const users = await db.query('SELECT * FROM user WHERE Username = ?', [username]);

    if (users.length === 0) return { error: 'Username tidak ditemukan' };

    const user = users[0];

    // Cek password: Apakah masih teks biasa (data dummy lama) atau sudah hash?
    let isMatch = false;
    if (user.Password.startsWith('$2a$') || user.Password.startsWith('$2b$')) {
        // Jika sudah hash, gunakan bcrypt
        isMatch = await bcrypt.compare(password, user.Password);
    } else {
        // Jika masih teks biasa (data lama), cocokkan langsung
        isMatch = password === user.Password;
    }

    if (!isMatch) return { error: 'Password salah' };

    const cookieStore = await cookies();
    cookieStore.set('session_user', JSON.stringify({
        UserID: user.UserID,
        Username: user.Username,
        NamaLengkap: user.NamaLengkap,
        Role: user.Role
    }), { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 });

    redirect('/dashboard');
}

// 2. Fungsi Logout
export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('session_user');
    redirect('/login');
}

// 3. Fungsi Ambil Current User
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session_user');
    if (!session) return null;
    return JSON.parse(session.value);
}

// 4. Fungsi Registrasi (Dengan Bcrypt)
export async function registerAction(formData) {
    const username = formData.get('username');
    const password = formData.get('password');
    const email = formData.get('email');
    const nama = formData.get('nama');
    const alamat = formData.get('alamat');

    if (!username || !password || !email || !nama) return { error: 'Semua field wajib diisi!' };

    const cekUser = await db.query('SELECT * FROM user WHERE Username = ?', [username]);
    if (cekUser.length > 0) return { error: 'Username sudah terdaftar!' };

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
        'INSERT INTO user (Username, Password, Email, NamaLengkap, Alamat, Role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email, nama, alamat, 'peminjam']
    );

    return { success: true };
}

// 5. Fungsi Ganti Password (Semua Role)
export async function gantiPasswordAction(formData) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Silakan login ulang' };

    const passwordLama = formData.get('password_lama');
    const passwordBaru = formData.get('password_baru');

    // Ambil data user dari DB
    const users = await db.query('SELECT * FROM user WHERE UserID = ?', [user.UserID]);
    const dbUser = users[0];

    // Cek password lama
    let isMatch = false;
    if (dbUser.Password.startsWith('$2a$') || dbUser.Password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(passwordLama, dbUser.Password);
    } else {
        isMatch = passwordLama === dbUser.Password;
    }

    if (!isMatch) return { error: 'Password lama salah!' };

    // Hash password baru
    const hashedPassword = await bcrypt.hash(passwordBaru, 10);
    await db.query('UPDATE user SET Password = ? WHERE UserID = ?', [hashedPassword, user.UserID]);

    return { success: true };
}