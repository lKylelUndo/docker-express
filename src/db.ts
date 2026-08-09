import mysql from 'serverless-mysql';

// Initialize the serverless-mysql instance
// This library manages connections automatically, which is great for serverless
// environments, but also works perfectly fine in a standard Express app!
const db = mysql({
  config: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root_password',
    database: process.env.DB_NAME || 'express_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  }
});

export default db;
