const db = require('./db');

module.exports = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const check = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            await db.query("INSERT INTO logs (type, message) VALUES ($1, $2)", ['Auth', `Failed registration attempt for existing email: ${email}`]);
            return res.status(400).json({ success: false, message: 'Este email já está cadastrado.' });
        }

        // Insert new user
        await db.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3)', [email, password, 'user']);

        await db.query("INSERT INTO logs (type, message) VALUES ($1, $2)", ['Auth', `New user registered: ${email}`]);

        res.status(200).json({ success: true, message: 'Cadastro realizado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.' });
    }
};
