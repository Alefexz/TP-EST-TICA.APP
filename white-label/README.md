# 🏗️ White-label Builder - EstetiOne

Sistema para criar apps personalizados para clientes.

## Como Usar

### 1. Crie um cliente
```javascript
// Edite o builder.js e modifique clientConfig
const clientConfig = {
  id: 'nome-do-cliente',
  name: 'Nome do Cliente',
  primaryColor: '#COR_PRINCIPAL',
  secondaryColor: '#COR_SECUNDARIA',
  logo: 'EMOJI_OU_URL',
  packageName: 'com.cliente.app',
  website: 'https://cliente.estetione.com',
  firebaseProjectId: 'cliente-app'
};