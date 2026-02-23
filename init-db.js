import pkg from 'pg';
const { Client } = pkg;

const encodedPassword = encodeURIComponent('[Themoderntint@2116]');
const client = new Client({
    user: 'postgres',
    host: 'db.tluxbmfziquoagqgkyka.supabase.co',
    database: 'postgres',
    password: encodedPassword,
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initDb() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS leads (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        status TEXT DEFAULT 'new'
      );
    `;

        await client.query(createTableQuery);
        console.log('Table "leads" created or already exists.');

    } catch (err) {
        console.error('Database initialization error:', err);
    } finally {
        await client.end();
    }
}

initDb();
