const db = require('./db');

module.exports = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]); // Plaintext password for now matching existing logic

        if (result.rows.length > 0) {
            const user = result.rows[0];
            // Log success
            await db.query("INSERT INTO logs (type, message) VALUES ($1, $2)", ['Auth', `User login successful: ${email} (${user.role})`]);

            res.status(200).json({
                success: true,
                message: 'Login realizado com sucesso!',
                user: { email: user.email, role: user.role }
            });
        } else {
            // Log failure
            await db.query("INSERT INTO logs (type, message) VALUES ($1, $2)", ['Auth', `Failed login attempt for: ${email}`]);

            res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
};
