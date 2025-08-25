
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'app.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
const initSQL = fs.readFileSync(path.join(process.cwd(), 'database', 'init.sql'), 'utf-8');
db.exec(initSQL);

// Load users from userauth.json if database is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const userAuthPath = path.join(process.cwd(), 'userauth.json');
  if (fs.existsSync(userAuthPath)) {
    const users = JSON.parse(fs.readFileSync(userAuthPath, 'utf-8'));
    const insertUser = db.prepare('INSERT INTO users (uid, username, email, password) VALUES (?, ?, ?, ?)');
    
    for (const user of users) {
      insertUser.run(user.uid, user.username, user.email, user.password);
    }
    console.log('Loaded users from userauth.json');
  }
}

export default db;
