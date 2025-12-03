import { runTransaction, doc, collection, getDoc } from 'firebase/firestore';
import { db } from './FirebaseConfig';

/**
 * Realiza o agendamento e o pagamento de forma ATÔMICA.
 */
export const processBookingTransaction = async (userId, bookingData, price) => {
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId);
      const newBookingRef = doc(collection(db, "agendamentos"));

      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado!");
      }

      const currentBalance = userDoc.data().fictionalBalance || 0;

      if (currentBalance < price) {
        throw new Error("Saldo insuficiente para realizar este agendamento.");
      }

      const newBalance = currentBalance - price;

      transaction.update(userRef, { fictionalBalance: newBalance });
      
      transaction.set(newBookingRef, {
        ...bookingData,
        clientId: userId, // Garante que o ID do cliente fique salvo
        status: "confirmado",
        createdAt: new Date().toISOString(),
        cancellationFee: 0,
        id: newBookingRef.id
      });
    });

    return { success: true };
    
  } catch (error) {
    console.error("Erro na transação:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancela o agendamento e reembolsa o cliente
 */
export const cancelBookingTransaction = async (bookingId, userId, price) => {
  try {
    await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, "agendamentos", bookingId);
      const userRef = doc(db, "users", userId);

      // 1. Verifica se o agendamento existe e está confirmado
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists()) throw new Error("Agendamento não encontrado.");
      if (bookingDoc.data().status !== 'confirmado') throw new Error("Este agendamento não pode ser cancelado.");

      // 2. Busca dados do usuário para reembolso
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("Usuário não encontrado.");

      const currentBalance = userDoc.data().fictionalBalance || 0;
      const refundAmount = price; // Reembolso integral (ou aplique taxa se quiser: price * 0.7)
      const newBalance = currentBalance + refundAmount;

      // 3. Executa as atualizações
      transaction.update(bookingRef, { status: 'cancelado' });
      transaction.update(userRef, { fictionalBalance: newBalance });
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar:", error);
    return { success: false, error: error.message };
  }
};