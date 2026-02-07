const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// 单例模式 - 所有模块共享同一个数据库实例
let instance = null;

class DB {
  constructor() {
    if (instance) {
      return instance;
    }
    
    // Hostinger 免费版可能没有文件写入权限，使用内存数据库
    // 检查是否在 Hostinger 或任何生产环境
    this.isHostinger = process.env.HOSTINGER === 'true' || process.env.NODE_ENV === 'production';
    
    // 如果是 Hostinger 环境，使用内存数据库
    let dbPath;
    if (this.isHostinger) {
      console.log('🏠 Hostinger environment detected, using in-memory database');
      dbPath = ':memory:';
    } else {
      dbPath = path.join(__dirname, 'data', 'puppaka.db');
    }
    
    if (!this.isHostinger) {
      // 确保数据目录存在
      if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      }
    }
    
    this.db = new sqlite3.Database(dbPath);
    this.init();
    
    instance = this;
    return instance;
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
    
    // 如果是内存数据库，插入示例数据
    if (this.isHostinger) {
      this.seedData();
    }
  }
  
  // 插入示例数据
  seedData() {
    // 示例文章
    const posts = [
      {
        title: '开始使用 PUPPAKA',
        slug: 'getting-started',
        content: '欢迎！这是 PUPPAKA 网站的第一篇文章。\n\n这是一个现代化的个人网站平台，支持博客和作品集展示。',
        excerpt: '欢迎来到 PUPPAKA，这是一个现代化的个人网站平台。',
        category: '教程',
        tags: '开始,教程',
        published: 1
      },
      {
        title: '深色科技风格设计',
        slug: 'dark-tech-design',
        content: 'PUPPAKA 采用了深色科技风格设计，配合霓虹光效和渐变色彩。',
        excerpt: '探索深色科技风格的美学原则。',
        category: '设计',
        tags: '设计,深色,科技',
        published: 1
      }
    ];
    
    posts.forEach(post => {
      this.db.run(`
        INSERT OR IGNORE INTO posts (title, slug, content, excerpt, category, tags, published)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [post.title, post.slug, post.content, post.excerpt, post.category, post.tags, post.published]);
    });
    
    // 示例项目
    const projects = [
      {
        title: 'PUPPAKA 网站',
        slug: 'puppaka-website',
        description: '基于 Node.js 的动态网站项目',
        content: '使用 Express + EJS + SQLite 构建的个人网站平台',
        category: 'Web开发',
        technologies: 'Node.js,Express,EJS',
        published: 1
      }
    ];
    
    projects.forEach(project => {
      this.db.run(`
        INSERT OR IGNORE INTO projects (title, slug, description, content, category, technologies, published)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [project.title, project.slug, project.description, project.content, project.category, project.technologies, project.published]);
    });
    
    console.log('✅ Sample data seeded');
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

  savePost(post) {
    return new Promise((resolve, reject) => {
      const { id, title, slug, content, excerpt, featured_image, category, tags, published } = post;
      if (id) {
        this.db.run(
          `UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, 
           featured_image = ?, category = ?, tags = ?, published = ?,
           updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [title, slug, content, excerpt, featured_image, category, tags, published, id],
          function(err) {
            if (err) reject(err);
            else resolve({ id });
          }
        );
      } else {
        this.db.run(
          `INSERT INTO posts (title, slug, content, excerpt, featured_image, category, tags, published)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, slug, content, excerpt, featured_image, category, tags, published],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      }
    });
  }

  deletePost(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // 作品集操作
  getProjects(limit = 10) {
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

  getProjectCount() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM projects WHERE published = 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
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

  getProjectById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM projects WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  saveProject(project) {
    return new Promise((resolve, reject) => {
      const { id, title, slug, description, content, featured_image, images, category, technologies, link, github, published } = project;
      if (id) {
        this.db.run(
          `UPDATE projects SET title = ?, slug = ?, description = ?, content = ?, 
           featured_image = ?, images = ?, category = ?, technologies = ?, link = ?, github = ?, published = ?,
           updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [title, slug, description, content, featured_image, images, category, technologies, link, github, published, id],
          function(err) {
            if (err) reject(err);
            else resolve({ id });
          }
        );
      } else {
        this.db.run(
          `INSERT INTO projects (title, slug, description, content, featured_image, images, category, technologies, link, github, published)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, slug, description, content, featured_image, images, category, technologies, link, github, published],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      }
    });
  }

  deleteProject(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // 联系记录操作
  saveContact(contact) {
    return new Promise((resolve, reject) => {
      const { name, email, subject, message } = contact;
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

  markContactAsRead(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE contacts SET read = 1 WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  deleteContact(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
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
