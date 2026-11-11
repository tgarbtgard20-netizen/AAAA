@echo off
chcp 65001 >nul
echo ========================================================
echo   نظام مؤسسة هجاير للتجارة - نقاط البيع والمبيعات (POS)
echo ========================================================
echo.
echo جاري فحص بيئة Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطأ] برنامج Node.js غير مثبت على جهازك!
    echo يرجى تحميله وتثبيته أولاً من الرابط الرسمي: https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo جاري تثبيت الحزم والمكتبات المطلوبة لأول مرة...
    call npm install
)

echo.
echo جاري بدء تشغيل السيرفر المحلي للنظام...
start http://localhost:3000
npm run dev
pause
