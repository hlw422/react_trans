@echo off
chcp 65001 >nul
echo.
echo ================================================
echo   局域网扫码文件互传工具 - 一键启动脚本
echo ================================================
echo.

echo [1/3] 正在安装后端依赖...
cd server
call npm install
if %errorlevel% neq 0 (
    echo 后端依赖安装失败！
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] 正在安装前端依赖...
cd client
call npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败！
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] 正在启动服务...
echo.

:: 启动后端服务（新窗口）
start "局域网文件互传-后端服务" cmd /k "cd server && node server.js"

:: 等待后端启动
timeout /t 2 /nobreak >nul

:: 启动前端开发服务器（新窗口）
start "局域网文件互传-前端服务" cmd /k "cd client && npm run dev"

echo.
echo ================================================
echo   服务启动完成！
echo ================================================
echo.
echo   前端地址: http://localhost:5174
echo   后端地址: http://localhost:3001
echo.
echo   手机请扫描页面上的二维码访问
echo   按任意键退出此窗口...
echo ================================================
pause >nul