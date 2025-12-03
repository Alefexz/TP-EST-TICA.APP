import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/FirebaseConfig';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Função para buscar dados atualizados do perfil
  const refreshProfile = async (uid) => {
    if (!uid) return { has: false };
    try {
      console.log(`[AuthContext] Buscando perfil atualizado para UID: ${uid}...`);
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        console.log(`[AuthContext] Perfil carregado: ${data.fullName} (${data.role})`);
        return { has: true, role: data.role };
      } else {
        console.log("[AuthContext] Documento do usuário não encontrado no Firestore.");
      }
    } catch (error) {
      console.error("[AuthContext] Erro ao atualizar perfil:", error);
    }
    return { has: false };
  };

  useEffect(() => {
    console.log("[AuthContext] Iniciando observador de autenticação...");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoadingAuth(true);
      if (currentUser) {
        console.log(`[AuthContext] Usuário detectado: ${currentUser.email} (${currentUser.uid})`);
        setUser({ uid: currentUser.uid, email: currentUser.email });
        await refreshProfile(currentUser.uid);
      } else {
        console.log("[AuthContext] Nenhum usuário logado (Logout ou App abriu agora).");
        setUser(null);
        setProfile(null);
        // Se não for visitante, limpa tudo. Se for visitante, mantém o estado isGuest.
        if (!isGuest) {
            console.log("[AuthContext] Estado limpo (Não é visitante).");
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [isGuest]); 

  const logout = async () => {
    try {
      console.log("[AuthContext] Solicitando Logout...");
      await signOut(auth);
      setIsGuest(false);
      setUser(null);
      setProfile(null);
      console.log("[AuthContext] Logout concluído com sucesso.");
    } catch (error) {
      console.error("[AuthContext] Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isGuest,
      isLoadingAuth,
      setIsGuest: (val) => { console.log(`[AuthContext] Modo Visitante definido para: ${val}`); setIsGuest(val); },
      refreshProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);