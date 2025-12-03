const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. CRIAÇÃO DE TENANT (CLÍNICA) AUTOMÁTICA
 * Chamada quando o profissional termina o cadastro.
 * Cria a estrutura da clínica e define o usuário como "Dono".
 */
exports.createTenant = functions.https.onCall(async (data, context) => {
  // Segurança: Garante que o usuário está logado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Necessário estar logado.');
  }

  const { nomeFantasia, emailDon, plano } = data;
  
  // Gera um "Slug" (link) único e limpo
  // Ex: "Estética da Ana" vira "estetica-da-ana"
  const slug = nomeFantasia
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, '-') // Espaço vira traço
    .replace(/[^\w-]+/g, ''); // Remove caracteres especiais

  // Verifica se o link já existe no banco
  const slugCheck = await db.collection('tenants').where('slug', '==', slug).get();
  if (!slugCheck.empty) {
    throw new functions.https.HttpsError('already-exists', 'Este link já está em uso. Tente outro nome para o estúdio.');
  }

  // Cria um ID único para a nova clínica
  const tenantId = db.collection('tenants').doc().id;

  // Salva os dados da Clínica na coleção 'tenants'
  await db.collection('tenants').doc(tenantId).set({
    name: nomeFantasia,
    slug: slug,
    ownerId: context.auth.uid,
    ownerEmail: emailDon,
    plan: plano || 'free', // free, pro, premium
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: {
      primaryColor: '#E6AAB7', // Cor padrão do App
      logo: null
    }
  });

  // Atualiza o Usuário para ser Dono dessa Clínica e Profissional
  await db.collection('users').doc(context.auth.uid).update({
    role: 'professional',
    tenantId: tenantId,
    isOwner: true,
    plan: plano || 'free'
  });

  return { success: true, tenantId, slug, link: `markey.app/${slug}` };
});

/**
 * 2. WEBHOOK MERCADO PAGO (Estrutura Pronta)
 * Essa função ficará ouvindo avisos de pagamento automático.
 * Quando o Mercado Pago avisar "Pagou", essa função libera o plano Premium.
 */
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  const { type, data } = req.body;

  try {
    // Salva o log do aviso para segurança (Auditoria)
    await db.collection('webhookLogs').add({
      provider: 'mercadopago',
      payload: req.body,
      receivedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Lógica futura de ativação de plano:
    if (type === 'payment') {
      // 1. Verificar ID do pagamento na API do MP
      // 2. Se aprovado -> Liberar acesso do tenant
      console.log("Pagamento recebido:", data.id);
    }

    // Responde 200 OK para o Mercado Pago não ficar reenviando
    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).send("Erro interno");
  }
});