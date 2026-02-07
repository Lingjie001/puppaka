// 调试启动器 - 记录所有错误到文件
const fs = require('fs');
const path = require('path');

// 创建日志文件
const logFile = path.join(__dirname, 'startup.log');
const errorLogFile = path.join(__dirname, 'error.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

function logError(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ERROR: ${message}\n`;
  console.error(message);
  fs.appendFileSync(errorLogFile, logMessage);
}

// 记录启动信息
log('========================================');
log('Starting PUPPAKA Server...');
log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
log(`PORT: ${process.env.PORT || '3000 (default)'}`);
log(`HOSTINGER: ${process.env.HOSTINGER || 'undefined'}`);
log(`Current directory: ${__dirname}`);

// 检查关键文件
const requiredFiles = ['server.js', 'package.json', 'database.js'];
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  log(`File ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// 尝试启动服务器
try {
  log('Loading server.js...');
  require('./server.js');
  log('Server loaded successfully');
} catch (err) {
  logError(`Failed to start server: ${err.message}`);
  logError(err.stack);
  process.exit(1);
}
