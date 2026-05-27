#!/bin/bash
# 软通动力新闻智能整理与分析平台 - 部署脚本
# 适用系统: CentOS 7
# 用法: bash deploy.sh

set -e

APP_DIR="/opt/news-platform"

echo "=== 1. 安装依赖 ==="
yum install -y epel-release
yum install -y nginx python3 python3-pip

echo "=== 2. 部署应用 ==="
mkdir -p $APP_DIR
cp -r . $APP_DIR/
cd $APP_DIR

echo "=== 3. 安装 Python 依赖 ==="
cd backend
pip3 install -r requirements.txt
cd ..

echo "=== 4. 安装 Node 依赖并构建前端 ==="
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
cd prototype
npm install
npm run build
cd ..

echo "=== 5. 配置 Nginx ==="
cp deploy/nginx.conf /etc/nginx/conf.d/news-platform.conf
# 移除默认配置避免端口冲突
rm -f /etc/nginx/conf.d/default.conf
# 检查主配置是否 include conf.d
grep -q "include.*conf.d" /etc/nginx/nginx.conf || {
    echo "请确认 /etc/nginx/nginx.conf 中包含: include /etc/nginx/conf.d/*.conf;"
}
nginx -t && systemctl enable nginx && systemctl restart nginx

echo "=== 6. 配置后端服务 ==="
cp .env.example .env
echo ">>> 请编辑 $APP_DIR/.env 填入你的 API Key"
cp deploy/news-backend.service /etc/systemd/system/
# 修正 uvicorn 路径
UVICORN_PATH=$(which uvicorn || echo "/usr/local/bin/uvicorn")
sed -i "s|/usr/local/bin/uvicorn|$UVICORN_PATH|" /etc/systemd/system/news-backend.service
systemctl daemon-reload
systemctl enable news-backend

echo "=== 7. 配置防火墙 ==="
firewall-cmd --permanent --add-service=http 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

echo ""
echo "=== 部署完成 ==="
echo "1. 编辑 API Key:  vi $APP_DIR/.env"
echo "2. 启动后端:       systemctl start news-backend"
echo "3. 查看状态:       systemctl status news-backend"
echo "4. 访问:           http://你的服务器IP"
echo ""
echo "常用命令:"
echo "  查看后端日志:    journalctl -u news-backend -f"
echo "  重启后端:        systemctl restart news-backend"
echo "  重启Nginx:       systemctl restart nginx"
echo "  重新构建前端:    cd $APP_DIR/prototype && npm run build"
