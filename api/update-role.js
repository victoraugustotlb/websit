const db = require('./db');

module.exports = async (req, res) => {
    const { email, role } = req.body;

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await db.query('UPDATE users SET role = $1 WHERE email = $2', [role, email]);

        // Log the action
        await db.query("INSERT INTO logs (type, message) VALUES ($1, $2)", ['Admin', `Role update for ${email}: ${role}`]);

        res.status(200).json({ success: true, message: 'Função atualizada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar função' });
    }
};
