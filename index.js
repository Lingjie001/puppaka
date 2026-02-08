// 极简版本 - 纯内存，无 sqlite3
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('=== PUPPAKA MINIMAL START ===');
console.log('PORT:', PORT);
console.log('Time:', new Date().toISOString());

// 内存数据
const posts = [
  {
    id: 1,
    title: '欢迎使用 PUPPAKA',
    slug: 'welcome',
    content: '这是您的第一篇文章！PUPPAKA 是一个现代化的个人博客和作品集网站。',
    excerpt: '欢迎使用 PUPPAKA 个人网站平台。',
    category: '教程',
    tags: '开始,教程',
    published: 1,
    created_at: new Date().toISOString()
  }
];

const projects = [
  {
    id: 1,
    title: 'PUPPAKA 网站',
    slug: 'puppaka-website',
    description: '基于 Node.js 的个人网站',
    content: '使用 Express + EJS 构建',
    category: 'Web开发',
    technologies: 'Node.js,Express,EJS',
    published: 1,
    created_at: new Date().toISOString()
  }
];

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>PUPPAKA</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        .post { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>🚀 PUPPAKA 网站运行中！</h1>
      <p>部署成功 - 时间: ${new Date().toISOString()}</p>
      <h2>文章</h2>
      ${posts.map(p => `<div class="post"><h3>${p.title}</h3><p>${p.excerpt}</p></div>`).join('')}
      <h2>项目</h2>
      ${projects.map(p => `<div class="post"><h3>${p.title}</h3><p>${p.description}</p></div>`).join('')}
    </body>
    </html>
  `);
});

app.get('/blog', (req, res) => {
  res.json(posts);
});

app.get('/portfolio', (req, res) => {
  res.json(projects);
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Error: ' + err.message);
});

// 启动
const server = app.listen(PORT, () => {
  console.log('✅ Server running on port', PORT);
});

server.on('error', (err) => {
  console.error('❌ Server failed:', err.message);
  process.exit(1);
});
