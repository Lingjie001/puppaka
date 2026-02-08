#!/bin/bash
# PUPPAKA 启动脚本

cd ~/domains/puppaka.com/public_html

# 停止旧进程
pkill -f "node app.js" 2>/dev/null

# 启动新进程
nohup /opt/alt/alt-nodejs20/root/usr/bin/node app.js > app.log 2>&1 &

echo "PUPPAKA started on port 3000"
echo "Check: curl http://localhost:3000/health"
