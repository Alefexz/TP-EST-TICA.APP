import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, Alert, ScrollView, Platform, FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, 
  collection, query, where, onSnapshot, orderBy // Novos imports do Firestore
} from 'firebase/firestore';
// Imports de Storage e ImagePicker foram REMOVIDOS

console.log("App.js: Versão Cliente/Profissional iniciada.");

// --- Ícones ---
const HomeIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>;
const CalendarIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🗓️</Text>;
const ListIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🧾</Text>; // Novo ícone para "Meus Agendamentos"
const UserIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>;
const LogoutIcon = () => <Text style={{fontSize: 20, color: '#ef4444'}}>🚪</Text>;
const MailIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>✉️</Text>;
const LockIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>🔒</Text>;
const PhoneIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>📱</Text>;
const PersonIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>🧑</Text>;
const BackArrowIcon = () => <Text style={{ fontSize: 24, color: '#8A74A8' }}>‹</Text>;
const EyeIcon = ({ closed }) => <Text style={{fontSize: 20, color: '#8A74A8'}}>{closed ? '👁️‍🗨️' : '👁️'}</Text>;
const CheckIcon = () => <Text style={{fontSize: 18, color: '#FFF'}}>✓</Text>;
const MoneyIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>💳</Text>;
const ProIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>💼</Text>; // Novo ícone para Profissional

// --- SUA CONFIGURAÇÃO DO FIREBASE (CORRETA) ---
const firebaseConfig = {
  apiKey: "AIzaSyBHa79_Aj4awAuhujooHG9-VVb8iMHdQ_Y",
  authDomain: "tpesteticaapp.firebaseapp.com",
  projectId: "tpesteticaapp",
  storageBucket: "tpesteticaapp.firebasestorage.app",
  messagingSenderId: "1059010430905",
  appId: "1:1059010430905:web:9fa85d48fe1509664e1868",
  measurementId: "G-YHSHGETNCD"
};
// =========================================================================

console.log("App.js: firebaseConfig definida.");

// --- Inicialização ---
let app; let auth; let db;
let firebaseInitializationError = null;
try {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  db = getFirestore(app);
  console.log("App.js: Firebase (Auth/Firestore) inicializado!");
} catch (error) {
  console.error("ERRO GRAVE NA INICIALIZAÇÃO DO FIREBASE:", error.message);
  firebaseInitializationError = error;
}

// --- Contexto de Autenticação (Agora guarda a FUNÇÃO) ---
const AuthContext = createContext({ 
  user: null, // Dados do Auth (uid, email)
  profile: null, // Dados do Firestore (fullName, phone, role)
  userRole: 'loading', // 'loading', 'client', 'professional', 'guest'
  isLoadingAuth: true,
  refreshProfile: async () => false,
});
const useAuth = () => useContext(AuthContext);

// --- Telas de Autenticação (CLIENTE E PROFISSIONAL) ---
const WelcomeScreen = ({ onNavigate }) => (
 <View style={styles.container}>
   <Text style={styles.title}>TP Estética</Text>
   <Text style={styles.subtitle}>Sua beleza, na palma da sua mão.</Text>
   <View style={styles.buttonContainer}>
     <Text style={styles.sectionTitle}>Para Clientes</Text>
     <TouchableOpacity style={styles.primaryButton} onPress={() => onNavigate('login')}><Text style={styles.primaryButtonText}>Entrar</Text></TouchableOpacity>
     <TouchableOpacity style={styles.secondaryButton} onPress={() => onNavigate('register')}><Text style={styles.secondaryButtonText}>Criar Conta</Text></TouchableOpacity>
     <TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('mainApp_client', { isGuest: true })}><Text style={styles.ghostButtonText}>Continuar como Visitante</Text></TouchableOpacity>

     <View style={{height: 30}} />
     <Text style={styles.sectionTitle}>Para Profissionais</Text>
     <TouchableOpacity style={styles.proButton} onPress={() => onNavigate('proLogin')}><Text style={styles.proButtonText}>Login Profissional</Text></TouchableOpacity>
   </View>
 </View>
);

const LoginScreen = ({ onNavigate }) => { 
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => { if (!auth) return; if (email === '' || password === '') { Alert.alert("Erro", "Preencha e-mail e senha."); return; } setIsLoading(true); try { await signInWithEmailAndPassword(auth, email.trim(), password); } catch (error) { setIsLoading(false); Alert.alert("Erro de Login", "E-mail ou senha incorretos."); }};
  return ( <View style={styles.container}><Text style={styles.welcomeBack}>Login (Cliente)</Text><View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Digite sua senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity></View><TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('welcome')}><Text style={styles.ghostButtonText}>‹ Voltar</Text></TouchableOpacity></View> );
};

const RegisterScreen = ({ onNavigate }) => { 
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false); const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleRegister = async () => { if (!auth) return; if (password !== confirmPassword) { Alert.alert("Erro", "As senhas não são iguais."); return; } if (password.length < 6) { Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres."); return; } setIsLoading(true); try { await createUserWithEmailAndPassword(auth, email.trim(), password); } catch (error) { setIsLoading(false); if (error.code === 'auth/email-already-in-use') { Alert.alert("Erro", "Este e-mail já está cadastrado."); } else { Alert.alert("Erro de Cadastro", "Não foi possível criar a conta."); } }};
  return ( <View style={styles.container}><Text style={styles.welcomeBack}>Criar Conta (Cliente)</Text><View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Crie uma senha (mín. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Confirme sua senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><EyeIcon closed={!showConfirmPassword} /></TouchableOpacity></View><TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Criar Conta</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('welcome')}><Text style={styles.ghostButtonText}>‹ Voltar</Text></TouchableOpacity></View> );
};

const CompleteProfileScreen = ({ onNavigate }) => { 
  const [fullName, setFullName] = useState(''); const [phone, setPhone] = useState(''); const [isLoading, setIsLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const handleSaveProfile = async () => {
    if (!user || !user.uid || !db) { Alert.alert("Erro", "Usuário ou conexão ausente."); return; }
    if (fullName.trim() === '' || phone.trim() === '') { Alert.alert("Erro", "Preencha Nome Completo e Celular."); return; }
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: user.email,
        photoURL: null,
        role: 'client', // *** IMPORTANTE: Define a função como Cliente ***
      }, { merge: true });
      await refreshProfile(user.uid);
      // O onAuthStateChanged vai pegar a mudança e navegar
    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao salvar perfil:", error);
      Alert.alert("Erro", "Não foi possível salvar seu perfil.");
    }
  };
  return ( <View style={styles.container}><Text style={styles.title}>Quase lá!</Text><Text style={styles.subtitle}>Complete seu perfil de cliente.</Text><View style={styles.inputContainer}><PersonIcon /><TextInput style={styles.input} placeholder="Digite seu nome completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><PhoneIcon /><TextInput style={styles.input} placeholder="Digite seu Celular (com DDD)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#AAA" /></View><TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Salvar e Entrar</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => { if(auth) signOut(auth); }}><Text style={styles.ghostButtonText}>Cancelar e Sair</Text></TouchableOpacity></View> );
};

// --- NOVAS Telas Profissionais ---
const ProfessionalLoginScreen = ({ onNavigate }) => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => { if (!auth) return; if (email === '' || password === '') { Alert.alert("Erro", "Preencha e-mail e senha."); return; } setIsLoading(true); try { await signInWithEmailAndPassword(auth, email.trim(), password); /* onAuthStateChanged vai checar a 'role' e direcionar */ } catch (error) { setIsLoading(false); Alert.alert("Erro de Login", "E-mail ou senha de profissional incorretos."); }};
  return ( <View style={styles.container}><Text style={styles.welcomeBack}>Login Profissional</Text><View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Digite sua senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity></View><TouchableOpacity style={styles.proButton} onPress={handleLogin} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.proButtonText}>Entrar</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('proRegister')}><Text style={styles.ghostButtonText}>Criar Conta Profissional</Text></TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('welcome')}><Text style={styles.ghostButtonText}>‹ Voltar</Text></TouchableOpacity></View> );
};

const ProfessionalRegisterScreen = ({ onNavigate }) => {
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [secretCode, setSecretCode] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const PROFESSIONAL_SECRET_CODE = "3429"; // <<< O CÓDIGO SECRETO ESTÁ AQUI

  const handleRegister = async () => {
    if (!auth || !db) return;
    if (secretCode.trim() !== PROFESSIONAL_SECRET_CODE) {
      Alert.alert("Erro", "Código de cadastro secreto incorreto.");
      return;
    }
    if (password.length < 6) { Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres."); return; }
    if (fullName.trim() === '' || email.trim() === '') { Alert.alert("Erro", "Preencha Nome e E-mail."); return; }

    setIsLoading(true);
    try {
      // 1. Cria o usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      // 2. Salva o perfil no Firestore com a 'role'
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        fullName: fullName.trim(),
        email: user.email,
        phone: '', // Profissional pode preencher depois no perfil
        role: 'professional', // *** IMPORTANTE: Define a função como Profissional ***
      });
      
      // O onAuthStateChanged vai pegar e navegar para 'mainApp_pro'
      
    } catch (error) {
      setIsLoading(false);
      if (error.code === 'auth/email-already-in-use') { Alert.alert("Erro", "Este e-mail já está cadastrado."); }
      else { Alert.alert("Erro", "Não foi possível criar a conta."); }
    }
  };

  return ( <View style={styles.container}><Text style={styles.welcomeBack}>Cadastro Profissional</Text><View style={styles.inputContainer}><PersonIcon /><TextInput style={styles.input} placeholder="Seu Nome Completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Seu E-mail de login" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Crie uma senha (mín. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity></View><View style={styles.inputContainer}><ProIcon /><TextInput style={styles.input} placeholder="Código Secreto de Cadastro" value={secretCode} onChangeText={setSecretCode} secureTextEntry={true} placeholderTextColor="#AAA" /></View><TouchableOpacity style={styles.proButton} onPress={handleRegister} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.proButtonText}>Criar Conta Profissional</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('proLogin')}><Text style={styles.ghostButtonText}>‹ Voltar para Login</Text></TouchableOpacity></View> );
};


// --- FLUXO DO CLIENTE ---
const HomeScreen = ({ onNavigateToAgendamentos }) => {
  const { user, isGuest, profile } = useAuth();
  const displayName = isGuest ? 'Visitante' : (profile?.fullName || user?.email?.split('@')[0] || 'Cliente');
  return (
    <ScrollView style={styles.page}>
      <Text style={styles.greeting}>Olá, {displayName}!</Text>
      <View style={styles.promoCard}>
        <Image source={{ uri: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop" }} style={styles.promoImage} resizeMode="cover" />
        <View style={styles.promoOverlay}>
          <Text style={styles.promoTitle}>Promoção!</Text>
          <Text style={styles.promoSubtitle}>Limpeza de Pele 20% OFF</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.primaryButton, {marginTop: 30}]} onPress={onNavigateToAgendamentos}>
        <Text style={styles.primaryButtonText}>Agendar Serviço</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Serviços Populares</Text>
      <View style={styles.serviceRow}>
          <TouchableOpacity style={styles.serviceCardSmall} onPress={onNavigateToAgendamentos}><Text style={styles.serviceCardSmallText}>Botox</Text></TouchableOpacity>
          <TouchableOpacity style={styles.serviceCardSmall} onPress={onNavigateToAgendamentos}><Text style={styles.serviceCardSmallText}>Manicure</Text></TouchableOpacity>
          <TouchableOpacity style={styles.serviceCardSmall} onPress={onNavigateToAgendamentos}><Text style={styles.serviceCardSmallText}>Pedicure</Text></TouchableOpacity>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const SERVICES_DATA = [
  { id: 'manicure', title: 'Manicure & Pedicure', image: 'https://images.unsplash.com/photo-1632345031435-8727f66c0274?q=80&w=800&auto=format&fit=crop', professional: { name: 'Ana Silva', id: 'ID_DA_ANA_SILVA_NO_FIREBASE' }, photo: 'https://placehold.co/100x100/E6AAB7/FFF?text=AS' },
  { id: 'estetica', title: 'Estética Facial', image: 'https://images.unsplash.com/photo-1512290923902-8a9f31c83659?q=80&w=800&auto=format&fit=crop', professional: { name: 'Thais de Paulo', id: 'ID_DA_THAIS_NO_FIREBASE' }, photo: 'https://placehold.co/100x100/D4AF37/FFF?text=TD' }, subServices: [
      { id: 'botox', title: 'Aplicação de Botox' },
      { id: 'limpeza', title: 'Limpeza de Pele Profunda' },
      { id: 'peeling', title: 'Peeling Químico Suave' },
    ]
  },
];

const BOOKED_TIMES = { '2025-11-04': ['10:00', '14:00'], '2025-11-05': ['11:00', '15:00'], };
const CalendarGrid = ({ selectedDate, onDateSelect }) => { const days = []; const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; let startDate = new Date(); for (let i = 0; i < 21; i++) { const date = new Date(startDate); date.setDate(startDate.getDate() + i); const dateString = date.toISOString().split('T')[0]; const dayOfMonth = date.getDate(); const dayOfWeek = dayNames[date.getDay()]; days.push({ dateString, dayOfMonth, dayOfWeek, id: i }); } const weeks = []; for (let i = 0; i < days.length; i += 7) { weeks.push(days.slice(i, i + 7)); } return ( <View style={styles.calendarGrid}>{weeks.map((week, weekIndex) => ( <View key={weekIndex} style={styles.calendarRow}>{week.map((day) => { const isSelected = selectedDate === day.dateString; return ( <TouchableOpacity key={day.id} style={[styles.dateCell, isSelected && styles.dateCellSelected]} onPress={() => onDateSelect(day.dateString)}><Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>{day.dayOfWeek}</Text><Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{day.dayOfMonth}</Text></TouchableOpacity> ); })}</View> ))}</View> ); };
const generateTimeSlots = (selectedDateISO) => { const slots = []; const bookedSlots = BOOKED_TIMES[selectedDateISO] || []; for (let hour = 7; hour <= 17; hour++) { const displayHour = hour.toString().padStart(2, '0'); const displayTime = `${displayHour}:00`; const isBooked = bookedSlots.includes(displayTime); slots.push({ time: displayTime, iso: `${selectedDateISO}T${displayHour}:00:00`, isBooked: isBooked }); } return slots; };

const AgendamentosScreen = ({ onNavigate }) => {
  const { user, isGuest } = useAuth(); const [step, setStep] = useState(1); const [selectedService, setSelectedService] = useState(null); const [selectedSubService, setSelectedSubService] = useState(null); const [selectedDate, setSelectedDate] = useState(null); const [selectedTime, setSelectedTime] = useState(null); const [timeSlots, setTimeSlots] = useState([]);
  const goToPayment = () => { if (!selectedService || !selectedDate || !selectedTime) return; const bookingDetails = { serviceTitle: selectedSubService?.title || selectedService.title, professional: selectedService.professional.name, professionalId: selectedService.professional.id, date: selectedDate, time: selectedTime.time, }; onNavigate('payment', { booking: bookingDetails }); };
  const checkLoginAndProceed = (nextStep) => { if (isGuest || !user) { Alert.alert("Login Necessário", "Crie uma conta ou faça login para agendar.", [{ text: "Cancelar" }, { text: "Login/Cadastro", onPress: () => onNavigate('welcome') }] ); } else { setStep(nextStep); } };
  const handleServiceSelect = (service) => { setSelectedService(service); setSelectedSubService(null); setSelectedDate(null); setSelectedTime(null); if (service.subServices) { setStep(1.5); } else { checkLoginAndProceed(2); } };
  const handleSubServiceSelect = (subService) => { setSelectedSubService(subService); checkLoginAndProceed(2); };
  const handleDateSelect = (dateString) => { setSelectedDate(dateString); setSelectedTime(null); setTimeSlots(generateTimeSlots(dateString)); };
  const handleConfirmarHorario = () => { goToPayment(); };
  const resetFlow = () => { setStep(1); setSelectedService(null); setSelectedSubService(null); setSelectedDate(null); setSelectedTime(null); };

  if (step === 1) { return ( <ScrollView style={styles.page}><Text style={styles.greeting}>Agendar Serviço</Text><Text style={styles.sectionTitle}>Escolha uma Categoria</Text>{SERVICES_DATA.map(service => ( <TouchableOpacity key={service.id} style={styles.promoCard} onPress={() => handleServiceSelect(service)}><Image source={{ uri: service.image }} style={styles.promoImage} resizeMode="cover"/><View style={styles.promoOverlay}><Text style={styles.promoTitle}>{service.title}</Text></View></TouchableOpacity> ))}<View style={{ height: 100 }} /></ScrollView> ); }
  else if (step === 1.5) { return ( <ScrollView style={styles.page}><TouchableOpacity style={styles.backButton} onPress={resetFlow}><BackArrowIcon /><Text style={styles.backButtonText}>Categorias</Text></TouchableOpacity><Text style={styles.greeting}>{selectedService.title}</Text><Text style={styles.sectionTitle}>Profissional</Text><View style={styles.proCard}><Image source={{ uri: selectedService.professional.photo }} style={styles.proPhoto} /><Text style={styles.proName}>{selectedService.professional.name}</Text></View><Text style={styles.sectionTitle}>Escolha o Serviço Específico</Text>{selectedService.subServices.map(sub => ( <TouchableOpacity key={sub.id} style={styles.subServiceCard} onPress={() => handleSubServiceSelect(sub)}><Text style={styles.subServiceTitle}>{sub.title}</Text><Text style={styles.subServiceButton}>Selecionar ›</Text></TouchableOpacity> ))}<View style={{ height: 100 }} /></ScrollView> ); }
  else if (step === 2) {
    const serviceTitle = selectedSubService?.title || selectedService.title;
    const backAction = selectedService.subServices ? () => setStep(1.5) : resetFlow;
    const backText = selectedService.subServices ? selectedService.title : 'Categorias';
    return (
      <ScrollView style={styles.page}>
        <TouchableOpacity style={styles.backButton} onPress={backAction}><BackArrowIcon /><Text style={styles.backButtonText}>{backText}</Text></TouchableOpacity>
        <Text style={styles.greeting}>{serviceTitle}</Text>
        <Text style={styles.sectionTitle}>Escolha uma data</Text>
        <CalendarGrid selectedDate={selectedDate} onDateSelect={handleDateSelect} />
        {selectedDate ? (
          <>
            <Text style={styles.sectionTitle}>Horários para {selectedDate.split('-').reverse().join('/')}</Text>
            {timeSlots.length > 0 ? (
              <View style={styles.timeSlotContainer}>
                {timeSlots.map(slot => (
                  <TouchableOpacity
                    key={slot.iso}
                    style={[styles.timeSlot, slot.isBooked && styles.timeSlotBooked, selectedTime?.iso === slot.iso && styles.timeSlotSelected]}
                    disabled={slot.isBooked}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text style={[styles.timeSlotText, slot.isBooked && styles.timeSlotTextBooked, selectedTime?.iso === slot.iso && styles.timeSlotTextSelected]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : ( <ActivityIndicator style={{marginTop: 20}} color="#E6AAB7"/> )}
          </>
        ) : null}
        {selectedTime ? (
          <TouchableOpacity style={[styles.primaryButton, {marginTop: 30}]} onPress={handleConfirmarHorario}>
            <Text style={styles.primaryButtonText}>Ir para Pagamento ({selectedTime.time})</Text>
          </TouchableOpacity>
        ) : null}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  }
};

// --- TELA DE PAGAMENTO (Agora salva no Firestore) ---
const PaymentScreen = ({ onNavigate, route }) => {
  const { booking } = route.params; const { user, profile } = useAuth(); const [agreedToTerms, setAgreedToTerms] = useState(false); const [isLoading, setIsLoading] = useState(false);
  
  const handleFinalConfirm = async () => {
    if (!agreedToTerms) { Alert.alert("Termos", "Você precisa aceitar os termos de cancelamento para continuar."); return; }
    if (!auth.currentUser || !user || !profile || !db) { Alert.alert("Erro", "Você não está logado corretamente."); return; }
    
    setIsLoading(true);
    console.log("Simulando pagamento...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Pagamento simulado concluído.");

    try {
      // Cria um novo documento na coleção "agendamentos"
      const newBookingRef = doc(collection(db, "agendamentos"));
      
      // Salva os dados no Firestore
      await setDoc(newBookingRef, {
        id: newBookingRef.id,
        clientId: user.uid,
        clientName: profile.fullName,
        clientEmail: user.email,
        service: booking.serviceTitle,
        professional: booking.professional,
        professionalId: booking.professionalId, // Salva o ID da profissional
        date: booking.date,
        time: booking.time,
        status: "confirmado", // 'confirmado', 'cancelado_pelo_cliente', 'cancelado_pelo_pro'
        createdAt: new Date().toISOString(),
      });

      console.log("Agendamento salvo no Firestore!");
      setIsLoading(false);
      Alert.alert("Agendamento Concluído!", "Seu horário foi confirmado.");
      onNavigate('mainApp_client', { activeTab: 'inicio' });

    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao salvar agendamento no Firestore:", error);
      Alert.alert("Erro", "Não foi possível salvar seu agendamento. Verifique sua conexão e as Regras do Firestore.");
    }
  };

  return (
    <ScrollView style={styles.page}>
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('mainApp_client', { activeTab: 'agendamentos' })}>
        <BackArrowIcon />
        <Text style={styles.backButtonText}>Voltar</Text> 
      </TouchableOpacity>
      <Text style={styles.greeting}>Confirmar Agendamento</Text>
      <View style={styles.profileCard}><Text style={styles.sectionTitle}>Resumo</Text><Text style={styles.summaryText}>Serviço: {booking.serviceTitle}</Text><Text style={styles.summaryText}>Profissional: {booking.professional}</Text><Text style={styles.summaryText}>Data: {booking.date.split('-').reverse().join('/')}</Text><Text style={styles.summaryText}>Horário: {booking.time}</Text></View>
      <View style={[styles.profileCard, {marginTop: 20}]}><Text style={styles.sectionTitle}>Termos de Cancelamento</Text><Text style={styles.termsText}>Ao confirmar, você concorda com nossa política de cancelamento. Cancelamentos feitos com menos de 24 horas de antecedência estarão sujeitos a uma<Text style={{fontWeight: 'bold'}}> taxa de cancelamento de 30%</Text> do valor total do serviço.</Text><TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreedToTerms(!agreedToTerms)}><View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>{agreedToTerms ? <CheckIcon /> : null}</View><Text style={styles.checkboxLabel}>Li e concordo com os termos.</Text></TouchableOpacity></View>
      <TouchableOpacity style={[styles.primaryButton, {marginTop: 30, backgroundColor: agreedToTerms ? '#E6AAB7' : '#CCC'}]} onPress={handleFinalConfirm} disabled={isLoading || !agreedToTerms}>{isLoading ? ( <ActivityIndicator color="#FFF" /> ) : ( <Text style={styles.primaryButtonText}>Confirmar e Pagar (Simulado)</Text> )}</TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// --- NOVA TELA: Meus Agendamentos (Cliente) ---
const MeusAgendamentosScreen = ({ onNavigate }) => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !user || !user.uid) { setIsLoading(false); return; }
    const q = query(
      collection(db, "agendamentos"), 
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc") // Ordena pelos mais recentes
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookings = [];
      querySnapshot.forEach((doc) => { bookings.push(doc.data()); });
      setAgendamentos(bookings);
      setIsLoading(false);
    }, (error) => { console.error("Erro ao buscar agendamentos:", error); setIsLoading(false); });
    return () => unsubscribe();
  }, [user]);

  const handleCancelBooking = async (bookingId, bookingStatus) => {
    if (bookingStatus === 'cancelado') { Alert.alert("Aviso", "Este agendamento já está cancelado."); return; }
    Alert.alert(
      "Confirmar Cancelamento",
      "Você tem certeza que deseja cancelar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim, cancelar", 
          style: "destructive",
          onPress: async () => {
            if (!db || !bookingId) return;
            try {
              const bookingDocRef = doc(db, "agendamentos", bookingId);
              await updateDoc(bookingDocRef, {
                status: "cancelado" // Atualiza o status
              });
              Alert.alert("Sucesso", "Agendamento cancelado.");
            } catch (error) { console.error("Erro ao cancelar:", error); Alert.alert("Erro", "Não foi possível cancelar."); }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.greeting}>Meus Agendamentos</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#E6AAB7" style={{marginTop: 50}} />
      ) : agendamentos.length === 0 ? (
        <View style={styles.profileCard}><Text style={styles.subtitle}>Você ainda não possui agendamentos.</Text></View>
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.profileCard, {alignItems: 'flex-start', marginBottom: 15}]}>
              <Text style={[styles.sectionTitle, {marginTop: 0, color: item.status === 'cancelado' ? '#AAA' : '#333'}]}>{item.service}</Text>
              <Text style={styles.summaryText}>Profissional: {item.professional}</Text>
              <Text style={styles.summaryText}>Data: {item.date.split('-').reverse().join('/')} às {item.time}</Text>
              <Text style={[styles.summaryText, {fontWeight: 'bold', textTransform: 'capitalize', color: item.status === 'cancelado' ? '#ef4444' : '#22c55e'}]}>
                Status: {item.status}
              </Text>
              {item.status !== 'cancelado' && (
                <TouchableOpacity 
                  style={[styles.secondaryButton, {width: '100%', marginTop: 15, borderColor: '#ef4444'}]} 
                  onPress={() => handleCancelBooking(item.id, item.status)}
                >
                  <Text style={[styles.secondaryButtonText, {color: '#ef4444'}]}>Cancelar Agendamento</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </ScrollView>
  );
};

const PerfilScreen = ({ onLogout }) => {
  const { user, isGuest, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false); const [isEditing, setIsEditing] = useState(false); const [editName, setEditName] = useState(profile?.fullName || ''); const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const { refreshProfile } = useContext(AuthContext);

  useEffect(() => { setEditName(profile?.fullName || ''); setEditPhone(profile?.phone || ''); }, [profile]);
  
  const handleSaveChanges = async () => {
    if (!user || !user.uid || !db) return;
    if (editName.trim() === '' || editPhone.trim() === '') { Alert.alert("Erro", "Preencha Nome e Celular."); return; }
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { fullName: editName.trim(), phone: editPhone.trim(), });
      await refreshProfile(user.uid);
      setIsEditing(false);
      Alert.alert("Sucesso", "Perfil atualizado!");
    } catch (error) { console.error("Erro atualizar perfil:", error); Alert.alert("Erro", "Não foi possível salvar."); } 
    finally { setIsLoading(false); }
  };
  
  const photoSource = require('./assets/avatar-placeholder.png'); 

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.greeting}>Meu Perfil</Text>
      {isGuest || !user ? (
          <View style={styles.profileCard}><Text style={styles.profileName}>Visitante</Text><TouchableOpacity style={[styles.primaryButton, {marginTop: 20}]} onPress={onLogout}><Text style={styles.primaryButtonText}>Login/Cadastro</Text></TouchableOpacity></View>
      ) : (
        <View style={styles.profileCard}>
            <Image source={photoSource} style={styles.profilePhoto} />
            {isEditing ? (
              <>
                <View style={styles.inputContainerInline}><PersonIcon /><TextInput style={styles.inputInline} value={editName} onChangeText={setEditName} placeholder="Nome Completo" autoCapitalize="words" placeholderTextColor="#AAA"/></View>
                <View style={styles.inputContainerInline}><PhoneIcon /><TextInput style={styles.inputInline} value={editPhone} onChangeText={setEditPhone} placeholder="Celular (com DDD)" keyboardType="phone-pad" placeholderTextColor="#AAA"/></View>
                <TouchableOpacity style={[styles.primaryButton, {marginTop: 20}]} onPress={handleSaveChanges} disabled={isLoading}>{isLoading? <ActivityIndicator color="#FFF"/> : <Text style={styles.primaryButtonText}>Salvar Alterações</Text>}</TouchableOpacity>
                <TouchableOpacity style={styles.ghostButton} onPress={() => { setIsEditing(false); setEditName(profile?.fullName || ''); setEditPhone(profile?.phone || ''); }}><Text style={styles.ghostButtonText}>Cancelar</Text></TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.profileName}>{profile?.fullName || user.email.split('@')[0]}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                <Text style={styles.profilePhone}>{profile?.phone || '(Celular não informado)'}</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}><Text style={styles.editButtonText}>Editar Perfil</Text></TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}><LogoutIcon /><Text style={styles.logoutButtonText}>Sair da Conta</Text></TouchableOpacity>
        </View>
      )}
       <View style={{ height: 100 }} />
    </ScrollView>
  );
};
const ClientTabBar = ({ activeTab, onTabPress }) => ( 
  <View style={styles.tabBar}>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('inicio')}><HomeIcon color={activeTab === 'inicio' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'inicio' ? '#A78B4F' : '#C0B49D' }]}>Início</Text></TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('agendamentos')}><CalendarIcon color={activeTab === 'agendamentos' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'agendamentos' ? '#A78B4F' : '#C0B49D' }]}>Agendar</Text></TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('meusAgendamentos')}><ListIcon color={activeTab === 'meusAgendamentos' ? "#A78B4F" : "#C0B4AN9D"} /><Text style={[styles.tabLabel, { color: activeTab === 'meusAgendamentos' ? '#A78B4F' : '#C0B49D' }]}>Meus Horários</Text></TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('perfil')}><UserIcon color={activeTab === 'perfil' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'perfil' ? '#A78B4F' : '#C0B49D' }]}>Perfil</Text></TouchableOpacity>
  </View> 
);
const ClientMainApp = ({ onNavigate, route, onLogout }) => {
  const initialTab = route?.params?.activeTab || 'inicio'; const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => { if (route?.params?.activeTab) { setActiveTab(route.params.activeTab); } }, [route]);
  const renderContent = () => {
    switch (activeTab) {
      case 'agendamentos': return <AgendamentosScreen onNavigate={onNavigate} />;
      case 'meusAgendamentos': return <MeusAgendamentosScreen onNavigate={onNavigate} />;
      case 'perfil': return <PerfilScreen onLogout={onLogout} />;
      case 'inicio': default: return <HomeScreen onNavigateToAgendamentos={() => setActiveTab('agendamentos')} />;
    }
  };
  return ( <View style={{ flex: 1, backgroundColor: '#FDF5F7' }}>{renderContent()}<ClientTabBar activeTab={activeTab} onTabPress={setActiveTab} /></View> );
};

// --- FLUXO DO PROFISSIONAL ---
const ProfessionalAgendaScreen = ({ onNavigate }) => {
  const { user, profile } = useAuth(); const [agendamentos, setAgendamentos] = useState([]); const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!db || !user || !user.uid) { setIsLoading(false); return; }
    // Query: busca agendamentos onde 'professionalId' == UID do profissional
    // NOTA: Você PRECISA salvar os UIDs reais dos profissionais no 'SERVICES_DATA'
    const q = query(
      collection(db, "agendamentos"), 
      // where("professionalId", "==", user.uid), // HABILITE ISSO QUANDO OS IDs ESTIVEREM CORRETOS
      where("professional", "==", profile.fullName), // Solução temporária: filtra pelo NOME
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookings = [];
      querySnapshot.forEach((doc) => { bookings.push(doc.data()); });
      setAgendamentos(bookings);
      setIsLoading(false);
    }, (error) => { console.error("Erro ao buscar agenda profissional:", error); setIsLoading(false); });
    return () => unsubscribe();
  }, [user, profile]);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.greeting}>Minha Agenda</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#E6AAB7" style={{marginTop: 50}} />
      ) : agendamentos.length === 0 ? (
        <View style={styles.profileCard}><Text style={styles.subtitle}>Você ainda não possui agendamentos.</Text></View>
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.profileCard, {alignItems: 'flex-start', marginBottom: 15}]}>
              <Text style={[styles.sectionTitle, {marginTop: 0, color: item.status === 'cancelado' ? '#AAA' : '#333'}]}>{item.service}</Text>
              <Text style={styles.summaryText}>Cliente: {item.clientName}</Text>
              <Text style={styles.summaryText}>Data: {item.date.split('-').reverse().join('/')} às {item.time}</Text>
              <Text style={[styles.summaryText, {fontWeight: 'bold', textTransform: 'capitalize', color: item.status === 'cancelado' ? '#ef4444' : '#22c55e'}]}>
                Status: {item.status}
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </ScrollView>
  );
};
const ProfessionalPerfilScreen = ({ onLogout }) => { /* Tela de Perfil Pro, simplificada */
  const { user, profile } = useAuth();
  return (
    <ScrollView style={styles.page}>
      <Text style={styles.greeting}>Perfil Profissional</Text>
      <View style={styles.profileCard}>
        <Image source={require('./assets/avatar-placeholder.png')} style={styles.profilePhoto} />
        <Text style={styles.profileName}>{profile?.fullName || user.email.split('@')[0]}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
        <Text style={styles.profilePhone}>{profile?.phone || '(Celular não informado)'}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}><LogoutIcon /><Text style={styles.logoutButtonText}>Sair da Conta</Text></TouchableOpacity>
      </View>
       <View style={{ height: 100 }} />
    </ScrollView>
  );
};
const ProfessionalTabBar = ({ activeTab, onTabPress }) => ( 
  <View style={styles.tabBar}>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('agenda')}>
      <CalendarIcon color={activeTab === 'agenda' ? "#A78B4F" : "#C0B49D"} />
      <Text style={[styles.tabLabel, { color: activeTab === 'agenda' ? '#A78B4F' : '#C0B49D' }]}>Agenda</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('perfil')}>
      <UserIcon color={activeTab === 'perfil' ? "#A78B4F" : "#C0B49D"} />
      <Text style={[styles.tabLabel, { color: activeTab === 'perfil' ? '#A78B4F' : '#C0B49D' }]}>Perfil</Text>
    </TouchableOpacity>
  </View> 
);
const ProfessionalMainApp = ({ onNavigate, route, onLogout }) => {
  const [activeTab, setActiveTab] = useState('agenda');
  const renderContent = () => {
    switch (activeTab) {
      case 'perfil': return <ProfessionalPerfilScreen onLogout={onLogout} />;
      case 'agenda': default: return <ProfessionalAgendaScreen onNavigate={onNavigate} />;
    }
  };
  return ( <View style={{ flex: 1, backgroundColor: '#FDF5F7' }}>{renderContent()}<ProfessionalTabBar activeTab={activeTab} onTabPress={setActiveTab} /></View> );
};


// --- O Roteador Principal ---
export default function App() {
 console.log("App.js: Componente App montado.");
 const [screen, setScreen] = useState('loading'); const [routeParams, setRouteParams] = useState({}); const [user, setUser] = useState(null); const [profile, setProfile] = useState(null); const [isGuest, setIsGuest] = useState(false); const [isLoadingAuth, setIsLoadingAuth] = useState(true);

 const refreshProfile = async (uid) => {
   if (!db || !uid) { console.log("RefreshProfile: DB ou UID faltando."); setProfile(null); return { hasProfile: false, role: null }; }
   console.log("RefreshProfile: Tentando buscar perfil para UID:", uid);
   try {
     const userDocRef = doc(db, "users", uid);
     const docSnap = await getDoc(userDocRef);
     if (docSnap.exists()) {
       const data = docSnap.data();
       console.log("RefreshProfile: Perfil encontrado:", data);
       setProfile(data);
       return { hasProfile: (!!data.fullName), role: data.role || 'client' }; // Retorna se tem perfil E a função
     } else {
       console.log("RefreshProfile: Nenhum perfil encontrado no Firestore para UID:", uid);
       setProfile(null);
       return { hasProfile: false, role: null };
     }
   } catch (error) {
     console.error("RefreshProfile: Erro ao buscar Firestore:", error);
     setProfile(null);
     return { hasProfile: false, role: null };
   }
 };

 useEffect(() => {
   console.log("App.js: useEffect principal iniciado.");
   if (firebaseInitializationError || !auth || !db) {
     console.warn("App: Auth ou DB não inicializado no useEffect! Firebase Config está correta?");
     if(firebaseInitializationError) { console.error("Erro de Inicialização:", firebaseInitializationError.message); }
     setIsLoadingAuth(false); setScreen('error'); return;
   }
   
   console.log("App: Configurando onAuthStateChanged listener...");
   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
     console.log("App: onAuthStateChanged disparado. User ID:", currentUser ? currentUser.uid : 'Nenhum');
     setIsLoadingAuth(true);
     if (currentUser) { // Usuário está logado
       setIsGuest(false);
       try {
         const userToSave = { uid: currentUser.uid, email: currentUser.email };
         setUser(userToSave);
         console.log("App: Usuário definido no estado:", userToSave.uid);
         
         const { hasProfile, role } = await refreshProfile(currentUser.uid);
         
         if (role === 'professional') {
            console.log("App: Usuário é PROFISSIONAL. Navegando para mainApp_pro");
            setScreen('mainApp_pro');
         } else if (hasProfile && role === 'client') {
           console.log("App: Usuário é CLIENTE com perfil completo. Navegando para mainApp_client");
           setScreen('mainApp_client');
         } else {
           console.log("App: Perfil incompleto ou sem função. Navegando para completeProfile");
           setScreen('completeProfile');
         }
       } catch (error) { console.error("App: Erro crítico dentro do onAuthStateChanged:", error); setUser(null); setProfile(null); setScreen('welcome'); }
     } else { // Usuário está deslogado
       console.log("App: Nenhum usuário logado detectado.");
       setUser(null); setProfile(null);
       if (!isGuest) { console.log("App: Não é visitante, navegando para welcome"); setScreen('welcome'); }
       else { console.log("App: É visitante, navegando para mainApp_client"); setScreen('mainApp_client'); }
     }
     setIsLoadingAuth(false);
     console.log("App: Fim do onAuthStateChanged.");
   });
   return () => { console.log("App: Limpando onAuthStateChanged listener."); unsubscribe(); };
 }, [isGuest]);

 const handleNavigate = (newScreen, params = {}) => {
    console.log(`App: handleNavigate para: ${newScreen}, Guest: ${params.isGuest}`);
    if (params.isGuest) {
        if (auth && auth.currentUser) { console.log("App: Usuário estava logado, fazendo signOut antes de virar guest."); signOut(auth); }
        setIsGuest(true); setUser(null); setProfile(null); setScreen('mainApp_client'); // Visitante sempre vai para app de cliente
    } else {
      if (['welcome', 'login', 'register', 'proLogin', 'proRegister'].includes(newScreen) && isGuest) { console.log("App: Saindo do modo Guest."); setIsGuest(false); }
      setRouteParams({ params }); setScreen(newScreen);
    }
 };
 const handleLogout = async () => { console.log("App: handleLogout iniciado..."); if (!auth) return; try { await signOut(auth); setIsGuest(false); } catch (error) { console.error("App: Erro no handleLogout:", error); } };

 const renderScreen = () => {
   console.log(`App: renderScreen chamado. isLoadingAuth: ${isLoadingAuth}, screen: ${screen}`);

   if (isLoadingAuth || screen === 'loading') {
     console.log("App: Renderizando Loading Screen");
     return <View style={styles.container}><ActivityIndicator size="large" color="#E6AAB7" /></View>;
   }
   
   if (firebaseInitializationError || screen === 'error' || (!auth || !db)) {
       console.error("App: Renderizando Erro de Inicialização Firebase");
       return ( <SafeAreaView style={styles.safeArea}><View style={styles.container}><Text style={{color: 'red', textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Erro Crítico</Text><Text style={{color: 'red', textAlign: 'center', marginBottom: 10}}>Falha ao inicializar o Firebase.</Text><Text style={{color: 'red', textAlign: 'center', marginBottom: 40}}>Verifique se a `firebaseConfig` no App.js está correta e se sua rede está funcionando.</Text><Text style={{color: '#555', textAlign: 'center', fontSize: 12}}>Detalhes: {firebaseInitializationError?.message || 'auth/db nulos'}</Text></View></SafeAreaView> );
   }


   const props = { onNavigate: handleNavigate, route: routeParams };
   const authContextValue = { user, profile, isGuest, refreshProfile, userRole: profile?.role || (isGuest ? 'guest' : 'client') };
   console.log(`App: Renderizando tela: ${screen}`);

   return (
     <SafeAreaView style={styles.safeArea}>
       <AuthContext.Provider value={authContextValue}>
         {/* Fluxo Cliente */}
         {screen === 'mainApp_client' && <ClientMainApp {...props} onLogout={handleLogout} />}
         {screen === 'login' && <LoginScreen {...props} />}
         {screen === 'register' && <RegisterScreen {...props} />}
         {screen === 'completeProfile' && <CompleteProfileScreen {...props} />}
         {screen === 'payment' && <PaymentScreen {...props} />}

         {/* Fluxo Profissional */}
         {screen === 'mainApp_pro' && <ProfessionalMainApp {...props} onLogout={handleLogout} />}
         {screen === 'proLogin' && <ProfessionalLoginScreen {...props} />}
         {screen === 'proRegister' && <ProfessionalRegisterScreen {...props} />}
         
         {/* Telas Comuns */}
         {screen === 'welcome' && <WelcomeScreen {...props} />}
         
         {!['mainApp_client', 'login', 'register', 'completeProfile', 'payment', 'mainApp_pro', 'proLogin', 'proRegister', 'welcome', 'loading', 'error'].includes(screen) &&
             <View style={styles.container}><Text>Tela desconhecida: {screen}</Text></View>
         }
       </AuthContext.Provider>
     </SafeAreaView>
   );
 };
 return renderScreen();
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDF5F7' },
  page: { backgroundColor: '#FDF5F7', paddingHorizontal: 20, paddingTop: 40, minHeight: '100%' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#FDF5F7' },
  title: { fontFamily: "serif", fontSize: 42, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#8A74A8', textAlign: 'center', marginBottom: 40 },
  buttonContainer: { marginTop: 30, width: '100%', },
  primaryButton: { width: '100%', paddingVertical: 15, backgroundColor: '#E6AAB7', borderRadius: 25, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  primaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', },
  secondaryButton: { width: '100%', paddingVertical: 13, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 25, alignItems: 'center', marginBottom: 15 },
  secondaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37', },
  // Botão Profissional
  proButton: { width: '100%', paddingVertical: 15, backgroundColor: '#8A74A8', borderRadius: 25, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  proButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', },
  ghostButton: { width: '100%', paddingVertical: 13, alignItems: 'center', marginTop: 5 },
  ghostButtonText: { fontSize: 16, color: '#8A74A8', },
  welcomeBack: { fontSize: 24, fontWeight: 'bold', color: '#8A74A8', marginBottom: 30, alignSelf: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 15, marginBottom: 15, paddingHorizontal: 15, },
  input: { flex: 1, height: 50, fontSize: 16, color: '#333', marginLeft: 10, },
  // Home
  greeting: { fontSize: 32, fontWeight: 'bold', color: '#8A74A8', alignSelf: 'flex-start', marginBottom: 25, },
  promoCard: { width: '100%', height: 200, borderRadius: 20, justifyContent: 'flex-end', alignItems: 'flex-start', backgroundColor: '#DDD', overflow: 'hidden', marginBottom: 20 },
  promoImage: { width: '100%', height: '100%', position: 'absolute' },
  promoOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20, paddingVertical: 15, width: '100%', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  promoTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', },
  promoSubtitle: { fontSize: 15, color: '#FFF', marginTop: 4, },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 30, marginBottom: 15, },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', },
  serviceCardSmall: { backgroundColor: '#FFF', paddingVertical: 25, borderRadius: 15, alignItems: 'center', width: '31%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  serviceCardSmallText: { fontWeight: 'bold', color: '#8A74A8' },
  // TabBar
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 100 : 90, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', },
  tabItem: { alignItems: 'center', flex: 1, },
  tabLabel: { fontSize: 12, color: '#C0B49D', marginTop: 4, },
  // Perfil (Sem Foto)
  profileCard: { width: '100%', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 30, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, },
  profilePhoto: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, backgroundColor: '#EEE' },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  profileEmail: { fontSize: 16, color: '#777', marginTop: 4, textAlign: 'center' },
  profilePhone: { fontSize: 16, color: '#555', marginTop: 10, fontWeight: '500', textAlign: 'center' },
  editButton: { marginTop: 20, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E6AAB7' },
  editButtonText: { color: '#E6AAB7', fontWeight: 'bold' },
  inputContainerInline: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', borderRadius: 10, marginBottom: 10, paddingHorizontal: 10, },
  inputInline: { flex: 1, height: 45, fontSize: 16, color: '#333', marginLeft: 10, },
  logoutButton: { flexDirection: 'row', alignItems: 'center', marginTop: 30, backgroundColor: '#fecaca', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, },
  logoutButtonText: { color: '#ef4444', fontWeight: 'bold', marginLeft: 8, fontSize: 16, },
  // Agendamento
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#8A74A8', fontSize: 16, marginLeft: 5, fontWeight: 'bold' },
  serviceCard: { width: '100%', height: 160, borderRadius: 20, marginBottom: 20, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#DDD' },
  serviceImage: { width: '100%', height: '100%', position: 'absolute' },
  serviceTitleOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20, paddingVertical: 15, width: '100%' }, 
  serviceTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', },
  proCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 10 },
  proPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#EEE' },
  proName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subServiceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  subServiceTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1, marginRight: 10 },
  subServiceButton: { fontSize: 14, fontWeight: 'bold', color: '#E6AAB7' },
  // CALENDÁRIO CORRIGIDO
  calendarGrid: { backgroundColor: '#FFF', borderRadius: 15, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
  dateCell: { alignItems: 'center', paddingVertical: 10, borderRadius: 10, width: 45, height: 60, justifyContent: 'center' },
  dateCellSelected: { backgroundColor: '#E6AAB7' },
  dateDay: { fontSize: 12, color: '#8A74A8', fontWeight: 'bold' },
  dateDaySelected: { color: '#FFF' },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
  dateTextSelected: { color: '#FFF' },
  // FIM DO CALENDÁRIO
  timeSlotContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10, },
  timeSlot: { width: '31%', paddingVertical: 15, backgroundColor: '#FFF', borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  timeSlotText: { color: '#333', fontWeight: 'bold' },
  timeSlotBooked: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  timeSlotTextBooked: { color: '#AAA', textDecorationLine: 'line-through' },
  timeSlotSelected: { backgroundColor: '#E6AAB7', borderColor: '#E6AAB7' },
  timeSlotTextSelected: { color: '#FFF', fontWeight: 'bold' },
  // TELA DE PAGAMENTO
  summaryText: { fontSize: 16, color: '#333', marginBottom: 10, lineHeight: 22 },
  termsText: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 20, },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#E6AAB7', backgroundColor: '#FFF', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#E6AAB7' },
  checkboxLabel: { fontSize: 16, color: '#333', flex: 1 },
});