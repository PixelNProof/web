import pkg from 'pg';
const { Pool } = pkg;

// Initialize connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase in many serverless environments
    }
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, company } = req.body;

    // 1. Server-side Validation
    if (!name || !email || !company) {
        return res.status(400).json({ error: 'Engineering fault: Missing crucial lead parameters.' });
    }

    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Signature fault: Invalid email format detected.' });
    }

    try {
        // 2. Insert Lead into Supabase
        const client = await pool.connect();
        const query = 'INSERT INTO leads (full_name, email, company) VALUES ($1, $2, $3) RETURNING id';
        const values = [name, email, company];

        const result = await client.query(query, values);
        client.release();

        console.log(`[Database] Lead captured with ID: ${result.rows[0].id}`);

        return res.status(200).json({
            success: true,
            message: 'Lead synchronized. Growth audit engineered.',
            leadId: result.rows[0].id
        });
    } catch (error) {
        console.error('[System Error] Database synchronization failed:', error);
        return res.status(500).json({
            error: 'Database synchronization fault.',
            details: error.message
        });
    }
}
