import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, Alert, ScrollView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import {
  initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Image Picker
import * as ImagePicker from 'expo-image-picker';

console.log("App.js: Script iniciado.");

// --- Ícones ---
const HomeIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>;
const CalendarIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🗓️</Text>;
const SearchIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>🔍</Text>;
const UserIcon = ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>;
const LogoutIcon = () => <Text style={{fontSize: 20, color: '#ef4444'}}>🚪</Text>;
const MailIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>✉️</Text>;
const LockIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>🔒</Text>;
const PhoneIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>📱</Text>;
const PersonIcon = () => <Text style={{fontSize: 20, color: '#8A74A8'}}>🧑</Text>;
const BackArrowIcon = () => <Text style={{ fontSize: 24, color: '#8A74A8' }}>‹</Text>;
const EyeIcon = ({ closed }) => <Text style={{fontSize: 20, color: '#8A74A8'}}>{closed ? '👁️‍🗨️' : '👁️'}</Text>;
const CameraIcon = () => <Text style={{fontSize: 16, color: '#FFF'}}>📷</Text>;

// --- SUA CONFIGURAÇÃO DO FIREBASE (AGORA CORRETA!) ---
// Esta é a configuração que você copiou do seu console
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
let app; let auth; let db; let storage;
let firebaseInitializationError = null;
try {
  console.log("App.js: Tentando inicializar Firebase...");
  app = initializeApp(firebaseConfig);
  console.log("App.js: initializeApp OK.");
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  console.log("App.js: initializeAuth OK.");
  db = getFirestore(app);
  console.log("App.js: getFirestore OK.");
  storage = getStorage(app);
  console.log("App.js: getStorage OK. Firebase inicializado com sucesso!");
} catch (error) {
  console.error("ERRO GRAVE NA INICIALIZAÇÃO DO FIREBASE:", error.message);
  firebaseInitializationError = error;
}

// --- Contexto ---
const AuthContext = createContext({ user: null, profile: null, isGuest: false, isLoadingAuth: true, refreshProfile: async () => false });
const useAuth = () => useContext(AuthContext);

// --- Telas de Autenticação ---
const WelcomeScreen = ({ onNavigate }) => (
 <View style={styles.container}>
   <Text style={styles.title}>TP Estética</Text>
   <Text style={styles.subtitle}>Sua beleza, na palma da sua mão.</Text>
   <View style={styles.buttonContainer}>
     <TouchableOpacity style={styles.primaryButton} onPress={() => onNavigate('login')}><Text style={styles.primaryButtonText}>Entrar</Text></TouchableOpacity>
     <TouchableOpacity style={styles.secondaryButton} onPress={() => onNavigate('register')}><Text style={styles.secondaryButtonText}>Criar Conta</Text></TouchableOpacity>
     <TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('mainApp', { isGuest: true })}><Text style={styles.ghostButtonText}>Continuar sem login</Text></TouchableOpacity>
   </View>
 </View>
);

const LoginScreen = ({ onNavigate }) => {
 const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
 const handleLogin = async () => { if (!auth) { Alert.alert("Erro", "Firebase não inicializado."); return; } if (email === '' || password === '') { Alert.alert("Erro", "Preencha e-mail e senha."); return; } setIsLoading(true); try { await signInWithEmailAndPassword(auth, email.trim(), password); } catch (error) { setIsLoading(false); Alert.alert("Erro de Login", "E-mail ou senha incorretos."); }};
 return (
   <View style={styles.container}>
     <Text style={styles.welcomeBack}>Acesse sua conta</Text>
     <View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View>
     <View style={styles.inputContainer}>
        <LockIcon />
        <TextInput style={styles.input} placeholder="Digite sua senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity>
     </View>
     <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}</TouchableOpacity>
     <TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('welcome')}><Text style={styles.ghostButtonText}>‹ Voltar</Text></TouchableOpacity>
   </View>
 );
};

const RegisterScreen = ({ onNavigate }) => {
 const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [isLoading, setIsLoading] = useState(false); const [showPassword, setShowPassword] = useState(false); const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const handleRegister = async () => { if (!auth) { Alert.alert("Erro", "Firebase não inicializado."); return; } if (password !== confirmPassword) { Alert.alert("Erro", "As senhas não são iguais."); return; } if (password.length < 6) { Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres."); return; } setIsLoading(true); try { await createUserWithEmailAndPassword(auth, email.trim(), password); } catch (error) { setIsLoading(false); console.error("Erro Cadastro:", error.code, error.message); if (error.code === 'auth/email-already-in-use') { Alert.alert("Erro", "Este e-mail já está cadastrado."); } else if (error.code === 'auth/invalid-email') { Alert.alert("Erro", "O formato do e-mail é inválido."); } else if (error.code === 'auth/weak-password') { Alert.alert("Erro", "A senha é muito fraca (mínimo 6 caracteres)."); } else if (error.code === 'auth/api-key-not-valid') { Alert.alert("Erro de Chave", "A `firebaseConfig` no App.js está errada. Cole a config correta do site do Firebase."); } else { Alert.alert("Erro de Cadastro", "Não foi possível criar a conta. Verifique os dados e tente novamente."); } }};
 return (
   <View style={styles.container}>
     <Text style={styles.welcomeBack}>Crie sua conta</Text>
     <View style={styles.inputContainer}><MailIcon /><TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#AAA" /></View>
     <View style={styles.inputContainer}>
        <LockIcon />
        <TextInput style={styles.input} placeholder="Crie uma senha (mín. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#AAA" />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></TouchableOpacity>
     </View>
     <View style={styles.inputContainer}>
        <LockIcon />
        <TextInput style={styles.input} placeholder="Confirme sua senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholderTextColor="#AAA" />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><EyeIcon closed={!showConfirmPassword} /></TouchableOpacity>
     </View>
     <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Criar Conta</Text>}</TouchableOpacity>
     <TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('welcome')}><Text style={styles.ghostButtonText}>‹ Voltar</Text></TouchableOpacity>
   </View>
 );
};

// --- NOVA TELA: Completar Perfil ---
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
      }, { merge: true });

      await refreshProfile(user.uid);
      // A navegação será feita pelo useEffect principal

    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao salvar perfil:", error);
      Alert.alert("Erro", "Não foi possível salvar seu perfil. Verifique as 'Regras' do Firestore no Firebase Console.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quase lá!</Text>
      <Text style={styles.subtitle}>Complete seu perfil para continuar.</Text>
      <View style={styles.inputContainer}>
        <PersonIcon />
        <TextInput style={styles.input} placeholder="Digite seu nome completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholderTextColor="#AAA" />
      </View>
      <View style={styles.inputContainer}>
        <PhoneIcon />
        <TextInput style={styles.input} placeholder="Digite seu Celular (com DDD)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#AAA" />
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Salvar e Entrar</Text>}
      </TouchableOpacity>
       <TouchableOpacity style={styles.ghostButton} onPress={() => { if(auth) signOut(auth); }}>
        <Text style={styles.ghostButtonText}>Cancelar e Sair</Text>
      </TouchableOpacity>
    </View>
  );
};


// --- App Principal (Telas de Navegação) ---
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
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const SERVICES_DATA = [
  { id: 'manicure', title: 'Manicure', image: 'https://images.unsplash.com/photo-1632345031435-8727f66c0274?q=80&w=400&auto=format&fit=crop', professional: { name: 'Ana Silva', photo: 'https://placehold.co/100x100/E6AAB7/FFF?text=AS' } },
  { id: 'estetica', title: 'Estética Facial', image: 'https://images.unsplash.com/photo-1512290923902-8a9f31c83659?q=80&w=400&auto=format&fit=crop', professional: { name: 'Thais de Paulo', photo: 'https://placehold.co/100x100/D4AF37/FFF?text=TD' }, subServices: [
      { id: 'botox', title: 'Aplicação de Botox' },
      { id: 'limpeza', title: 'Limpeza de Pele Profunda' },
      { id: 'peeling', title: 'Peeling Químico Suave' },
    ]
  },
  { id: 'cabelo', title: 'Cabelo', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop', professional: { name: 'Carlos Mendes', photo: 'https://placehold.co/100x100/8A74A8/FFF?text=CM' } },
];

const BOOKED_TIMES = {
    '2025-10-23': ['10:00', '14:00'],
    '2025-10-24': ['11:00', '15:00'],
};
const generateTimeSlots = (selectedDateISO) => { const slots = []; const bookedSlots = BOOKED_TIMES[selectedDateISO] || []; for (let hour = 7; hour <= 17; hour++) { const displayHour = hour.toString().padStart(2, '0'); const displayTime = `${displayHour}:00`; const isBooked = bookedSlots.includes(displayTime); slots.push({ time: displayTime, iso: `${selectedDateISO}T${displayHour}:00:00`, isBooked: isBooked }); } return slots; };
const CalendarDays = ({ selectedDate, onDateSelect }) => { const today = new Date(); const days = []; const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; for (let i = 0; i < 5; i++) { const date = new Date(today); date.setDate(today.getDate() + i); const dateString = date.toISOString().split('T')[0]; const dayOfMonth = date.getDate(); const dayOfWeek = dayNames[date.getDay()]; days.push({ dateString, dayOfMonth, dayOfWeek }); } return ( <View style={styles.calendar}>{days.map(day => ( <TouchableOpacity key={day.dateString} style={[styles.dateCell, selectedDate === day.dateString && styles.dateCellSelected]} onPress={() => onDateSelect(day.dateString)}><Text style={[styles.dateText, selectedDate === day.dateString && styles.dateTextSelected]}>{day.dayOfMonth}</Text><Text style={[styles.dateDay, selectedDate === day.dateString && styles.dateDaySelected]}>{day.dayOfWeek}</Text></TouchableOpacity> ))}</View> ); };

const AgendamentosScreen = ({ onNavigate }) => {
  const { user, isGuest } = useAuth(); const [step, setStep] = useState(1); const [selectedService, setSelectedService] = useState(null); const [selectedSubService, setSelectedSubService] = useState(null); const [selectedDate, setSelectedDate] = useState(null); const [selectedTime, setSelectedTime] = useState(null); const [timeSlots, setTimeSlots] = useState([]);
  const checkLoginAndProceed = (nextStep) => { if (isGuest || !user) { Alert.alert("Login Necessário", "Crie uma conta ou faça login para agendar.", [{ text: "Cancelar" }, { text: "Login/Cadastro", onPress: () => onNavigate('welcome') }] ); } else { setStep(nextStep); } };
  const handleServiceSelect = (service) => { setSelectedService(service); setSelectedSubService(null); setSelectedDate(null); setSelectedTime(null); if (service.subServices) { setStep(1.5); } else { checkLoginAndProceed(2); } };
  const handleSubServiceSelect = (subService) => { setSelectedSubService(subService); checkLoginAndProceed(2); };
  const handleDateSelect = (dateString) => { setSelectedDate(dateString); setSelectedTime(null); setTimeSlots(generateTimeSlots(dateString)); };
  const handleConfirmarAgendamento = async () => { if (!auth.currentUser || !user || !selectedService || !selectedTime || !selectedDate) return; const serviceTitle = selectedSubService?.title || selectedService.title; console.log("Agendamento Confirmado:", { userId: user.uid, userEmail: user.email, service: serviceTitle, professional: selectedService.professional.name, date: selectedDate, time: selectedTime.time }); Alert.alert("Agendamento Confirmado!", `Serviço: ${serviceTitle}\nProfissional: ${selectedService.professional.name}\nData: ${selectedDate.split('-').reverse().join('/')}\nHorário: ${selectedTime.time}`); resetFlow(); };
  const resetFlow = () => { setStep(1); setSelectedService(null); setSelectedSubService(null); setSelectedDate(null); setSelectedTime(null); };

  if (step === 1) { return ( <ScrollView style={styles.page}><Text style={styles.greeting}>Agendar Serviço</Text><Text style={styles.sectionTitle}>Escolha uma Categoria</Text>{SERVICES_DATA.map(service => ( <TouchableOpacity key={service.id} style={styles.serviceCard} onPress={() => handleServiceSelect(service)}><Image source={{ uri: service.image }} style={styles.serviceImage} resizeMode="cover"/><View style={styles.serviceTitleOverlay}><Text style={styles.serviceTitle}>{service.title}</Text></View></TouchableOpacity> ))}<View style={{ height: 50 }} /></ScrollView> ); }
  else if (step === 1.5) { return ( <ScrollView style={styles.page}><TouchableOpacity style={styles.backButton} onPress={resetFlow}><BackArrowIcon /><Text style={styles.backButtonText}>Categorias</Text></TouchableOpacity><Text style={styles.greeting}>{selectedService.title}</Text><Text style={styles.sectionTitle}>Profissional</Text><View style={styles.proCard}><Image source={{ uri: selectedService.professional.photo }} style={styles.proPhoto} /><Text style={styles.proName}>{selectedService.professional.name}</Text></View><Text style={styles.sectionTitle}>Escolha o Serviço Específico</Text>{selectedService.subServices.map(sub => ( <TouchableOpacity key={sub.id} style={styles.subServiceCard} onPress={() => handleSubServiceSelect(sub)}><Text style={styles.subServiceTitle}>{sub.title}</Text><Text style={styles.subServiceButton}>Selecionar ›</Text></TouchableOpacity> ))}<View style={{ height: 50 }} /></ScrollView> ); }
  else if (step === 2) { const serviceTitle = selectedSubService?.title || selectedService.title; const backAction = selectedService.subServices ? () => setStep(1.5) : resetFlow; const backText = selectedService.subServices ? selectedService.title : 'Categorias'; return ( <ScrollView style={styles.page}><TouchableOpacity style={styles.backButton} onPress={backAction}><BackArrowIcon /><Text style={styles.backButtonText}>{backText}</Text></TouchableOpacity><Text style={styles.greeting}>{serviceTitle}</Text><Text style={styles.sectionTitle}>Escolha uma data</Text><CalendarDays selectedDate={selectedDate} onDateSelect={handleDateSelect} />{selectedDate && ( <> <Text style={styles.sectionTitle}>Horários para {selectedDate.split('-').reverse().join('/')}</Text>{timeSlots.length > 0 ? ( <View style={styles.timeSlotContainer}>{timeSlots.map(slot => ( <TouchableOpacity key={slot.iso} style={[styles.timeSlot, slot.isBooked && styles.timeSlotBooked, selectedTime?.iso === slot.iso && styles.timeSlotSelected]} disabled={slot.isBooked} onPress={() => setSelectedTime(slot)}><Text style={[styles.timeSlotText, slot.isBooked && styles.timeSlotTextBooked, selectedTime?.iso === slot.iso && styles.timeSlotTextSelected]}>{slot.time}</Text></TouchableOpacity> ))} </View> ) : ( <ActivityIndicator style={{marginTop: 20}} color="#E6AAB7"/> )}</> )}{selectedTime && ( <TouchableOpacity style={[styles.primaryButton, {marginTop: 30}]} onPress={handleConfirmarAgendamento}><Text style={styles.primaryButtonText}>Confirmar Agendamento ({selectedTime.time})</Text></TouchableOpacity> )}<View style={{ height: 50 }} /></ScrollView> ); }
};
const ExplorarScreen = () => (<View style={styles.page}><Text style={styles.greeting}>Explorar</Text><Text style={styles.subtitle}>Descubra novos serviços e promoções em breve!</Text></View>);

const PerfilScreen = ({ onLogout }) => {
  const { user, isGuest, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false); const [isUploading, setIsUploading] = useState(false); const [isEditing, setIsEditing] = useState(false); const [editName, setEditName] = useState(profile?.fullName || ''); const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const { refreshProfile } = useContext(AuthContext);

  useEffect(() => { setEditName(profile?.fullName || ''); setEditPhone(profile?.phone || ''); }, [profile]);

  const pickImage = async () => { if (isUploading || !auth || !storage) return; const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permissionResult.granted) { Alert.alert("Permissão necessária."); return; } try { let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 }); if (!result.canceled && result.assets && result.assets.length > 0) { uploadImage(result.assets[0].uri); } } catch (pickerError) { console.error("Erro Image Picker:", pickerError); Alert.alert("Erro", "Não foi possível abrir a galeria."); } };
  const uploadImage = async (uri) => { if (!user || !user.uid || !storage || !db) return; setIsUploading(true); try { const response = await fetch(uri); const blob = await response.blob(); const storageRef = ref(storage, `profile_pictures/${user.uid}`); const uploadTask = uploadBytesResumable(storageRef, blob); uploadTask.on('state_changed', () => {}, async (error) => { console.error("Erro upload:", error.code, error.message); Alert.alert("Erro de Upload", `Falha no upload (${error.code}). Tente novamente.`); setIsUploading(false); }, async () => { try { const downloadURL = await getDownloadURL(uploadTask.snapshot.ref); const userDocRef = doc(db, "users", user.uid); await updateDoc(userDocRef, { photoURL: downloadURL }); await refreshProfile(user.uid); Alert.alert("Sucesso", "Foto atualizada!"); } catch (updateError) { console.error("Erro ao atualizar Firestore:", updateError); Alert.alert("Erro", "Upload concluído, mas falha ao salvar no perfil."); } finally { setIsUploading(false); } }); } catch (error) { console.error("Erro preparar upload:", error); Alert.alert("Erro", "Falha ao processar a imagem para upload."); setIsUploading(false); } };
  const handleSaveChanges = async () => { if (!user || !user.uid || !db) return; if (editName.trim() === '' || editPhone.trim() === '') { Alert.alert("Erro", "Preencha Nome e Celular."); return; } setIsLoading(true); try { const userDocRef = doc(db, "users", user.uid); await updateDoc(userDocRef, { fullName: editName.trim(), phone: editPhone.trim(), }); await refreshProfile(user.uid); setIsEditing(false); Alert.alert("Sucesso", "Perfil atualizado!"); } catch (error) { console.error("Erro atualizar perfil:", error); Alert.alert("Erro", "Não foi possível salvar as alterações."); } finally { setIsLoading(false); } };
  
  // Adiciona a pasta 'assets' no caminho
  const photoSource = profile?.photoURL ? { uri: profile.photoURL } : require('./assets/avatar-placeholder.png'); 

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.greeting}>Meu Perfil</Text>
      {isGuest || !user ? (
          <View style={styles.profileCard}><Text style={styles.profileName}>Visitante</Text><TouchableOpacity style={[styles.primaryButton, {marginTop: 20}]} onPress={onLogout}><Text style={styles.primaryButtonText}>Login/Cadastro</Text></TouchableOpacity></View>
      ) : (
        <View style={styles.profileCard}>
            <TouchableOpacity onPress={pickImage} disabled={isUploading}>
              <Image source={photoSource} style={styles.profilePhoto} onError={(e) => console.log("Erro carregando imagem:", e.nativeEvent.error)} key={profile?.photoURL || 'placeholder'} />
              <View style={styles.cameraIconOverlay}>{isUploading ? <ActivityIndicator size="small" color="#FFF"/> : <CameraIcon />}</View>
            </TouchableOpacity>
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
       <View style={{ height: 50 }} />
    </ScrollView>
  );
};
const TabBar = ({ activeTab, onTabPress }) => ( <View style={styles.tabBar}><TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('inicio')}><HomeIcon color={activeTab === 'inicio' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'inicio' ? '#A78B4F' : '#C0B49D' }]}>Início</Text></TouchableOpacity><TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('agendamentos')}><CalendarIcon color={activeTab === 'agendamentos' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'agendamentos' ? '#A78B4F' : '#C0B49D' }]}>Agendar</Text></TouchableOpacity><TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('explorar')}><SearchIcon color={activeTab === 'explorar' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'explorar' ? '#A78B4F' : '#C0B49D' }]}>Explorar</Text></TouchableOpacity><TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('perfil')}><UserIcon color={activeTab === 'perfil' ? "#A78B4F" : "#C0B49D"} /><Text style={[styles.tabLabel, { color: activeTab === 'perfil' ? '#A78B4F' : '#C0B49D' }]}>Perfil</Text></TouchableOpacity></View> );
const MainApp = ({ onNavigate, route, onLogout }) => { const initialTab = route?.params?.activeTab || 'inicio'; const [activeTab, setActiveTab] = useState(initialTab); const renderContent = () => { switch (activeTab) { case 'agendamentos': return <AgendamentosScreen onNavigate={onNavigate} />; case 'explorar': return <ExplorarScreen />; case 'perfil': return <PerfilScreen onLogout={onLogout} />; case 'inicio': default: return <HomeScreen onNavigateToAgendamentos={() => setActiveTab('agendamentos')} />; } }; return ( <View style={{ flex: 1, backgroundColor: '#FDF5F7' }}>{renderContent()}<TabBar activeTab={activeTab} onTabPress={setActiveTab} /></View> ); };

// --- O Roteador Principal ---
export default function App() {
 console.log("App.js: Componente App montado.");
 const [screen, setScreen] = useState('loading'); const [routeParams, setRouteParams] = useState({}); const [user, setUser] = useState(null); const [profile, setProfile] = useState(null); const [isGuest, setIsGuest] = useState(false); const [isLoadingAuth, setIsLoadingAuth] = useState(true);

 const refreshProfile = async (uid) => {
   if (!db || !uid) { console.log("RefreshProfile: DB ou UID faltando."); setProfile(null); return false; }
   console.log("RefreshProfile: Tentando buscar perfil para UID:", uid);
   try {
     const userDocRef = doc(db, "users", uid);
     const docSnap = await getDoc(userDocRef);
     if (docSnap.exists()) {
       console.log("RefreshProfile: Perfil encontrado:", docSnap.data());
       setProfile(docSnap.data());
       return true;
     } else {
       console.log("RefreshProfile: Nenhum perfil encontrado no Firestore para UID:", uid);
       setProfile(null);
       return false;
     }
   } catch (error) {
     console.error("RefreshProfile: Erro ao buscar Firestore:", error);
     setProfile(null);
     return false;
   }
 };

 useEffect(() => {
   console.log("App.js: useEffect principal iniciado.");
   if (firebaseInitializationError || !auth || !db) {
     console.warn("App: Auth ou DB não inicializado no useEffect! Firebase Config está correta?");
     if(firebaseInitializationError) {
         console.error("Erro de Inicialização:", firebaseInitializationError.message);
     }
     setIsLoadingAuth(false);
     setScreen('error'); // Tela de erro dedicada
     return;
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
         const hasProfile = await refreshProfile(currentUser.uid);
         if (hasProfile) {
           console.log("App: Perfil completo, navegando para mainApp");
           setScreen('mainApp');
         } else {
           console.log("App: Perfil incompleto, navegando para completeProfile");
           setScreen('completeProfile');
         }
       } catch (error) { console.error("App: Erro crítico dentro do onAuthStateChanged:", error); setUser(null); setProfile(null); setScreen('welcome'); }
     } else {
       console.log("App: Nenhum usuário logado detectado.");
       setUser(null); setProfile(null);
       if (!isGuest) { console.log("App: Não é visitante, navegando para welcome"); setScreen('welcome'); }
       else { console.log("App: É visitante, navegando para mainApp"); setScreen('mainApp'); }
     }
     setIsLoadingAuth(false);
     console.log("App: Fim do onAuthStateChanged. isLoadingAuth:", false);
   });
   return () => { console.log("App: Limpando onAuthStateChanged listener."); unsubscribe(); };
 }, [isGuest]);

 const handleNavigate = (newScreen, params = {}) => {
    console.log(`App: handleNavigate para: ${newScreen}, Guest: ${params.isGuest}`);
    if (params.isGuest) {
        if (auth && auth.currentUser) { console.log("App: Usuário estava logado, fazendo signOut antes de virar guest."); signOut(auth); }
        setIsGuest(true); setUser(null); setProfile(null); setScreen('mainApp');
    } else {
      if (['welcome', 'login', 'register'].includes(newScreen) && isGuest) { console.log("App: Saindo do modo Guest."); setIsGuest(false); }
      setRouteParams({ params }); setScreen(newScreen);
    }
 };
 const handleLogout = async () => { console.log("App: handleLogout iniciado..."); if (!auth) return; try { await signOut(auth); setIsGuest(false); /* onAuthStateChanged cuidará do resto */ } catch (error) { console.error("App: Erro no handleLogout:", error); } };

 const renderScreen = () => {
   console.log(`App: renderScreen chamado. isLoadingAuth: ${isLoadingAuth}, screen: ${screen}`);

   if (isLoadingAuth || screen === 'loading') {
     console.log("App: Renderizando Loading Screen");
     return <View style={styles.container}><ActivityIndicator size="large" color="#E6AAB7" /></View>;
   }
   
   // Tela de Erro se o Firebase falhar na inicialização (ex: API key errada)
   if (firebaseInitializationError || screen === 'error' || (!auth || !db)) {
       console.error("App: Renderizando Erro de Inicialização Firebase");
       return (
           <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={{color: 'red', textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Erro Crítico</Text>
                    <Text style={{color: 'red', textAlign: 'center', marginBottom: 10}}>Falha ao inicializar o Firebase.</Text>
                    <Text style={{color: 'red', textAlign: 'center', marginBottom: 40}}>Verifique se a `firebaseConfig` no App.js está correta e se sua rede está funcionando.</Text>
                    {/* Exibe o erro real para depuração */}
                    <Text style={{color: '#555', textAlign: 'center', fontSize: 12}}>Detalhes: {firebaseInitializationError?.message || 'auth/db nulos'}</Text>
                </View>
           </SafeAreaView>
       );
   }


   const props = { onNavigate: handleNavigate, route: routeParams };
   // Passa a função refreshProfile para o contexto
   const authContextValue = { user, profile, isGuest, refreshProfile };
   console.log(`App: Renderizando tela: ${screen}`);

   return (
     <SafeAreaView style={styles.safeArea}>
       <AuthContext.Provider value={authContextValue}>
         {screen === 'mainApp' && <MainApp {...props} onLogout={handleLogout} />}
         {screen === 'welcome' && <WelcomeScreen {...props} />}
         {screen === 'login' && <LoginScreen {...props} />}
         {screen === 'register' && <RegisterScreen {...props} />}
         {screen === 'completeProfile' && <CompleteProfileScreen {...props} />}
         {!['mainApp', 'welcome', 'login', 'register', 'completeProfile', 'loading', 'error'].includes(screen) &&
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
  page: { flex: 1, backgroundColor: '#FDF5F7', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 100 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#FDF5F7' },
  title: { fontFamily: "serif", fontSize: 42, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#8A74A8', textAlign: 'center', marginBottom: 40 },
  buttonContainer: { marginTop: 30, width: '100%', },
  primaryButton: { width: '100%', paddingVertical: 15, backgroundColor: '#E6AAB7', borderRadius: 25, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  primaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', },
  secondaryButton: { width: '100%', paddingVertical: 13, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 25, alignItems: 'center', marginBottom: 15 },
  secondaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37', },
  ghostButton: { width: '100%', paddingVertical: 13, alignItems: 'center', marginTop: 5 },
  ghostButtonText: { fontSize: 16, color: '#8A74A8', },
  welcomeBack: { fontSize: 24, fontWeight: 'bold', color: '#8A74A8', marginBottom: 30, alignSelf: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 15, marginBottom: 15, paddingHorizontal: 15, },
  input: { flex: 1, height: 50, fontSize: 16, color: '#333', marginLeft: 10, },
  // Home
  greeting: { fontSize: 32, fontWeight: 'bold', color: '#8A74A8', alignSelf: 'flex-start', marginBottom: 25, },
  promoCard: { width: '100%', height: 200, borderRadius: 20, justifyContent: 'flex-end', alignItems: 'flex-start', backgroundColor: '#DDD', overflow: 'hidden', marginBottom: 20 },
  promoImage: { width: '100%', height: '100%', position: 'absolute' },
  promoOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20, paddingVertical: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, width: '100%' },
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
  // Perfil
  profileCard: { width: '100%', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 30, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, },
  profilePhoto: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, backgroundColor: '#EEE' },
  cameraIconOverlay: { position: 'absolute', bottom: 15, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 15 },
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
  serviceCard: { width: '100%', height: 160, borderRadius: 20, marginBottom: 20, overflow: 'hidden', justifyContent: 'flex-end', },
  serviceImage: { width: '100%', height: '100%', position: 'absolute' },
  serviceTitleOverlay: { width: '100%', padding: 15, backgroundColor: 'rgba(0,0,0,0.4)'},
  serviceTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  proCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 10 },
  proPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#EEE' },
  proName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subServiceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  subServiceTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1, marginRight: 10 },
  subServiceButton: { fontSize: 14, fontWeight: 'bold', color: '#E6AAB7' },
  calendar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFF', borderRadius: 15, paddingVertical: 10, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  dateCell: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 10, width: 55 },
  dateCellSelected: { backgroundColor: '#E6AAB7' },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dateTextSelected: { color: '#FFF' },
  dateDay: { fontSize: 12, color: '#8A74A8' },
  dateDaySelected: { color: '#FFF' },
  timeSlotContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10, },
  timeSlot: { width: '31%', paddingVertical: 15, backgroundColor: '#FFF', borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  timeSlotText: { color: '#333', fontWeight: 'bold' },
  timeSlotBooked: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  timeSlotTextBooked: { color: '#AAA', textDecorationLine: 'line-through' },
  timeSlotSelected: { backgroundColor: '#E6AAB7', borderColor: '#E6AAB7' },
  timeSlotTextSelected: { color: '#FFF', fontWeight: 'bold' },
});

