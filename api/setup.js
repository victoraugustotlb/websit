const db = require('./db');

module.exports = async (req, res) => {
    try {
        // Create Users Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create Logs Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        type TEXT,
        message TEXT
      );
    `);

        // Create Master Admin if not exists
        const masterEmail = 'admin@master.com';
        const masterPassword = 'admin123'; // In a real app, hash this!

        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [masterEmail]);

        if (userCheck.rows.length === 0) {
            await db.query(
                'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
                [masterEmail, masterPassword, 'admin']
            );
            await db.query("INSERT INTO logs (type, message) VALUES ('System', 'Master Admin account created automatically.')");
            res.status(200).json({ message: "Database initialized and Master Admin created." });
        } else {
            res.status(200).json({ message: "Database already initialized." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
