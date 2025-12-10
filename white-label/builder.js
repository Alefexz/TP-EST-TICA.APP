const fs = require('fs');
const path = require('path');

console.log('🔧 White-label Builder - EstetiOne');
console.log('==================================');

// Exemplo de cliente
const exampleClient = {
  id: 'ana-beleza',
  name: 'Ana Beleza',
  primaryColor: '#FF6B8B',
  secondaryColor: '#FFA726',
  logo: '💅',
  packageName: 'com.anabeleza.app',
  website: 'https://anabeleza.estetione.com'
};

function createWhiteLabelApp(client) {
  console.log(`\n🏗️  Criando app para: ${client.name}`);
  
  // 1. Criar pasta do cliente
  const clientDir = path.join(__dirname, client.id);
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }
  
  // 2. Criar app.json personalizado
  const baseAppJson = require('../app.json');
  const customAppJson = {
    ...baseAppJson,
    expo: {
      ...baseAppJson.expo,
      name: client.name,
      slug: client.id,
      primaryColor: client.primaryColor,
      ios: {
        ...baseAppJson.expo.ios,
        bundleIdentifier: client.packageName
      },
      android: {
        ...baseAppJson.expo.android,
        package: client.packageName
      },
      web: {
        ...baseAppJson.expo.web,
        name: client.name,
        shortName: client.name,
        themeColor: client.primaryColor,
        startUrl: client.website || '/'
      }
    }
  };
  
  // 3. Criar theme.json
  const themeConfig = {
    theme: {
      primary: client.primaryColor,
      secondary: client.secondaryColor,
      name: client.name,
      logo: client.logo,
      clientId: client.id
    },
    firebase: {
      // Configs do Firebase serão injetadas depois
      apiKey: "{{CLIENT_FIREBASE_API_KEY}}",
      authDomain: "{{CLIENT_FIREBASE_AUTH_DOMAIN}}",
      projectId: "{{CLIENT_FIREBASE_PROJECT_ID}}"
    }
  };
  
  // 4. Salvar arquivos
  fs.writeFileSync(
    path.join(clientDir, 'app.json'),
    JSON.stringify(customAppJson, null, 2)
  );
  
  fs.writeFileSync(
    path.join(clientDir, 'theme.json'),
    JSON.stringify(themeConfig, null, 2)
  );
  
  // 5. Criar README
  const readme = `# ${client.name} - App Personalizado

Este app foi gerado automaticamente pelo EstetiOne.

## Configurações
- Nome: ${client.name}
- Cores: Primária ${client.primaryColor}, Secundária ${client.secondaryColor}
- Logo: ${client.logo}
- Package: ${client.packageName}

## Como buildar
1. Configure o Firebase para este cliente
2. Substitua as variáveis em theme.json
3. Execute: \`expo build:web\`

## URLs
- Web: ${client.website || 'https://' + client.id + '.estetione.com'}
- Play Store: (configurar depois)
- App Store: (configurar depois)
`;

  fs.writeFileSync(path.join(clientDir, 'README.md'), readme);
  
  console.log(`✅ App criado em: ${clientDir}`);
  console.log(`🎨 Cores: ${client.primaryColor}, ${client.secondaryColor}`);
  console.log(`📦 Package: ${client.packageName}`);
}

// Teste com exemplo
createWhiteLabelApp(exampleClient);

console.log('\n📋 Para usar depois:');
console.log('node white-label/builder.js --client="nome" --primary="#cor" --secondary="#cor"');