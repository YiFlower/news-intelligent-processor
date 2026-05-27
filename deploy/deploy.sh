#!/bin/bash
# 部署脚本 - 在项目根目录执行
# 支持重复执行，已完成的步骤会自动跳过
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "项目目录: $PROJECT_DIR"
echo ""

# === 环境检查 ===
echo "--- 环境检查 ---"

MISSING=0
if ! command -v python3 &>/dev/null; then
    echo "[缺失] python3 未安装"
    MISSING=1
else
    echo "[OK] python3: $(python3 --version)"
fi

if ! command -v pip3 &>/dev/null; then
    echo "[缺失] pip3 未安装"
    MISSING=1
else
    echo "[OK] pip3"
fi

if ! command -v node &>/dev/null; then
    echo "[缺失] node 未安装"
    MISSING=1
else
    echo "[OK] node: $(node --version)"
fi

if ! command -v npm &>/dev/null; then
    echo "[缺失] npm 未安装"
    MISSING=1
else
    echo "[OK] npm: $(npm --version)"
fi

if ! command -v nginx &>/dev/null; then
    echo "[缺失] nginx 未安装，请先执行: dnf install -y nginx --disableexcludes=all"
    MISSING=1
else
    echo "[OK] nginx: $(nginx -v 2>&1 | sed 's/nginx version: //')"
fi

if [ "$MISSING" -eq 1 ]; then
    echo ""
    echo "请先安装缺失的依赖，再重新执行此脚本。"
    exit 1
fi

echo ""

# === 1. Python 依赖 ===
echo "=== 1. Python 依赖 ==="
cd "$PROJECT_DIR/backend"
if python3 -c "import fastapi, uvicorn, httpx" 2>/dev/null; then
    echo "已安装，跳过"
else
    pip3 install -r requirements.txt
fi

echo ""

# === 2. 构建前端 ===
echo "=== 2. 构建前端 ==="
cd "$PROJECT_DIR/prototype"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "dist/ 已存在，跳过构建（如需重新构建请先删除 dist/ 目录）"
else
    npm install && npm run build
fi

echo ""

# === 3. 配置 Nginx ===
echo "=== 3. Nginx 配置 ==="
CONF_FILE="/etc/nginx/conf.d/news-platform.conf"
NEED_NGINX_RELOAD=0

if [ -f "$CONF_FILE" ] && grep -q "$PROJECT_DIR" "$CONF_FILE" 2>/dev/null; then
    echo "配置文件已存在且路径正确，跳过"
else
    sed "s|/opt/news-platform|$PROJECT_DIR|g" "$PROJECT_DIR/deploy/nginx.conf" > "$CONF_FILE"
    rm -f /etc/nginx/conf.d/default.conf
    echo "配置文件已写入: $CONF_FILE"
    NEED_NGINX_RELOAD=1
fi

nginx -t
if systemctl is-active --quiet nginx; then
    echo "Nginx 已在运行"
    if [ "$NEED_NGINX_RELOAD" -eq 1 ]; then
        nginx -s reload && echo "配置已重载" || echo "重载失败，请手动检查"
    else
        echo "配置无变化，跳过重载"
    fi
elif [ "$NEED_NGINX_RELOAD" -eq 1 ] || [ ! -f "$CONF_FILE" ]; then
    systemctl enable nginx
    systemctl start nginx
    echo "Nginx 已启动"
else
    echo "配置无变化，Nginx 未运行，启动中..."
    systemctl enable nginx
    systemctl start nginx
    echo "Nginx 已启动"
fi

echo ""

# === 4. 配置后端服务 ===
echo "=== 4. 后端服务 ==="
SERVICE_FILE="/etc/systemd/system/news-backend.service"
NEED_SERVICE_RELOAD=0

[ -f "$PROJECT_DIR/.env" ] || cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"

if [ -f "$SERVICE_FILE" ] && grep -q "$PROJECT_DIR" "$SERVICE_FILE" 2>/dev/null; then
    echo "服务文件已存在且路径正确，跳过"
else
    UVICORN_PATH=$(which uvicorn 2>/dev/null || echo "/usr/local/bin/uvicorn")
    sed "s|/usr/local/bin/uvicorn|$UVICORN_PATH|g; s|/opt/news-platform|$PROJECT_DIR|g" \
        "$PROJECT_DIR/deploy/news-backend.service" > "$SERVICE_FILE"
    echo "服务文件已写入: $SERVICE_FILE"
    NEED_SERVICE_RELOAD=1
fi

if [ "$NEED_SERVICE_RELOAD" -eq 1 ]; then
    systemctl daemon-reload
    systemctl enable news-backend
    echo "服务已注册"
else
    echo "服务无变化，跳过注册"
fi

echo ""
echo "=== 部署完成 ==="
echo ""

# === 状态检查 ===
echo "--- 服务状态 ---"
if systemctl is-active --quiet news-backend; then
    echo "后端: 运行中"
else
    echo "后端: 未运行，执行 systemctl start news-backend 启动"
fi

if systemctl is-active --quiet nginx; then
    echo "Nginx: 运行中"
else
    echo "Nginx: 未运行，执行 systemctl start nginx 启动"
fi

echo ""
echo "编辑 API Key:  vi $PROJECT_DIR/.env"
echo "访问地址:      http://服务器IP"
