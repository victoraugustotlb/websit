const db = require('./db');

module.exports = async (req, res) => {
    try {
        constresult = await db.query('SELECT email, password, role, created_at FROM users ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};
