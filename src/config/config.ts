// import dotenv from 'dotenv';
// dotenv.config();

export const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234567890',
    database: process.env.DB_DATABASE || 'dev_videos'
  },
  timezone: process.env.TIMEZONE || 'America/Bogota'
}