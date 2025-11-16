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
  collection, query, where, onSnapshot, orderBy,
  increment
} from 'firebase/firestore';

console.log("App.js: Versão Profissional v8 (Correção typo '===a===') iniciada.");

// --- Ícones ---
const HomeIcon = ({ color }) => <Text style={{ color, fontSize: 24, fontFamily: 'serif' }}>🏠</Text>;
const CalendarIcon = ({ color }) => <Text style={{ color, fontSize: 24, fontFamily: 'serif' }}>🗓️</Text>;
const ListIcon = ({ color }) => <Text style={{ color, fontSize: 24, fontFamily: 'serif' }}>🧾</Text>;
const UserIcon = ({ color }) => <Text style={{ color, fontSize: 24, fontFamily: 'serif' }}>👤</Text>;
const SaldoIcon = ({ color }) => <Text style={{ color, fontSize: 24, fontFamily: 'serif' }}>💰</Text>;
const SaqueIcon = ({ color }) => <Text style={{ color, fontSize: 24, fontFamily: 'serif' }}>🏧</Text>;
const ConfigIcon = ({ color }) => <Text style={{ color, fontSize: 24, fontFamily: 'serif' }}>⚙️</Text>;
const LogoutIcon = () => <Text style={{fontSize: 20, color: '#ef4444'}}>🚪</Text>;
const MailIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>✉️</Text>;
const LockIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>🔒</Text>;
const PhoneIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>📱</Text>;
const PersonIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>🧑</Text>;
const BackArrowIcon = () => <Text style={{ fontSize: 24, color: '#8A74A8' }}>‹</Text>;
const EyeIcon = ({ closed }) => <Text style={{fontSize: 20, color: '#8A74A8'}}>{closed ? '👁️‍🗨️' : '👁️'}</Text>;
const CheckIcon = () => <Text style={{fontSize: 18, color: '#FFF'}}>✓</Text>;
const MoneyIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>💳</Text>;
const ProIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>💼</Text>;

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

// --- Contexto ---
const AuthContext = createContext({ user: null, profile: null, userRole: 'loading', isLoadingAuth: true, refreshProfile: async () => ({ hasProfile: false, role: null }) });
const useAuth = () => useContext(AuthContext);

// --- Telas de Autenticação (CLIENTE E PROFISSIONAL) ---
const WelcomeScreen = ({ onNavigate }) => ( <View style={styles.container}><Text style={styles.title}>TP Estética</Text><Text style={styles.subtitle}>Sua beleza, na palma da sua mão.</Text><View style={styles.buttonContainer}><Text style={styles.sectionTitle}>Para Clientes</Text><TouchableOpacity style={styles.primaryButton} onPress={() => onNavigate('login')}><Text style={styles.primaryButtonText}>Entrar</Text></TouchableOpacity><TouchableOpacity style={styles.secondaryButton} onPress={() => onNavigate('register')}><Text style={styles.secondaryButtonText}>Criar Conta</Text></TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('mainApp_client', { isGuest: true })}><Text style={styles.ghostButtonText}>Continuar como Visitante</Text></TouchableOpacity><View style={{height: 30}} /><Text style={styles.sectionTitle}>Para Profissionais</Text><TouchableOpacity style={styles.proButton} onPress={() => onNavigate('proLogin')}><Text style={styles.proButtonText}>Login Profissional</Text></TouchableOpacity></View></View> );
const LoginScreen = ({ onNavigate }) => { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false); const handleLogin = async () => { if (!auth) return; if (email === '' || password === '') { Alert.alert("Erro", "Preencha e-mail e senha."); return; } setIsLoading(true); try { await signInWithEmailAndPassword(auth, email.trim(), password); } catch (error) { setIsLoading(false); Alert.alert("Erro de Login", "E-mail ou senha incorretos."); }}; return ( <View style={styles.container}><Text style={styles.welcomeBack}>Login (Cliente)</Text><View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Digite sua senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity></View><TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('welcome')}><Text style={styles.ghostButtonText}>‹ Voltar</Text></TouchableOpacity></View> ); };
const RegisterScreen = ({ onNavigate }) => { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false); const [showConfirmPassword, setShowConfirmPassword] = useState(false); const handleRegister = async () => { if (!auth) return; if (password !== confirmPassword) { Alert.alert("Erro", "As senhas não são iguais."); return; } if (password.length < 6) { Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres."); return; } setIsLoading(true); try { await createUserWithEmailAndPassword(auth, email.trim(), password); } catch (error) { setIsLoading(false); if (error.code === 'auth/email-already-in-use') { Alert.alert("Erro", "Este e-mail já está cadastrado."); } else { Alert.alert("Erro de Cadastro", "Não foi possível criar a conta."); } }}; return ( <View style={styles.container}><Text style={styles.welcomeBack}>Criar Conta (Cliente)</Text><View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Crie uma senha (mín. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Confirme sua senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><EyeIcon closed={!showConfirmPassword} /></TouchableOpacity></View><TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Criar Conta</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('welcome')}><Text style={styles.ghostButtonText}>‹ Voltar</Text></TouchableOpacity></View> ); };
const CompleteProfileScreen = ({ onNavigate }) => { const [fullName, setFullName] = useState(''); const [phone, setPhone] = useState(''); const [isLoading, setIsLoading] = useState(false); const { user, refreshProfile } = useAuth(); const handleSaveProfile = async () => { if (!user || !user.uid || !db) { Alert.alert("Erro", "Usuário ou conexão ausente."); return; } if (fullName.trim() === '' || phone.trim() === '') { Alert.alert("Erro", "Preencha Nome Completo e Celular."); return; } setIsLoading(true); try { const userDocRef = doc(db, "users", user.uid); await setDoc(userDocRef, { fullName: fullName.trim(), phone: phone.trim(), email: user.email, photoURL: null, role: 'client', fictionalBalance: 500.00 }, { merge: true }); await refreshProfile(user.uid); onNavigate('mainApp_client'); } catch (error) { setIsLoading(false); console.error("Erro ao salvar perfil:", error); Alert.alert("Erro", "Não foi possível salvar seu perfil."); }}; return ( <View style={styles.container}><Text style={styles.title}>Quase lá!</Text><Text style={styles.subtitle}>Complete seu perfil de cliente.</Text><View style={styles.inputContainer}><PersonIcon /><TextInput style={styles.input} placeholder="Digite seu nome completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><PhoneIcon /><TextInput style={styles.input} placeholder="Digite seu Celular (com DDD)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#AAA" /></View><TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Salvar e Entrar</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => { if(auth) signOut(auth); }}><Text style={styles.ghostButtonText}>Cancelar e Sair</Text></TouchableOpacity></View> ); };
const ProfessionalLoginScreen = ({ onNavigate }) => { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false); const handleLogin = async () => { if (!auth || !db) { Alert.alert("Erro", "Firebase não inicializado."); return; } if (email === '' || password === '') { Alert.alert("Erro", "Preencha e-mail e senha."); return; } setIsLoading(true); try { const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password); const user = userCredential.user; const userDocRef = doc(db, "users", user.uid); const docSnap = await getDoc(userDocRef); if (docSnap.exists() && docSnap.data().role === 'professional') { /* Sucesso! onAuthStateChanged vai navegar */ } else { await signOut(auth); Alert.alert("Acesso Negado", "Esta conta não é uma conta de profissional."); } } catch (error) { console.error("Erro Login Pro:", error); Alert.alert("Erro de Login", "E-mail ou senha de profissional incorretos."); } finally { setIsLoading(false); } }; return ( <View style={styles.container}><Text style={styles.welcomeBack}>Login Profissional</Text><View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Digite sua senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity></View><TouchableOpacity style={styles.proButton} onPress={handleLogin} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.proButtonText}>Entrar</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('proRegister')}><Text style={styles.ghostButtonText}>Criar Conta Profissional</Text></TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('welcome')}><Text style={styles.ghostButtonText}>‹ Voltar</Text></TouchableOpacity></View> ); };
const ProfessionalRegisterScreen = ({ onNavigate }) => { const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [secretCode, setSecretCode] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false); const PROFESSIONAL_SECRET_CODE = "3429"; const handleRegister = async () => { if (!auth || !db) return; if (secretCode.trim() !== PROFESSIONAL_SECRET_CODE) { Alert.alert("Erro", "Código de cadastro secreto incorreto."); return; } if (password.length < 6) { Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres."); return; } if (fullName.trim() === '' || email.trim() === '') { Alert.alert("Erro", "Preencha Nome e E-mail."); return; } setIsLoading(true); try { const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password); const user = userCredential.user; const userDocRef = doc(db, "users", user.uid); await setDoc(userDocRef, { fullName: fullName.trim(), email: user.email, phone: '', role: 'professional', fictionalBalance: 0, }); } catch (error) { setIsLoading(false); if (error.code === 'auth/email-already-in-use') { Alert.alert("Erro", "Este e-mail já está cadastrado."); } else { Alert.alert("Erro", "Não foi possível criar a conta."); } }}; return ( <View style={styles.container}><Text style={styles.welcomeBack}>Cadastro Profissional</Text><View style={styles.inputContainer}><PersonIcon /><TextInput style={styles.input} placeholder="Seu Nome Completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Seu E-mail de login" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View><View style={styles.inputContainer}><LockIcon /><TextInput style={styles.input} placeholder="Crie uma senha (mín. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity></View><View style={styles.inputContainer}><ProIcon /><TextInput style={styles.input} placeholder="Código Secreto de Cadastro" value={secretCode} onChangeText={setSecretCode} secureTextEntry={true} placeholderTextColor="#AAA" /></View><TouchableOpacity style={styles.proButton} onPress={handleRegister} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.proButtonText}>Criar Conta Profissional</Text>}</TouchableOpacity><TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('proLogin')}><Text style={styles.ghostButtonText}>‹ Voltar para Login</Text></TouchableOpacity></View> ); };

// --- FLUXO DO CLIENTE ---
const HomeScreen = ({ onNavigateToAgendamentos }) => { const { user, isGuest, profile } = useAuth(); const displayName = isGuest ? 'Visitante' : (profile?.fullName || user?.email?.split('@')[0] || 'Cliente'); return ( <ScrollView style={styles.page}><Text style={styles.greeting}>Olá, {displayName}!</Text><View style={styles.promoCard}><Image source={{ uri: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop" }} style={styles.promoImage} resizeMode="cover" /><View style={styles
.promoOverlay}><Text style={styles.promoTitle}>Promoção!</Text><Text style={styles.promoSubtitle}>Limpeza de Pele 20% OFF</Text></View></View><TouchableOpacity style={[styles.primaryButton, {marginTop: 30}]} onPress={onNavigateToAgendamentos}><Text style={styles.primaryButtonText}>Agendar Serviço</Text></TouchableOpacity><Text style={styles.sectionTitle}>Serviços Populares</Text><View style={styles.serviceRow}><TouchableOpacity style={styles.serviceCardSmall} onPress={onNavigateToAgendamentos}><Text style={styles.serviceCardSmallText}>Botox</Text></TouchableOpacity><TouchableOpacity style={styles.serviceCardSmall} onPress={onNavigateToAgendamentos}><Text style={styles.serviceCardSmallText}>Manicure</Text></TouchableOpacity><TouchableOpacity style={styles.serviceCardSmall} onPress={onNavigateToAgendamentos}><Text style={styles.serviceCardSmallText}>Pedicure</Text></TouchableOpacity></View><View style={{ height: 100 }} /></ScrollView> ); };

// Simulação de horários agendados
const BOOKED_TIMES = { '2025-11-04': ['10:00', '14:00'], '2025-11-05': ['11:00', '15:00'], };

// Componente do Grid do Calendário
const CalendarGrid = ({ selectedDate, onDateSelect }) => {
  const days = [];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  let startDate = new Date(); 
  for (let i = 0; i < 21; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    const dayOfMonth = date.getDate();
    const dayOfWeek = dayNames[date.getDay()];
    days.push({ dateString, dayOfMonth, dayOfWeek, id: i });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
  }
  return (
      <View style={styles.calendarGrid}>
          {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarRow}>
                  {week.map((day) => {
                      const isSelected = selectedDate === day.dateString;
                      return (
                          <TouchableOpacity
                              key={day.id}
                              style={[styles.dateCell, isSelected && styles.dateCellSelected]}
                              onPress={() => onDateSelect(day.dateString)}
                          >
                              <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>{day.dayOfWeek}</Text>
                              <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{day.dayOfMonth}</Text>
                          </TouchableOpacity>
                      );
                  })}
              </View>
          ))}
      </View>
  );
};

const generateTimeSlots = (selectedDateISO) => { const slots = []; const bookedSlots = BOOKED_TIMES[selectedDateISO] || []; for (let hour = 7; hour <= 17; hour++) { const displayHour = hour.toString().padStart(2, '0'); const displayTime = `${displayHour}:00`; const isBooked = bookedSlots.includes(displayTime); slots.push({ time: displayTime, iso: `${selectedDateISO}T${displayHour}:00:00`, isBooked: isBooked }); } return slots; };

const AgendamentosScreen = ({ onNavigate }) => {
  const { user, isGuest } = useAuth(); const [step, setStep] = useState(1); const [selectedService, setSelectedService] = useState(null); const [selectedSubService, setSelectedSubService] = useState(null); const [selectedDate, setSelectedDate] = useState(null); const [selectedTime, setSelectedTime] = useState(null); const [timeSlots, setTimeSlots] = useState([]);
  const [servicesData, setServicesData] = useState([]); const [isLoadingServices, setIsLoadingServices] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "services"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const services = [];
      querySnapshot.forEach((doc) => { services.push({ id: doc.id, ...doc.data() }); });
      setServicesData(services);
      setIsLoadingServices(false);
    }, (error) => { console.error("Erro ao buscar serviços:", error); Alert.alert("Erro", "Não foi possível carregar os serviços."); setIsLoadingServices(false); });
    return () => unsubscribe();
  }, []);

  const goToPayment = () => { if (!selectedService || !selectedDate || !selectedTime) return; const isSub = !!selectedSubService; const price = isSub ? selectedSubService.price : selectedService.price; const bookingDetails = { serviceTitle: isSub ? selectedSubService.title : selectedService.title, professional: selectedService.professionalName, professionalId: selectedService.professionalId, date: selectedDate, time: selectedTime.time, price: price }; onNavigate('payment', { booking: bookingDetails }); };
  const checkLoginAndProceed = (nextStep) => { if (isGuest || !user) { Alert.alert("Login Necessário", "Crie uma conta ou faça login para agendar.", [{ text: "Cancelar" }, { text: "Login/Cadastro", onPress: () => onNavigate('welcome') }] ); } else { setStep(nextStep); } };
  
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedSubService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    checkLoginAndProceed(1.5);
  };
  
  const handleSubServiceSelect = (subService) => { setSelectedSubService(subService); checkLoginAndProceed(2); };
  const handleDateSelect = (dateString) => { setSelectedDate(dateString); setSelectedTime(null); setTimeSlots(generateTimeSlots(dateString)); };
  const handleConfirmarHorario = () => { goToPayment(); };
  const resetFlow = () => { setStep(1); setSelectedService(null); setSelectedSubService(null); setSelectedDate(null); setSelectedTime(null); };

  if (step === 1) { return ( <ScrollView style={styles.page}><Text style={styles.greeting}>Agendar Serviço</Text><Text style={styles.sectionTitle}>Escolha uma Categoria</Text>{isLoadingServices ? <ActivityIndicator color="#E6AAB7" /> : servicesData.map(service => ( <TouchableOpacity key={service.id} style={styles.promoCard} onPress={() => handleServiceSelect(service)}><Image source={{ uri: service.image }} style={styles.promoImage} resizeMode="cover"/><View style={styles.promoOverlay}><Text style={styles.promoTitle}>{service.title}</Text></View></TouchableOpacity> ))}<View style={{ height: 100 }} /></ScrollView> ); }
  
  else if (step === 1.5) {
    // CORREÇÃO: Usa "subservices" (minúsculo) para bater com o Firebase
    const hasSubServices = selectedService.subservices && selectedService.subservices.length > 0;
    
    return (
      <ScrollView style={styles.page}>
        <TouchableOpacity style={styles.backButton} onPress={resetFlow}><BackArrowIcon /><Text style={styles.backButtonText}>Categorias</Text></TouchableOpacity>
        <Text style={styles.greeting}>{selectedService.title}</Text>
        
        <Text style={styles.sectionTitle}>Profissional</Text>
        <View style={styles.proCard}>
          <Image source={{ uri: selectedService.professionalPhoto || 'https://placehold.co/100x100/D4AF37/FFF?text=TD' }} style={styles.proPhoto} />
          <Text style={styles.proName}>{selectedService.professionalName || 'Nome Indisponível'}</Text>
        </View>
        
        {hasSubServices ? (
          <>
            {/* CASO 1: (Estética) Mostra a lista de sub-serviços */}
            <Text style={styles.sectionTitle}>Escolha o Serviço Específico</Text>
            {/* CORREÇÃO: Usa "subservices" (minúsculo) aqui também */}
            {selectedService.subservices.map((sub, index) => (
              <TouchableOpacity key={index} style={styles.subServiceCard} onPress={() => handleSubServiceSelect(sub)}>
                <Text style={styles.subServiceTitle}>{sub.title} (R$ {sub.price.toFixed(2)})</Text>
                <Text style={styles.subServiceButton}>Selecionar ›</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            {/* CASO 2: (Manicure) Mostra o preço e o botão de continuar */}
            <Text style={styles.sectionTitle}>Serviço</Text>
            <View style={styles.subServiceCard}>
              <Text style={styles.subServiceTitle}>
                {selectedService.title} (R$ {selectedService.price ? selectedService.price.toFixed(2) : '0.00'})
              </Text>
            </View>
            <TouchableOpacity style={[styles.primaryButton, {marginTop: 30}]} onPress={() => checkLoginAndProceed(2)}>
              <Text style={styles.primaryButtonText}>Escolher Data e Hora</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  }
  else if (step === 2) {
    const serviceTitle = selectedSubService?.title || selectedService.title;
    // CORREÇÃO: Usa "subservices" (minúsculo) para o botão voltar
    const backAction = (selectedService.subservices && selectedService.subservices.length > 0) ? () => setStep(1.5) : () => setStep(1.5);
    const backText = selectedService.title;
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
                  <TouchableOpacity key={slot.iso} style={[styles.timeSlot, slot.isBooked && styles.timeSlotBooked, selectedTime?.iso === slot.iso && styles.timeSlotSelected]} disabled={slot.isBooked} onPress={() => setSelectedTime(slot)}>
                    <Text style={[styles.timeSlotText, slot.isBooked && styles.timeSlotTextBooked, selectedTime?.iso === slot.iso && styles.timeSlotTextSelected]}>{slot.time}</Text>
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

const PaymentScreen = ({ onNavigate, route }) => {
  const { booking } = route.params; const { user, profile, refreshProfile } = useAuth(); const [agreedToTerms, setAgreedToTerms] = useState(false); const [isLoading, setIsLoading] = useState(false);
  const handleFinalConfirm = async () => {
    if (!agreedToTerms) { Alert.alert("Termos", "Você precisa aceitar os termos de cancelamento para continuar."); return; }
    if (!auth.currentUser || !user || !profile || !db) { Alert.alert("Erro", "Você não está logado corretamente."); return; }
    
    const currentBalance = profile.fictionalBalance || 0;
    if (currentBalance < booking.price) {
      Alert.alert("Saldo Insuficiente", `Você não tem saldo (R$ ${currentBalance.toFixed(2)}) para cobrir o custo de R$ ${booking.price.toFixed(2)}.`); return;
    }
    if (!booking.professional || !booking.professionalId) {
        console.error("Erro Crítico de Agendamento: Dados do profissional estão faltando.", booking);
        Alert.alert("Erro", "Não foi possível identificar o profissional. Por favor, tente refazer o agendamento.");
        return;
    }
    
    setIsLoading(true);
    try {
      const newBookingRef = doc(collection(db, "agendamentos"));
      const userDocRef = doc(db, "users", user.uid);
      const newBalance = currentBalance - booking.price;
      await setDoc(newBookingRef, {
        id: newBookingRef.id,
        clientId: user.uid,
        clientName: profile.fullName,
        clientEmail: user.email,
        clientPhone: profile.phone,
        service: booking.serviceTitle,
        professional: booking.professional,
        professionalId: booking.professionalId,
        date: booking.date,
        time: booking.time,
        price: booking.price,
        status: "confirmado", 
        createdAt: new Date().toISOString(),
        cancellationFee: 0,
      });
      await updateDoc(userDocRef, { fictionalBalance: newBalance });
      await refreshProfile(user.uid); 
      setIsLoading(false);
      Alert.alert("Agendamento Concluído!", `Seu horário foi confirmado. R$ ${booking.price.toFixed(2)} foram debitados do seu saldo.`);
      onNavigate('mainApp_client', { activeTab: 'inicio' });
    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao salvar agendamento:", error);
      Alert.alert("Erro", "Não foi possível salvar seu agendamento.");
    }
  };
  return (
    <ScrollView style={styles.page}>
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('mainApp_client', { activeTab: 'agendamentos' })}>
        <BackArrowIcon />
        <Text style={styles.backButtonText}>Voltar</Text> 
      </TouchableOpacity>
      <Text style={styles.greeting}>Confirmar Agendamento</Text>
      <View style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Text style={styles.summaryText}>Serviço: {booking.serviceTitle}</Text>
          <Text style={styles.summaryText}>Profissional: {booking.professional || 'Não definido'}</Text>
          <Text style={styles.summaryText}>Data: {booking.date.split('-').reverse().join('/')}</Text>
          <Text style={styles.summaryText}>Horário: {booking.time}</Text>
          <Text style={[styles.summaryText, {fontWeight: 'bold', fontSize: 18, marginTop: 10}]}>
            Total: R$ {booking.price.toFixed(2)}
          </Text>
          <Text style={[styles.summaryText, {color: '#8A74A8', marginTop: 5}]}>
            Seu saldo: R$ {profile?.fictionalBalance?.toFixed(2) || '0.00'}
          </Text>
      </View>
      <View style={[styles.profileCard, {marginTop: 20}]}><Text style={styles.sectionTitle}>Termos de Cancelamento</Text><Text style={styles.termsText}>Ao confirmar, você concorda com nossa política de cancelamento. Cancelamentos feitos com menos de 24 horas de antecedência estarão sujeitos a uma<Text style={{fontWeight: 'bold'}}> taxa de cancelamento de 30%</Text> do valor total do serviço.</Text><TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreedToTerms(!agreedToTerms)}><View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>{agreedToTerms ? <CheckIcon /> : null}</View><Text style={styles.checkboxLabel}>Li e concordo com os termos.</Text></TouchableOpacity></View>
      <TouchableOpacity style={[styles.primaryButton, {marginTop: 30, backgroundColor: agreedToTerms ? '#E6AAB7' : '#CCC'}]} onPress={handleFinalConfirm} disabled={isLoading || !agreedToTerms}>{isLoading ? ( <ActivityIndicator color="#FFF" /> ) : ( <Text style={styles.primaryButtonText}>Confirmar e Pagar (Saldo Fictício)</Text> )}</TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const MeusAgendamentosScreen = ({ onNavigate }) => {
  const { user, profile, refreshProfile } = useAuth(); const [agendamentos, setAgendamentos] = useState([]); const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!db || !user || !user.uid) { setIsLoading(false); return; }
    const q = query(
      collection(db, "agendamentos"), 
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookings = [];
      querySnapshot.forEach((doc) => { bookings.push(doc.data()); });
      setAgendamentos(bookings);
      setIsLoading(false);
    }, (error) => { console.error("Erro ao buscar agendamentos (Cliente):", error.message); setIsLoading(false); if(error.code === 'failed-precondition') {Alert.alert("Erro de Banco de Dados", "O app precisa de um índice do Firestore. Siga o link no terminal do VS Code para criá-lo.");} });
    return () => unsubscribe();
  }, [user]);

  const handleCancelBooking = async (booking) => {
    if (booking.status === 'cancelado') { Alert.alert("Aviso", "Este agendamento já está cancelado."); return; }
    const price = booking.price;
    const fee = price * 0.30;
    const refund = price - fee;
    Alert.alert( "Confirmar Cancelamento", `Você tem certeza?\n\nServiço: ${booking.service}\nValor: R$ ${price.toFixed(2)}\n\nSerá cobrada uma taxa de 30% (R$ ${fee.toFixed(2)}).\nVocê será reembolsado em R$ ${refund.toFixed(2)}.`, [ { text: "Não", style: "cancel" }, { text: "Sim, cancelar", style: "destructive", onPress: async () => { if (!db || !booking.id || !user || !user.uid) return; try { const bookingDocRef = doc(db, "agendamentos", booking.id); const userDocRef = doc(db, "users", user.uid);
            await updateDoc(bookingDocRef, { status: "cancelado", cancellationFee: fee, price: 0 });
            await updateDoc(userDocRef, { fictionalBalance: increment(refund) });
            await refreshProfile(user.uid);
            Alert.alert("Sucesso", `Agendamento cancelado. R$ ${refund.toFixed(2)} foram estornados.`);
          } catch (error) { console.error("Erro ao cancelar:", error); Alert.alert("Erro", "Não foi possível cancelar."); } } } ]
    );
  };
 
  const viewDetails = (booking) => {
    onNavigate('bookingDetail', { booking: booking, userType: 'client' });
  };

  return (
    <View style={styles.page}>
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
            <TouchableOpacity onPress={() => viewDetails(item)}>
              <View style={[styles.profileCard, {alignItems: 'flex-start', marginBottom: 15}]}>
                <Text style={[styles.sectionTitle, {marginTop: 0, color: item.status === 'cancelado' ? '#AAA' : '#333'}]}>{item.service}</Text>
                <Text style={styles.summaryText}>Profissional: {item.professional}</Text>
                <Text style={styles.summaryText}>Data: {item.date.split('-').reverse().join('/')} às {item.time}</Text>
                {item.status === 'confirmado' ? (
                  <Text style={styles.summaryText}>Valor Pago: R$ {item.price.toFixed(2)}</Text>
                ) : (
                  <Text style={styles.summaryText}>Taxa Paga: R$ {item.cancellationFee.toFixed(2)}</Text>
                )}
                <Text style={[styles.summaryText, {fontWeight: 'bold', textTransform: 'capitalize', color: item.status === 'cancelado' ? '#ef4444' : '#22c55e'}]}>
                  Status: {item.status}
                </Text>
                {item.status !== 'cancelado' && (
                  <TouchableOpacity 
                    style={[styles.secondaryButton, {width: '100%', marginTop: 15, borderColor: '#ef4444'}]} 
                    onPress={() => handleCancelBooking(item)}
                  >
                    <Text style={[styles.secondaryButtonText, {color: '#ef4444'}]}>Cancelar Agendamento</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const PerfilScreen = ({ onLogout }) => {
  const { user, isGuest, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false); const [isEditing, setIsEditing] = useState(false); const [editName, setEditName] = useState(profile?.fullName || ''); const [editPhone, setEditPhone] = useState(profile?.phone || '');
  useEffect(() => { setEditName(profile?.fullName || ''); setEditPhone(profile?.phone || ''); }, [profile]);
  const handleSaveChanges = async () => { if (!user || !user.uid || !db) return; if (editName.trim() === '' || editPhone.trim() === '') { Alert.alert("Erro", "Preencha Nome e Celular."); return; } setIsLoading(true); try { const userDocRef = doc(db, "users", user.uid); await updateDoc(userDocRef, { fullName: editName.trim(), phone: editPhone.trim(), }); await refreshProfile(user.uid); setIsEditing(false); Alert.alert("Sucesso", "Perfil atualizado!"); } catch (error) { console.error("Erro atualizar perfil:", error); Alert.alert("Erro", "Não foi possível salvar."); } finally { setIsLoading(false); } };
  const photoSource = require('./assets/avatar-placeholder.png'); 
  return (
    <ScrollView style={styles.page}>
      <Text style={styles.greeting}>Meu Perfil</Text>
      {isGuest || !user ? (
          <View style={styles.profileCard}><Text style={styles.profileName}>Visitante</Text><TouchableOpacity style={[styles.primaryButton, {marginTop: 20}]} onPress={onLogout}><Text style={styles.primaryButtonText}>Login/Cadastro</Text></TouchableOpacity></View>
      ) : (
        <>
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
          <View style={[styles.profileCard, {marginTop: 20}]}>
             <Text style={styles.sectionTitle}>Meu Saldo</Text>
             <Text style={styles.saldoTotal}>R$ {profile?.fictionalBalance?.toFixed(2) || '0.00'}</Text>
             <Text style={styles.termsText}>Este é seu saldo fictício para agendamentos.</Text>
          </View>
        </>
      )}
       <View style={{ height: 100 }} />
    </ScrollView>
  );
};
const ClientTabBar = ({ activeTab, onTabPress }) => ( 
  <View style={styles.tabBar}>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('inicio')}><HomeIcon color={activeTab === 'inicio' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'inicio' ? '#A78B4F' : '#C0B49D' }]}>Início</Text></TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('agendamentos')}><CalendarIcon color={activeTab === 'agendamentos' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'agendamentos' ? '#A78B4F' : '#C0B49D' }]}>Agendar</Text></TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('meusAgendamentos')}><ListIcon color={activeTab === 'meusAgendamentos' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'meusAgendamentos' ? '#A78B4F' : '#C0B4D' }]}>Meus Horários</Text></TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('perfil')}><UserIcon color={activeTab === 'perfil' ? "#A78B4F" : "#C0B4D"} /><Text style={[styles.tabLabel, { color: activeTab === 'perfil' ? '#A78B4F' : '#C0B49D' }]}>Perfil</Text></TouchableOpacity>
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
const ProfessionalSaldoScreen = ({ onNavigate }) => {
  const { user, profile } = useAuth(); const [allBookings, setAllBookings] = useState([]); const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    if (!db || !user || !user.uid || !profile) { setIsLoading(false); return; }
    const q = query(
      collection(db, "agendamentos"), 
      where("professionalId", "==", user.uid),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookings = [];
      querySnapshot.forEach((doc) => { bookings.push(doc.data()); });
      setAllBookings(bookings);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar Saldo/Agenda Pro:", error);
      if (error.code === 'failed-precondition') {
        Alert.alert("Erro de Banco de Dados", "O app precisa de um índice do Firestore para funcionar. Siga o link no terminal do VS Code para criá-lo.");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user, profile]);

  let totalSaldo = 0;
  const agendaConfirmada = [];
  for (const booking of allBookings) {
    if (booking.status === 'confirmado') {
      totalSaldo += (booking.price || 0);
      agendaConfirmada.push(booking);
    } else if (booking.status === 'cancelado') {
      totalSaldo += (booking.cancellationFee || 0);
    }
  }
 
  const viewDetails = (booking) => {
    onNavigate('bookingDetail', { booking: booking, userType: 'professional' });
  };

  return (
    <View style={styles.page}>
      <Text style={styles.greeting}>Agenda & Saldo</Text>
     
      <View style={styles.saldoCardSmall}>
        <Text style={styles.subtitle}>Saldo a Receber</Text>
        <Text style={styles.saldoTotalSmall}>R$ {totalSaldo.toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#E6AAB7" style={{marginTop: 30}} />
      ) : agendaConfirmada.length === 0 ? (
        <View style={styles.profileCard}><Text style={styles.subtitle}>Nenhum agendamento confirmado.</Text></View>
      ) : (
        <FlatList
          data={agendaConfirmada}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => viewDetails(item)}>
              <View style={[styles.subServiceCard, {flexDirection: 'column', alignItems: 'flex-start'}]}>
                <Text style={styles.subServiceTitle}>{item.service}</Text>
                <Text style={styles.summaryText}>Cliente: {item.clientName}</Text>
                <Text style={styles.summaryText}>Data: {item.date.split('-').reverse().join('/')} às {item.time}</Text>
                <Text style={styles.saldoItemPrice}>+ R$ {item.price ? item.price.toFixed(2) : '0.00'}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const ProfessionalSaqueScreen = () => {
  const handleSaque = () => {
     Alert.alert("Saque Solicitado (Simulado)", "Em um app real, isso iniciaria uma transferência para a conta bancária do profissional, limpando o 'Saldo a Receber'.");
  };
  return (
     <ScrollView style={styles.page}>
        <Text style={styles.greeting}>Solicitar Saque</Text>
        <View style={styles.profileCard}>
            <Text style={styles.subtitle}>Solicitar Saque (Fictício)</Text>
            <Text style={styles.termsText}>O seu saldo total a receber da aba "Saldo & Agenda" será transferido para sua conta bancária registrada.</Text>
             <TouchableOpacity style={[styles.proButton, {marginTop: 20}]} onPress={handleSaque}>
               <Text style={styles.proButtonText}>Solicitar Saque</Text>
             </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

const ServiceManagementScreen = ({ onNavigate }) => {
  const [servicesData, setServicesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null); 

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "services"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const services = [];
      querySnapshot.forEach((doc) => { services.push({ id: doc.id, ...doc.data() }); });
      setServicesData(services);
      setIsLoading(false);
    }, (error) => { console.error("Erro ao buscar serviços:", error); setIsLoading(false); });
    return () => unsubscribe();
  }, []);
 
  const handleEditClick = (service, subService = null) => {
    if (subService) {
      setEditingService({ serviceId: service.id, title: subService.title });
      setNewPrice(subService.price.toString());
    } else {
      setEditingService({ serviceId: service.id, title: service.title });
      setNewPrice(service.price.toString());
    }
  };
 
  const handleCancelEdit = () => { setEditingService(null); setNewPrice(''); };
 
  const handleSavePrice = async () => {
    if (!db || !editingService) return;
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) { Alert.alert("Erro", "Por favor, insira um preço válido."); return; }

    try {
      const serviceDocRef = doc(db, "services", editingService.serviceId);
      const docSnap = await getDoc(serviceDocRef);
      if (!docSnap.exists()) throw new Error("Serviço não encontrado");
     
      const serviceData = docSnap.data();
     
      // CORREÇÃO: Usa "subservices" (minúsculo)
      if (serviceData.subservices && serviceData.subservices.find(s => s.title === editingService.title)) {
        // É um SUB-SERVIÇO
        // CORREÇÃO: Usa "subservices" (minúsculo)
        const updatedSubServices = serviceData.subservices.map(sub => {
          if (sub.title === editingService.title) {
            return { ...sub, price: price }; // Atualiza o preço
          }
          return sub;
        });
        await updateDoc(serviceDocRef, { subservices: updatedSubServices });
      } else {
        // É um SERVIÇO PRINCIPAL (ex: Manicure)
        await updateDoc(serviceDocRef, { price: price });
      }
     
      Alert.alert("Sucesso", "Preço atualizado!");
      handleCancelEdit();
    } catch (error) { console.error("Erro ao salvar preço:", error); Alert.alert("Erro", "Não foi possível salvar o preço."); }
  };

  const renderServiceEditor = (service, sub) => {
    const isEditingThis = editingService && editingService.title === (sub ? sub.title : service.title);
   
    return (
      <View key={sub ? sub.title : service.id} style={styles.subServiceCard}>
        {isEditingThis ? (
          // Modo Edição
          <View style={{width: '100%'}}>
            <Text style={styles.subServiceTitle}>{sub ? sub.title : service.title}</Text>
            <View style={styles.inputContainerInline}>
              <MoneyIcon />
              <TextInput 
                style={styles.inputInline} 
                value={newPrice} 
                onChangeText={setNewPrice} 
                keyboardType="numeric" 
                placeholder="Novo Preço (ex: 150.00)"
              />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSavePrice}>
              <Text style={styles.primaryButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={handleCancelEdit}>
              <Text style={styles.ghostButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Modo Visualização
          <>
            <Text style={styles.subServiceTitle}>
              {sub ? sub.title : service.title} (R$ {sub ? sub.price.toFixed(2) : service.price.toFixed(2)})
            </Text>
            <TouchableOpacity onPress={() => handleEditClick(service, sub)}>
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.page}>
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('mainApp_pro', { activeTab: 'config' })}>
        <BackArrowIcon />
        <Text style={styles.backButtonText}>Ajustes</Text>
      </TouchableOpacity>
      <Text style={styles.greeting}>Meus Serviços e Preços</Text>
     
      {isLoading ? <ActivityIndicator color="#E6AAB7" /> : servicesData.map(service => (
        <View key={service.id} style={{marginBottom: 15}}>
          <TouchableOpacity 
            style={[styles.profileCard, {alignItems: 'flex-start', padding: 20, marginTop: 0}]}
            onPress={() => setExpandedCategory(expandedCategory === service.id ? null : service.id)}
          >
            <Text style={[styles.sectionTitle, {marginTop: 0, marginBottom: 0}]}>{service.title}</Text>
          </TouchableOpacity>
         
          {expandedCategory === service.id && (
            <View style={styles.serviceEditorContainer}>
              {/* CORREÇÃO: Usa "subservices" (minúsculo) */}
              {(!service.subservices || service.subservices.length === 0) && (
                renderServiceEditor(service, null)
              )}
             
              {/* CORREÇÃO: Usa "subservices" (minúsculo) */}
              {service.subservices && service.subservices.map((sub) => (
                renderServiceEditor(service, sub)
              ))}
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity style={[styles.secondaryButton, {marginTop: 20}]} onPress={() => Alert.alert("Em Breve", "Função para adicionar uma nova categoria de serviço (ex: 'Massagem') ou um novo sub-serviço (ex: 'Drenagem Linfática').")}>
          <Text style={styles.secondaryButtonText}>+ Adicionar Novo Serviço</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// --- NOVA TELA: Detalhes do Agendamento ---
const BookingDetailScreen = ({ onNavigate, route }) => {
  const { booking, userType } = route.params;
  const handleBack = () => {
    if (userType === 'client') {
      onNavigate('mainApp_client', { activeTab: 'meusAgendamentos' });
    } else {
      onNavigate('mainApp_pro', { activeTab: 'saldo' });
    }
  };
  return (
    <ScrollView style={styles.page}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <BackArrowIcon />
        <Text style={styles.backButtonText}>Voltar</Text> 
      </TouchableOpacity>
      <Text style={styles.greeting}>{booking.service}</Text>
      <View style={styles.profileCard}>
        <Text style={styles.sectionTitle}>Detalhes do Agendamento</Text>
        {userType === 'professional' && (
          <>
            <Text style={styles.summaryText}>Cliente: {booking.clientName}</Text>
            <Text style={styles.summaryText}>Email: {booking.clientEmail}</Text>
            <Text style={styles.summaryText}>Telefone: {booking.clientPhone || 'Não informado'}</Text>
          </>
        )}
        {userType === 'client' && (
           <Text style={styles.summaryText}>Profissional: {booking.professional}</Text>
        )}
        <Text style={styles.summaryText}>Data: {booking.date.split('-').reverse().join('/')}</Text>
        <Text style={styles.summaryText}>Horário: {booking.time}</Text>
        <Text style={[styles.summaryText, {fontWeight: 'bold', textTransform: 'capitalize', color: booking.status === 'cancelado' ? '#ef4444' : '#22c55e'}]}>
          Status: {booking.status}
        </Text>
        {booking.status === 'confirmado' ? (
          <Text style={[styles.saldoItemPrice, {marginTop: 10}]}>Valor Pago: R$ {booking.price.toFixed(2)}</Text>
        ) : (
          <Text style={[styles.summaryText, {color: '#ef4444'}]}>Taxa Paga: R$ {booking.cancellationFee.toFixed(2)}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const ProfessionalConfigScreen = ({ onLogout, onNavigate }) => {
  const { user, profile } = useAuth();
  return (
    <ScrollView style={styles.page}>
      <Text style={styles.greeting}>Ajustes</Text>
      <Text style={styles.sectionTitle}>Meu Perfil</Text>
      <View style={styles.profileCard}>
        <Image source={require('./assets/avatar-placeholder.png')} style={styles.profilePhoto} />
        <Text style={styles.profileName}>{profile?.fullName || user.email.split('@')[0]}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
        <Text style={styles.profilePhone}>{profile?.phone || '(Celular não informado)'}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert("Em Breve", "Tela para editar nome e celular do profissional.")}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Gerenciamento</Text>
      <TouchableOpacity style={styles.subServiceCard} onPress={() => onNavigate('serviceManagement')}>
        <Text style={styles.subServiceTitle}>Meus Serviços e Preços</Text>
        <Text style={styles.subServiceButton}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subServiceCard} onPress={() => Alert.alert("Em Breve", "Aqui você poderá bloquear datas ou horários específicos na sua agenda.")}>
        <Text style={styles.subServiceTitle}>Bloquear Horários</Text>
        <Text style={styles.subServiceButton}>›</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Conta</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <LogoutIcon /><Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
       <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const ProfessionalTabBar = ({ activeTab, onTabPress }) => ( 
  <View style={styles.tabBar}>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('saldo')}>
      <SaldoIcon color={activeTab === 'saldo' ? "#A78B4F" : "#C0B49D"} />
      <Text style={[styles.tabLabel, { color: activeTab === 'saldo' ? '#A78B4F' : '#C0B49D' }]}>Agenda & Saldo</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('saque')}>
      <SaqueIcon color={activeTab === 'saque' ? "#A78B4F" : "#C0B49D"} />
      <Text style={[styles.tabLabel, { color: activeTab === 'saque' ? '#A78B4F' : '#C0B49D' }]}>Saque</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('config')}>
      <ConfigIcon color={activeTab === 'config' ? "#A78B4F" : "#C0B49D"} />
      <Text style={[styles.tabLabel, { color: activeTab === 'config' ? '#A78B4F' : '#C0B4D' }]}>Ajustes</Text>
    </TouchableOpacity>
  </View> 
);

const ProfessionalMainApp = ({ onNavigate, route, onLogout }) => {
  const [activeTab, setActiveTab] = useState('saldo');
  const renderContent = () => {
    switch (activeTab) {
      case 'saque': return <ProfessionalSaqueScreen />;
      case 'config': return <ProfessionalConfigScreen onLogout={onLogout} onNavigate={onNavigate} />;
      case 'saldo': default: return <ProfessionalSaldoScreen onNavigate={onNavigate} />;
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
        return { hasProfile: (!!data.fullName), role: data.role || 'client' }; 
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
      if (currentUser) {
        setIsGuest(false);
        try {
          const userToSave = { uid: currentUser.uid, email: currentUser.email };
          setUser(userToSave);
          console.log("App: Usuário definido no estado:", userToSave.uid);
          const { hasProfile, role } = await refreshProfile(currentUser.uid);
          
          if (role === 'professional') {
             console.log("App: Usuário é PROFISSIONAL. Navegando para mainApp_pro");
             setScreen('mainApp_pro');
          } else if (hasProfile && (role === 'client' || !role)) {
            console.log("App: Usuário é CLIENTE com perfil completo. Navegando para mainApp_client");
            setScreen('mainApp_client');
          } else {
            console.log("App: Perfil incompleto ou sem função. Navegando para completeProfile");
            setScreen('completeProfile');
          }
        } catch (error) { console.error("App: Erro crítico dentro do onAuthStateChanged:", error); setUser(null); setProfile(null); setScreen('welcome'); }
      } else {
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
        setIsGuest(true); setUser(null); setProfile(null); setScreen('mainApp_client');
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
          {screen === 'mainApp_client' ? <ClientMainApp {...props} onLogout={handleLogout} /> : null}
          {screen === 'login' ? <LoginScreen {...props} /> : null}
          {screen === 'register' ? <RegisterScreen {...props} /> : null}
          {screen === 'completeProfile' ? <CompleteProfileScreen {...props} /> : null}
          {screen === 'payment' ? <PaymentScreen {...props} /> : null}
          {screen === 'bookingDetail' ? <BookingDetailScreen {...props} /> : null}

          {screen === 'mainApp_pro' ? <ProfessionalMainApp {...props} onLogout={handleLogout} /> : null}
          {screen === 'proLogin' ? <ProfessionalLoginScreen {...props} /> : null}
          {/* ================================================== */}
          {/* INÍCIO DA CORREÇÃO 3 (typo '===a===')            */}
          {/* ================================================== */}
          {screen === 'proRegister' ? <ProfessionalRegisterScreen {...props} /> : null}
          {/* ================================================== */}
          {/* FIM DA CORREÇÃO 3                                */}
          {/* ================================================== */}
          {screen === 'serviceManagement' ? <ServiceManagementScreen {...props} /> : null}
          
          {screen === 'welcome' ? <WelcomeScreen {...props} /> : null}
          
          {!['mainApp_client', 'login', 'register', 'completeProfile', 'payment', 'bookingDetail', 'mainApp_pro', 'proLogin', 'proRegister', 'serviceManagement', 'welcome', 'loading', 'error'].includes(screen) &&
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
  // TELA DE SALDO
  saldoCardSmall: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  saldoTotal: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#8A74A8',
    marginBottom: 10,
    textAlign: 'center',
  },
  saldoTotalSmall: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8A74A8',
  },
  saldoItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e', // Verde
    marginTop: 8,
  },
  // Service Management
  serviceEditorContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginTop: -10, // Puxa para baixo do card principal
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  }
});