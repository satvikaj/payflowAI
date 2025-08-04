@echo off
echo ============================================
echo PayFlow Payroll Module - System Check
echo ============================================
echo.

echo Checking Java installation...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java not found! Please install Java 21 or higher.
    pause
    exit /b 1
)
echo ✅ Java is installed
echo.

echo Checking Maven installation...
mvn -version
if %errorlevel% neq 0 (
    echo WARNING: Maven not found in PATH. Will use Maven wrapper.
)
echo.

echo Checking Node.js installation...
node -version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js.
    pause
    exit /b 1
)
echo ✅ Node.js is installed
echo.

echo Checking npm installation...
npm -version
if %errorlevel% neq 0 (
    echo ERROR: npm not found! Please install npm.
    pause
    exit /b 1
)
echo ✅ npm is installed
echo.

echo Checking MySQL connection...
echo Attempting to connect to MySQL...
mysql -u root -p -e "SHOW DATABASES;" 2>nul | findstr payflow_system >nul
if %errorlevel% neq 0 (
    echo WARNING: Cannot verify payflow_system database. Please ensure MySQL is running and database exists.
) else (
    echo ✅ MySQL connection successful
)
echo.

echo Checking backend files...
if exist "payflow-api\src\main\java\com\payflowapi\entity\CTCDetails.java" (
    echo ✅ CTCDetails.java found
) else (
    echo ❌ CTCDetails.java not found
)

if exist "payflow-api\src\main\java\com\payflowapi\controller\CTCManagementController.java" (
    echo ✅ CTCManagementController.java found
) else (
    echo ❌ CTCManagementController.java not found
)
echo.

echo Checking frontend files...
if exist "payflow-frontend\src\pages\CTCManagement.jsx" (
    echo ✅ CTCManagement.jsx found
) else (
    echo ❌ CTCManagement.jsx not found
)

if exist "payflow-frontend\src\pages\PayrollDashboard.jsx" (
    echo ✅ PayrollDashboard.jsx found
) else (
    echo ❌ PayrollDashboard.jsx not found
)
echo.

echo ============================================
echo System Check Complete!
echo ============================================
echo.
echo Next Steps:
echo 1. Start Backend: cd payflow-api ^&^& mvn spring-boot:run
echo 2. Start Frontend: cd payflow-frontend ^&^& npm start
echo 3. Open Test File: payflow-api-test.html
echo.
pause
