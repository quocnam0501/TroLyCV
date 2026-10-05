#!/bin/bash

echo "======================================================================"
echo "          CHƯƠNG TRÌNH KHỞI CHẠY TROLYCV (AUTO RUNNER)"
echo "======================================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[LỖI] Máy chưa cài đặt Node.js! Tải tại: https://nodejs.org/"
    exit 1
fi

echo "[1/3] Đã phát hiện Node.js:"
node -v
npm -v
echo ""

if [ ! -d "node_modules" ]; then
    echo "[2/3] Đang tự động cài đặt dependencies (npm install)..."
    npm install
fi

echo ""
echo "[3/3] Đang mở trình duyệt và chạy máy chủ..."
sleep 2 && (command -v open &> /dev/null && open "http://localhost:5180" || xdg-open "http://localhost:5180" 2>/dev/null) &
npm run dev -- --host
