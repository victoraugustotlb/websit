const db = require('./db');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const result = await db.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100');
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar logs' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await db.query('DELETE FROM logs');
            res.status(200).json({ success: true, message: 'Logs limpos com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao limpar logs' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
