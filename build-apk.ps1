# Build web app
Write-Host "Building Web App..."
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Sync Capacitor
Write-Host "Syncing Capacitor..."
npx cap sync
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Set Java Home
Write-Host "Setting JAVA_HOME..."
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25"

# Build APK
Write-Host "Building APK..."
Set-Location android
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Set-Location ..

Write-Host "APK Built Successfully!"
Write-Host "Location: android\app\build\outputs\apk\debug\app-debug.apk"

