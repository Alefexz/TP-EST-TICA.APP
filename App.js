import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
// A biblioteca de login do Google
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// O "mini banco de dados"
import AsyncStorage from '@react-native-async-storage/async-storage';
// Componente corrigido para Safe Area
import { SafeAreaView } from 'react-native-safe-area-context';


// --- Ícones Simplificados ---
const HomeIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>;
const CalendarIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🗓️</Text>;
const SearchIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🔍</Text>;
const UserIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>;
const BackArrowIcon = () => <Text style={{ fontSize: 24 }}>‹</Text>;
const GoogleIcon = () => <Text style={{fontSize: 18, color: '#4285F4', fontWeight: 'bold'}}>G</Text>;
const CheckCircleIcon = () => <Text style={{fontSize: 60, color: '#22c55e'}}>✓</Text>;
const LogoutIcon = () => <Text style={{fontSize: 20, color: '#ef4444'}}>🚪</Text>;


// --- Tela de Boas-Vindas ---
const WelcomeScreen = ({ onNavigate }) => (
  <View style={styles.container}>
    <Text style={styles.title}>TP Estética</Text>
    <Text style={styles.subtitle}>Sua beleza, na palma da sua mão.</Text>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.primaryButton} onPress={() => onNavigate('login')}>
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => onNavigate('login')}>
        <Text style={styles.secondaryButtonText}>Criar Conta</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// --- Tela de Autenticação ---
const AuthScreen = ({ onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);

    const signIn = async () => {
        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            if (userInfo && userInfo.user) {
              onLoginSuccess(userInfo.user); // Envia os dados do usuário para o App principal
            } else {
              throw new Error("User info is missing.");
            }
        } catch (error) {
            if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
                console.error("Erro detalhado do Google Login:", JSON.stringify(error));
                Alert.alert("Erro de Login", "O login falhou. Verifique sua conexão e se as configurações no Google Cloud (SHA-1, Web Client ID, Usuário de teste) estão corretas. Detalhes: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
          <Text style={styles.title}>TP Estética</Text>
          <Text style={styles.subtitle}>Sua beleza, na palma da sua mão.</Text>
          <Text style={styles.welcomeBack}>Acesse sua conta</Text>
          <View style={{...styles.buttonContainer, marginTop: 40}}>
             <TouchableOpacity style={styles.googleButton} onPress={signIn} disabled={isLoading}>
                {isLoading ? <ActivityIndicator size="small" color="#000000" /> : (<>
                    <GoogleIcon />
                    <Text style={styles.googleButtonText}>Entrar com Google</Text>
                </>)}
             </TouchableOpacity>
          </View>
        </View>
    );
};

// --- Tela de Cadastro (Simplificada) ---
const CadastroScreen = ({ onNavigate, route }) => {
    useEffect(() => {
        // Pula direto para o App principal após o login
        onNavigate('mainApp', route.params);
    }, []);


    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#E6AAB7" />
            <Text style={{marginTop: 15, fontSize: 16, color: '#8A74A8'}}>Carregando seu perfil...</Text>
        </View>
    );
};


// --- Tela Inicial ---
const HomeScreen = ({ onNavigateToAgendamentos, user }) => (
    <View style={[styles.container, { justifyContent: 'flex-start', paddingTop: 60, paddingBottom: 90 }]}>
      <Text style={styles.headerTitle}>Início</Text>
      <Text style={styles.greeting}>Olá, {user?.givenName || 'Cliente'}!</Text>
      <View style={styles.promoCard}>
        <Image 
            source={{ uri: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop" }} 
            style={styles.promoImage}
        />
        <View style={styles.promoOverlay}>
          <Text style={styles.promoTitle}>Promoção da Semana!</Text>
          <Text style={styles.promoSubtitle}>Limpeza de Pele com 20% OFF</Text>
        </View>
      </View>
      <View style={[styles.buttonContainer, { marginTop: 30 }]}>
         <TouchableOpacity style={styles.primaryButton} onPress={onNavigateToAgendamentos}>
           <Text style={styles.primaryButtonText}>Agendar um Serviço</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.secondaryButton} onPress={onNavigateToAgendamentos}>
           <Text style={styles.secondaryButtonText}>Meus Agendamentos</Text>
         </TouchableOpacity>
      </View>
    </View>
);

// --- TELA DE PERFIL ---
const PerfilScreen = ({ user, onLogout }) => {
    const handleLogout = () => {
        Alert.alert( "Sair", "Você tem certeza que deseja sair?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", onPress: onLogout }
            ]
        );
    };
    
    return (
        <View style={[styles.container, { justifyContent: 'flex-start', paddingTop: 60 }]}>
            <Text style={styles.greeting}>Meu Perfil</Text>
            {user ? (
                <View style={styles.profileCard}>
                    <Image source={{ uri: user.photo }} style={styles.profilePhoto} />
                    <Text style={styles.profileName}>{user.name}</Text>
                    <Text style={styles.profileEmail}>{user.email}</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <LogoutIcon />
                        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
                    </TouchableOpacity>
                </View>
            ) : ( <ActivityIndicator size="large" color="#E6AAB7" /> )}
        </View>
    );
};


// --- Componentes do Agendamento (Placeholder) ---
const AgendamentosScreen = ({user, onNavigate}) => (<View style={styles.container}><Text>Tela de Agendamentos</Text></View>);
const ExplorarScreen = () => (<View style={styles.container}><Text>Tela de Explorar</Text></View>);
const ConfirmationScreen = () => (<View style={styles.container}><Text>Tela de Confirmação</Text></View>);
const SuccessScreen = () => (<View style={styles.container}><Text>Tela de Sucesso</Text></View>);


const TabBar = ({ activeTab, onTabPress }) => (
    <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('inicio')}><HomeIcon color={activeTab === 'inicio' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'inicio' ? '#A78B4F' : '#C0B49D' }]}>Início</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('agendamentos')}><CalendarIcon color={activeTab === 'agendamentos' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'agendamentos' ? '#A78B4F' : '#C0B49D' }]}>Agendamentos</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('explorar')}><SearchIcon color={activeTab === 'explorar' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'explorar' ? '#A78B4F' : '#C0B49D' }]}>Explorar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('perfil')}><UserIcon color={activeTab === 'perfil' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'perfil' ? '#A78B4F' : '#C0B49D' }]}>Perfil</Text></TouchableOpacity>
    </View>
);

const MainApp = ({ user, onLogout, onNavigate, route }) => {
  const initialTab = route?.params?.activeTab || 'inicio';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    if (route?.params?.activeTab) {
        setActiveTab(route.params.activeTab);
    }
  }, [route]);

  const renderContent = () => { 
    const props = { user, onNavigate, route };
    switch (activeTab) { 
        case 'agendamentos': return <AgendamentosScreen {...props} />; 
        case 'explorar': return <ExplorarScreen {...props} />; 
        case 'perfil': return <PerfilScreen user={user} onLogout={onLogout} />; 
        case 'inicio': default: return <HomeScreen onNavigateToAgendamentos={() => setActiveTab('agendamentos')} user={user} />; 
    } 
  };
  return ( <View style={{ flex: 1 }}>{renderContent()}<TabBar activeTab={activeTab} onTabPress={setActiveTab} /></View> );
};

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [user, setUser] = useState(null);
  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    GoogleSignin.configure({ 
      webClientId: '1059010430905-kl6cfm61nb7lvcg0gtsl53vhnr0soql8.apps.googleusercontent.com', 
      scopes: ['profile', 'email'] // Esta é a correção dos escopos
    });
    const checkLoginStatus = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@user');
            if (jsonValue != null) {
                setUser(JSON.parse(jsonValue));
                setScreen('mainApp');
            } else {
                setScreen('welcome');
            }
        } catch (e) { setScreen('welcome'); }
    };
    checkLoginStatus();
  }, []);

  const handleNavigate = (newScreen, params = {}) => {
      setRouteParams({ params });
      setScreen(newScreen);
  };
  
  const handleLoginSuccess = async (userData) => {
      if (!userData) {
        Alert.alert("Erro", "Não foi possível obter os dados do usuário do Google.");
        return;
      }
      try {
          await AsyncStorage.setItem('@user', JSON.stringify(userData));
          setUser(userData);
          setScreen('mainApp');
      } catch (e) { console.error("Failed to save user data", e); }
  };

  const handleLogout = async () => {
      try {
          await GoogleSignin.signOut();
          await AsyncStorage.removeItem('@user');
          setUser(null);
          setScreen('welcome');
      } catch (error) { console.error(error); }
  };
  
  const renderScreen = () => { 
      if (screen === 'loading') {
          return <View style={styles.container}><ActivityIndicator size="large" color="#E6AAB7" /></View>;
      }
      const props = { onNavigate: handleNavigate, user: user, route: routeParams };
      switch (screen) { 
          case 'login': return <AuthScreen onLoginSuccess={handleLoginSuccess} />; 
          case 'mainApp': return <MainApp {...props} onLogout={handleLogout} />; 
          case 'confirmation': return <ConfirmationScreen {...props} />;
          case 'success': return <SuccessScreen {...props} />;
        // O ERRO DE TEXTO SOLTO FOI REMOVIDO DAQUI
          case 'welcome': default: return <WelcomeScreen {...props} />; 
      } 
  };
  return ( <SafeAreaView style={styles.safeArea}>{renderScreen()}</SafeAreaView> );
}

// Estilos
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDF5F7' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#FDF5F7' },
  title: { fontFamily: "serif", fontSize: 42, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', },
  subtitle: { fontSize: 16, color: '#8A74A8', marginTop: 8, textAlign: 'center', },
  buttonContainer: { marginTop: 50, width: '100%', },
  primaryButton: { width: '100%', paddingVertical: 15, backgroundColor: '#E6AAB7', borderRadius: 25, marginBottom: 15, alignItems: 'center', },
  primaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', },
  secondaryButton: { width: '100%', paddingVertical: 13, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 25, alignItems: 'center', },
  secondaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37', },
  welcomeBack: { fontSize: 24, color: '#8A74A8', marginTop: 40, marginBottom: 30, },
  form: { width: '100%', },
  input: { width: '100%', padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFF', borderRadius: 15, marginBottom: 15, },
  googleButton: { width: 'auto', minWidth: 200, height: 50, paddingHorizontal: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  googleButtonText: { marginLeft: 10, fontSize: 16, fontWeight: 'bold', color: '#333', },
  headerTitle: { position: 'absolute', top: 20, alignSelf: 'center', fontSize: 18, fontWeight: 'bold', color: '#333', },
  greeting: { fontSize: 32, color: '#8A74A8', alignSelf: 'flex-start', marginBottom: 20, },
  promoCard: { width: '100%', height: 180, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', overflow: 'hidden', },
  promoImage: { width: '100%', height: '100%', position: 'absolute', opacity: 0.8, },
  promoOverlay: { position: 'absolute', backgroundColor: 'rgba(230, 170, 183, 0.7)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, },
- promoTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', },
  promoSubtitle: { fontSize: 14, color: '#FFF', marginTop: 5, },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, paddingTop: 10, paddingBottom: 30, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', },
  tabItem: { alignItems: 'center', flex: 1, },
  tabLabel: { fontSize: 12, color: '#C0B49D', marginTop: 4, },
  profileCard: { width: '100%', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, },
  profilePhoto: { width: 100, height: 100, borderRadius: 50, marginBottom: 20, },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#333', },
  profileEmail: { fontSize: 16, color: '#777', marginTop: 4, },
  logoutButton: { flexDirection: 'row', alignItems: 'center', marginTop: 30, backgroundColor: '#fecaca', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, },
  logoutButtonText: { color: '#ef4444', fontWeight: 'bold', marginLeft: 8, fontSize: 16, }
});
