#!/bin/bash
echo "========================================================"
echo "  نظام مؤسسة هجاير للتجارة - نقاط البيع والمبيعات (POS)"
echo "========================================================"
echo ""

if ! command -v node &> /dev/null
then
    echo "[خطأ] برنامج Node.js غير مثبت على جهازك!"
    echo "يرجى تحميله وتثبيته أولاً من الرابط: https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "جاري تثبيت الحزم والمكتبات المطلوبة لأول مرة..."
    npm install
fi

echo ""
echo "جاري تشغيل السيرفر المحلي للنظام على http://localhost:3000 ..."
npm run dev
