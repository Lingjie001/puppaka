// 极简版本 - 用于诊断问题
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('=== PUPPAKA STARTING ===');
console.log('PORT:', PORT);
console.log('CWD:', process.cwd());

// 最基本的中间件
app.use(express.static(path.join(__dirname, 'public')));

// 测试路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>PUPPAKA</title></head>
      <body>
        <h1>PUPPAKA 网站正在运行!</h1>
        <p>部署成功</p>
        <p>时间: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

// 关键：绑定到所有接口
const server = app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('FAILED TO START:', err);
    process.exit(1);
  }
  console.log('✅ Server running on port', PORT);
  console.log('✅ Bind address: 0.0.0.0');
});

// 错误处理
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
