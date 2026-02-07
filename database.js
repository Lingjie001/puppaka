const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

class DB {
  constructor() {
    const dbPath = path.join(__dirname, 'data', 'puppaka.db');
    
    // 确保数据目录存在
    if (!fs.existsSync(path.dirname(dbPath))) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    // 创建文章表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image TEXT,
        category TEXT,
        tags TEXT,
        published INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建作品集表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        content TEXT,
        featured_image TEXT,
        images TEXT,
        category TEXT,
        technologies TEXT,
        link TEXT,
        github TEXT,
        published INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建联系记录表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建用户表（管理后台）
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 插入默认管理员
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    this.db.run(`
      INSERT OR IGNORE INTO users (username, password, email) 
      VALUES (?, ?, ?)
    `, ['admin', hashedPassword, 'admin@puppaka.com'], (err) => {
      if (err) console.error('Error creating admin user:', err);
    });

    console.log('✅ Database initialized');
  }

  // 文章相关操作
  getPosts(limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getPostCount() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM posts WHERE published = 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }

  getPostBySlug(slug) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM posts WHERE slug = ?',
        [slug],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  getPostById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM posts WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  createPost(post) {
    const { title, slug, content, excerpt, featured_image, category, tags } = post;
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO posts (title, slug, content, excerpt, featured_image, category, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, content, excerpt, featured_image, category, tags],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // 项目相关操作
  getProjects(limit = 100) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM projects WHERE published = 1 ORDER BY created_at DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getProjectBySlug(slug) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM projects WHERE slug = ?',
        [slug],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  createProject(project) {
    const { title, slug, description, content, featured_image, category, technologies, link, github } = project;
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO projects (title, slug, description, content, featured_image, category, technologies, link, github)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, description, content, featured_image, category, technologies, link, github],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // 联系记录
  saveContact(contact) {
    const { name, email, subject, message } = contact;
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`,
        [name, email, subject, message],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  getContacts(limit = 50) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // 用户验证
  getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // 获取相关文章
  getRelatedPosts(postId, limit = 3) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM posts WHERE id != ? AND published = 1 ORDER BY created_at DESC LIMIT ?`,
        [postId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = DB;