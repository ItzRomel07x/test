var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server/index.ts
import express from "express";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";

// server/db.ts
import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
var dbPath = path.join(process.cwd(), "database", "app.db");
var dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
var db = new Database(dbPath);
db.pragma("foreign_keys = ON");
var initSQL = fs.readFileSync(path.join(process.cwd(), "database", "init.sql"), "utf-8");
db.exec(initSQL);
var userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  const userAuthPath = path.join(process.cwd(), "userauth.json");
  if (fs.existsSync(userAuthPath)) {
    const users = JSON.parse(fs.readFileSync(userAuthPath, "utf-8"));
    const insertUser = db.prepare("INSERT INTO users (uid, username, email, password) VALUES (?, ?, ?, ?)");
    for (const user of users) {
      insertUser.run(user.uid, user.username, user.email, user.password);
    }
    console.log("Loaded users from userauth.json");
  }
}
var db_default = db;

// server/storage.ts
var DatabaseStorage = class {
  async getUser(id) {
    const user = db_default.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (user) {
      user.isAdmin = true;
    }
    return user || null;
  }
  async getUserByUsername(username) {
    const user = db_default.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (user) {
      user.isAdmin = true;
    }
    return user || null;
  }
  async createUser(user) {
    const result = db_default.prepare("INSERT INTO users (uid, username, email, password, isAdmin) VALUES (?, ?, ?, ?, ?)").run(
      user.uid || null,
      user.username,
      user.email || null,
      user.password,
      user.isAdmin || false
    );
    return { id: result.lastInsertRowid, ...user };
  }
  async getAllUsers() {
    return db_default.prepare("SELECT * FROM users").all();
  }
  async deleteUser(id) {
    const result = db_default.prepare("DELETE FROM users WHERE id = ?").run(id);
    return result.changes > 0;
  }
  async getAllProducts() {
    return db_default.prepare("SELECT * FROM products WHERE isActive = 1").all();
  }
  async getProduct(id) {
    return db_default.prepare("SELECT * FROM products WHERE id = ?").get(id);
  }
  async createProduct(product) {
    const result = db_default.prepare("INSERT INTO products (title, description, price, currency, category, images, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      product.title,
      product.description,
      product.price,
      product.currency,
      product.category,
      product.images || null,
      product.isActive
    );
    return { id: result.lastInsertRowid, ...product };
  }
  async updateProduct(id, updates) {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    if (fields) {
      db_default.prepare(`UPDATE products SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
    }
    return this.getProduct(id);
  }
  async deleteProduct(id) {
    const result = db_default.prepare("DELETE FROM products WHERE id = ?").run(id);
    return result.changes > 0;
  }
  async getActiveAnnouncement() {
    return db_default.prepare("SELECT * FROM announcements WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 1").get();
  }
  async updateAnnouncement(announcement) {
    db_default.prepare("UPDATE announcements SET isActive = 0").run();
    const result = db_default.prepare("INSERT INTO announcements (message, isActive) VALUES (?, ?)").run(
      announcement.message,
      announcement.isActive
    );
    return { id: result.lastInsertRowid, ...announcement };
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "simple-auth-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // Set to false for development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        if (!username || !password) {
          return done(null, false, { message: "Username and password are required" });
        }
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({
          message: "Invalid username or password. Please check your credentials and try again."
        });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const userWithAdminFlag = {
          ...user,
          isAdmin: true
          // All users in userauth.json are admins
        };
        res.status(200).json(userWithAdminFlag);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/routes.ts
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
function setupRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/products", async (req, res, next) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/products", requireAuth, async (req, res, next) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });
  app2.patch("/api/products/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });
  app2.delete("/api/products/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/announcements", async (req, res, next) => {
    try {
      const announcement = await storage.getActiveAnnouncement();
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/announcements", requireAuth, async (req, res, next) => {
    try {
      const announcement = await storage.updateAnnouncement(req.body);
      res.status(201).json(announcement);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/users", requireAuth, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });
}

// server/index.ts
import { fileURLToPath } from "url";
import { dirname as dirname2, join as join2 } from "path";
import fs2 from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname2(__filename);
var app = express();
var PORT = process.env.PORT || 5e3;
app.use(express.json());
var distPath = join2(__dirname, "../dist/public");
if (!fs2.existsSync(distPath)) {
  console.log("Frontend build not found, building now...");
  try {
    __require("child_process").execSync("npm run build", { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to build frontend:", error);
  }
}
app.use(express.static(distPath));
setupRoutes(app);
app.get("*", (req, res) => {
  const indexPath = join2(distPath, "index.html");
  if (fs2.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend build not found. Please run: npm run build");
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
