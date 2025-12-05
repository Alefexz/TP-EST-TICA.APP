const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas básicas
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EstetiOne API rodando' });
});

app.get('/api/professionals/:slug', (req, res) => {
  const { slug } = req.params;
  res.json({
    id: 'prof-123',
    name: 'Profissional Exemplo',
    slug: slug,
    profession: 'Manicure',
    rating: 4.9,
    services: [
      { id: '1', name: 'Manicure Completa', price: 45, duration: 45 },
      { id: '2', name: 'Pedicure', price: 50, duration: 60 }
    ]
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});