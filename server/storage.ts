import db from './db';

export interface User {
  id: number;
  uid?: string;
  username: string;
  email?: string;
  password: string;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  id: number;
  message: string;
  isActive: boolean;
  createdAt?: string;
}

export class DatabaseStorage {
  async getUser(id: number): Promise<User | undefined> {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (user) {
      user.isAdmin = true; // All users in userauth.json are admins
    }
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (user) {
      user.isAdmin = true; // All users in userauth.json are admins
    }
    return user || null;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const result = db.prepare('INSERT INTO users (uid, username, email, password, isAdmin) VALUES (?, ?, ?, ?, ?)').run(
      user.uid || null,
      user.username,
      user.email || null,
      user.password,
      user.isAdmin || false
    );
    return { id: result.lastInsertRowid as number, ...user };
  }

  async getAllProducts(): Promise<Product[]> {
    return db.prepare('SELECT * FROM products WHERE isActive = 1 ORDER BY createdAt DESC').all() as Product[];
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return db.prepare('SELECT * FROM announcements WHERE isActive = 1 ORDER BY createdAt DESC').all() as Announcement[];
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const result = db.prepare(`
      INSERT INTO products (title, description, price, currency, category, images, isActive) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      product.title,
      product.description,
      product.price,
      product.currency,
      product.category,
      product.images || null,
      product.isActive
    );
    return { id: result.lastInsertRowid as number, ...product };
  }

  async createAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    const result = db.prepare('INSERT INTO announcements (message, isActive) VALUES (?, ?)').run(
      announcement.message,
      announcement.isActive
    );
    return { id: result.lastInsertRowid as number, ...announcement };
  }
}

  async getAllUsers(): Promise<User[]> {
    return db.prepare('SELECT * FROM users').all() as User[];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.prepare('SELECT * FROM products WHERE isActive = 1').all() as Product[];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const result = db.prepare('INSERT INTO products (title, description, price, currency, category, images, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      product.title,
      product.description,
      product.price,
      product.currency,
      product.category,
      product.images || null,
      product.isActive
    );
    return { id: result.lastInsertRowid as number, ...product };
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    if (fields) {
      db.prepare(`UPDATE products SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
    }

    return this.getProduct(id);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return result.changes > 0;
  }

  async getActiveAnnouncement(): Promise<Announcement | undefined> {
    return db.prepare('SELECT * FROM announcements WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 1').get() as Announcement | undefined;
  }

  async updateAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    // Deactivate all announcements
    db.prepare('UPDATE announcements SET isActive = 0').run();

    // Create new announcement
    const result = db.prepare('INSERT INTO announcements (message, isActive) VALUES (?, ?)').run(
      announcement.message,
      announcement.isActive
    );
    return { id: result.lastInsertRowid as number, ...announcement };
  }
}

export const storage = new DatabaseStorage();