#!/bin/bash
# 部署脚本 - 在项目根目录执行
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== 1. 安装 Python 依赖 ==="
cd "$PROJECT_DIR/backend"
pip3 install -r requirements.txt

echo "=== 2. 构建前端 ==="
cd "$PROJECT_DIR/prototype"
npm install && npm run build

echo "=== 3. 配置 Nginx ==="
sed "s|/opt/news-platform|$PROJECT_DIR|g" "$PROJECT_DIR/deploy/nginx.conf" > /etc/nginx/conf.d/news-platform.conf
rm -f /etc/nginx/conf.d/default.conf
nginx -t && systemctl enable nginx && systemctl restart nginx

echo "=== 4. 配置后端服务 ==="
[ -f "$PROJECT_DIR/.env" ] || cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
cp "$PROJECT_DIR/deploy/news-backend.service" /etc/systemd/system/
UVICORN_PATH=$(which uvicorn 2>/dev/null || echo "/usr/local/bin/uvicorn")
sed -i "s|/usr/local/bin/uvicorn|$UVICORN_PATH|" /etc/systemd/system/news-backend.service
sed -i "s|/opt/news-platform|$PROJECT_DIR|" /etc/systemd/system/news-backend.service
systemctl daemon-reload && systemctl enable news-backend

echo ""
echo "=== 完成 ==="
echo "1. 编辑 API Key:  vi $PROJECT_DIR/.env"
echo "2. 启动后端:       systemctl start news-backend"
echo "3. 访问:           http://服务器IP"
