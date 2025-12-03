// Simulação de uma IA simples baseada em regras para o MVP
// No futuro, você pode substituir isso por uma chamada real à OpenAI/Gemini

export const processAIQuery = async (text) => {
  const lowerText = text.toLowerCase();

  // Simula um "tempo de pensamento" da IA
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (lowerText.includes('olá') || lowerText.includes('oi') || lowerText.includes('bom dia')) {
    return "Olá! Sou a Bia, sua assistente de beleza. Como posso ajudar você a realçar sua autoestima hoje?";
  }

  if (lowerText.includes('preço') || lowerText.includes('valor') || lowerText.includes('quanto custa')) {
    if (lowerText.includes('botox')) return "A aplicação de Botox está a partir de R$ 100,00. Gostaria de ver os horários disponíveis?";
    if (lowerText.includes('limpeza')) return "Nossa Limpeza de Pele Profunda é R$ 150,00. É excelente para renovar a pele!";
    return "Temos diversos procedimentos! Botox (R$ 100), Limpeza de Pele (R$ 150) e Peeling (R$ 250). Qual te interessa?";
  }

  if (lowerText.includes('horário') || lowerText.includes('agenda') || lowerText.includes('marcar')) {
    return "Você pode verificar nossa agenda em tempo real na aba 'Agendar'. Geralmente temos vagas a partir das 09:00!";
  }

  if (lowerText.includes('local') || lowerText.includes('onde') || lowerText.includes('endereço')) {
    return "Estamos localizados na Rua das Flores, 123, Centro. Temos estacionamento gratuito!";
  }

  if (lowerText.includes('dor') || lowerText.includes('dói')) {
    return "A maioria dos nossos procedimentos é muito tranquila! Usamos anestésicos tópicos para garantir seu conforto.";
  }

  // Resposta padrão caso não entenda
  return "Desculpe, ainda estou aprendendo sobre estética! Mas você pode ver todos os nossos serviços na tela inicial ou falar com uma recepcionista pelo (11) 99999-9999.";
};