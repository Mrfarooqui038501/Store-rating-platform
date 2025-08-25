const { Pool } = require('pg');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'store_rating_db',
    user: process.env.DB_USER || 'store_user',
    password: process.env.DB_PASSWORD,
    // Connection pool settings
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // return error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client:', err);
    process.exit(-1);
});

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        
        // Test query
        const result = await client.query('SELECT NOW()');
        console.log('🕒 Database time:', result.rows[0].now);
        
        client.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        console.error('Please check your database configuration:');
        console.error('- Host:', dbConfig.host);
        console.error('- Port:', dbConfig.port);
        console.error('- Database:', dbConfig.database);
        console.error('- User:', dbConfig.user);
        process.exit(1);
    }
};

// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Query executed:', { text, duration, rows: result.rowCount });
        }
        
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Helper function to execute queries with transaction
const transaction = async (queries) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const results = [];
        for (const { text, params } of queries) {
            const result = await client.query(text, params);
            results.push(result);
        }
        
        await client.query('COMMIT');
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Helper function to get a client from pool (for complex operations)
const getClient = async () => {
    return await pool.connect();
};

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🔄 Received SIGINT, closing database pool...');
    pool.end(() => {
        console.log('✅ Database pool has ended');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('🔄 Received SIGTERM, closing database pool...');
    pool.end(() => {
        console.log('✅ Database pool has ended');
        process.exit(0);
    });
});

module.exports = {
    pool,
    query,
    transaction,
    getClient,
    testConnection
};