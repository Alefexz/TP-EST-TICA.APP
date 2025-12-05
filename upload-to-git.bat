@echo off
echo 🚀 PREPARANDO PARA SUBIR NO GITHUB
echo ===================================
echo.

echo 1. Criando .gitignore...
(
echo # Dependencies
echo node_modules/
echo */node_modules/
echo
echo # Environment
echo .env
echo *.env.local
echo
echo # Build outputs
echo dist/
echo build/
echo web-build/
echo
echo # Firebase
echo google-services.json
echo GoogleService-Info.plist
echo
echo # System
echo .DS_Store
echo Thumbs.db
echo
echo # White-label builds
echo white-label/*/
echo !white-label/builder.js
echo !white-label/README.md
) > .gitignore

echo ✅ .gitignore criado
echo.

echo 2. Criando README principal...
(
echo # EstetiOne - Sistema de Agendamento
echo 
echo ## Estrutura
echo - Landing pages (SaaS + White-label)
echo - App React Native convertido para PWA
echo - Sistema white-label
echo - API backend
echo
echo ## Como executar em casa
echo 1. Execute install-home.bat
echo 2. npm start
echo
echo ## URLs locais
echo - Landing: http://localhost:3002
echo - Dashboard: http://localhost:3000
echo - Public Site: http://localhost:3003
echo - API: http://localhost:3001
) > README.md

echo ✅ README.md criado
echo.

echo 3. Preparando mensagem de commit...
echo # Commit inicial - Estrutura completa
echo.
echo ## Novos arquivos:
echo - Landing pages separadas (saas.html, white-label.html)
echo - App configurado como PWA (app.json, webpack.config.js)
echo - Sistema white-label (builder funcionando)
echo - Scripts de instalação e deploy
echo.
echo ## Próximos passos:
echo 1. Em casa: instalar dependências
echo 2. Testar se tudo roda
echo 3. Conectar Firebase
echo 4. Testar fluxo completo
> commit-message.txt

echo ✅ Mensagem de commit preparada
echo.

echo ⚠️  AGORA FAÇA MANUALMENTE NO GITHUB DESKTOP:
echo.
echo 1. Abra o GitHub Desktop
echo 2. Selecione a pasta: %cd%
echo 3. Faça commit com a mensagem acima
echo 4. Push para seu repositório
echo.
echo 📁 Estrutura que será commitada:
echo packages/landing/ (com saas.html e white-label.html)
echo packages/dashboard/ (com white-label/builder.js)
echo packages/public-site/
echo packages/api/
echo shared/
echo .gitignore
echo README.md
echo.
echo ✅ TUDO PRONTO PARA COMMIT!
pause