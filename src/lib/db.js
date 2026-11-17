import mysql from 'mysql2/promise';

class Database {
    constructor() {
        if (!Database.instance) {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '', // Biasanya kosong di XAMPP
                database: process.env.DB_NAME || 'db_perpustakaan',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            Database.instance = this;
        }
        return Database.instance;
    }

    async query(sql, values) {
        try {
            const [results] = await this.pool.execute(sql, values);
            return results;
        } catch (error) {
            console.error("Database Error:", error);
            throw error;
        }
    }
}

// Export instance agar bisa dipakai di file lain
const db = new Database();
export default db;