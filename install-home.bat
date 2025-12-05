@echo off
echo 🏠 INSTALAÇÃO PARA CASA 🏠
echo =========================
echo.
echo Este script vai instalar todas as dependências
echo Execute quando chegar em casa no seu computador
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

echo.
echo 📦 Instalando dependências da raiz...
call npm install

echo.
echo 🏠 Instalando Landing Page...
cd packages\landing
call npm install
cd ..

echo.
echo 💻 Instalando Dashboard...
cd dashboard
call npm install
cd ..

echo.
echo 🌐 Instalando Public Site...
cd public-site
call npm install
cd ..

echo.
echo 🔌 Instalando API...
cd api
call npm install
cd ..\..

echo.
echo ✅ TODAS AS DEPENDÊNCIAS INSTALADAS!
echo.
echo Para iniciar tudo, execute:
echo npm run start
echo.
echo Ou inicie individualmente:
echo - Landing:     npm run dev:landing    (porta 3002)
echo - Dashboard:   npm run dev:dashboard  (porta 3000)
echo - Public Site: npm run dev:public     (porta 3003)
echo - API:         npm run dev:api        (porta 3001)
echo.
pause