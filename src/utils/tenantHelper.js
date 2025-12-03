import * as Linking from 'expo-linking';

/**
 * Descobre qual é a clínica baseada no link que abriu o app.
 * Ex: markey.app/?clinica=estetica-ana -> Retorna 'estetica-ana'
 */
export const getTenantFromUrl = async () => {
  try {
    const initialUrl = await Linking.getInitialURL();
    
    if (!initialUrl) return null;

    // Pega os parâmetros da URL
    const { queryParams } = Linking.parse(initialUrl);

    if (queryParams && queryParams.clinica) {
      return queryParams.clinica; // Retorna o slug da clínica
    }

    return null; // É o app genérico
  } catch (error) {
    console.error("Erro ao ler link:", error);
    return null;
  }
};

/**
 * Gera o link para compartilhamento
 */
export const generateTenantLink = (slug) => {
  // Em produção, substitua pelo seu domínio real
  const baseUrl = "https://markey.app"; 
  return `${baseUrl}/?clinica=${slug}`;
};