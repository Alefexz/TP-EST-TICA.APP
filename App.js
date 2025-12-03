import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, Alert, ScrollView, Platform, FlatList, KeyboardAvoidingView, Modal, Linking, Share, Clipboard
} from 'react-native';

import { SafeAreaView, SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Font from 'expo-font';

// --- CONFIGURAÇÕES ---
import { auth, db } from './src/services/FirebaseConfig'; 
import { AuthProvider, useAuth } from './src/context/AuthContext'; 
import { processBookingTransaction, cancelBookingTransaction } from './src/services/bookingService';
import { processAIQuery } from './src/services/aiService'; 

// Firebase imports
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, updateDoc, addDoc, deleteDoc, getDocs,
  collection, query, where, onSnapshot, orderBy 
} from 'firebase/firestore';

import { styles } from './styles';

console.log(">>> App.js: Versão Estável v42.0 (Código Expandido) <<<");

// ====================================================================
// 🚨 SOLUÇÃO DEFINITIVA PARA ÍCONES QUADRADOS NA WEB 🚨
// ====================================================================
if (Platform.OS === 'web') {
  const fontId = 'feather-font-cdn';
  if (!document.getElementById(fontId)) {
    const style = document.createElement('style');
    style.id = fontId;
    style.type = 'text/css';
    const fontCss = `
      @font-face {
        font-family: 'Feather';
        src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.3/Fonts/Feather.ttf') format('truetype');
      }
    `;
    if (style.styleSheet) {
      style.styleSheet.cssText = fontCss;
    } else {
      style.appendChild(document.createTextNode(fontCss));
    }
    document.head.appendChild(style);
  }
}

// --- Ícones de Sistema ---
const BackIcon = () => <Feather name="chevron-left" size={28} color="#8A74A8" />;
const CloseIcon = () => <Feather name="x" size={24} color="#8A74A8" />;
const ChevronRight = () => <Feather name="chevron-right" size={20} color="#E6AAB7" />;

// --- HELPERS ---
const formatPhone = (text) => {
  if (!text) return "";
  let cleaned = ('' + text).replace(/\D/g, '');
  if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);
  if (cleaned.length > 10) return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  else if (cleaned.length > 6) return cleaned.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  else if (cleaned.length > 2) return cleaned.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  return cleaned;
};

const formatCPF = (text) => {
  if (!text) return "";
  let cleaned = ('' + text).replace(/\D/g, '');
  if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatDateBR = (dateString) => {
  if (!dateString) return 'Data inválida';
  const parts = dateString.split('-'); 
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// ====================================================================
// COMPONENTE: HEADER PROFISSIONAL
// ====================================================================
const ProfessionalHeader = ({ title, onMenuPress, onProfilePress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
      <Feather name="menu" size={28} color="#333" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <TouchableOpacity style={styles.profileHeaderButton} onPress={onProfilePress}>
       <Feather name="user" size={24} color="#FFF" />
    </TouchableOpacity>
  </View>
);

// ====================================================================
// COMPONENTE: ASSISTENTE VIRTUAL (BIA)
// ====================================================================
const AIAssistantScreen = ({ onClose }) => {
  const [messages, setMessages] = useState([{ id: 1, text: "Olá! Sou a Bia. Pergunte sobre preços, horários ou promoções!", sender: 'bot' }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    const responseText = await processAIQuery(userMsg.text);
    setIsTyping(false);
    const botMsg = { id: Date.now() + 1, text: responseText, sender: 'bot' };
    setMessages(prev => [...prev, botMsg]);
  };

  return (
    <Modal animationType="slide" transparent={false} visible={true} onRequestClose={onClose}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#FDF5F7'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: '#FFF'}}>
          <TouchableOpacity onPress={onClose} style={{padding: 5}}><CloseIcon /></TouchableOpacity>
          <View style={{marginLeft: 15, flexDirection: 'row', alignItems: 'center'}}>
            <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6AAB7', alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
              <Feather name="message-circle" size={24} color="#FFF" />
            </View>
            <View><Text style={{fontWeight: 'bold', fontSize: 16, color: '#333'}}>Bia (Assistente)</Text><Text style={{fontSize: 12, color: '#22c55e'}}>● Online</Text></View>
          </View>
        </View>
        <FlatList ref={flatListRef} data={messages} keyExtractor={item => item.id.toString()} onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: true})} contentContainerStyle={{padding: 15}} renderItem={({item}) => ( <View style={{alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: item.sender === 'user' ? '#E6AAB7' : '#FFF', padding: 12, borderRadius: 15, marginBottom: 10, maxWidth: '80%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1}}><Text style={{color: item.sender === 'user' ? '#FFF' : '#333', fontSize: 15}}>{item.text}</Text></View> )} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
          <View style={{flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE'}}>
            <TextInput style={{flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 12, marginHorizontal: 5, fontSize: 16, outlineStyle: 'none'}} placeholder="Digite sua dúvida..." value={inputText} onChangeText={setInputText} onSubmitEditing={handleSend} />
            <TouchableOpacity onPress={handleSend} style={{padding: 12, backgroundColor: '#E6AAB7', borderRadius: 25}}><Feather name="send" size={20} color="#FFF" /></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// ====================================================================
// TELAS DE AUTENTICAÇÃO
// ====================================================================

const WelcomeScreen = ({ onNavigate, setIsGuest }) => ( 
  <View style={styles.container}>
    <View style={{alignItems: 'center', marginBottom: 30}}>
      <View style={{width: 80, height: 80, backgroundColor: '#E6AAB7', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 15, shadowColor: '#E6AAB7', shadowOpacity: 0.4, shadowRadius: 10}}>
        <Feather name="check" size={50} color="#FFF" />
      </View>
      <Text style={styles.welcomeTitle}>Agenda Fácil</Text>
      <Text style={styles.welcomeSubtitle}>O App dos Profissionais de Beleza</Text>
    </View>

    <View style={styles.buttonContainer}>
      <View style={{backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2}}>
        <Text style={{fontWeight: 'bold', fontSize: 16, color: '#333', marginBottom: 5}}>Para Profissionais 💼</Text>
        <Text style={{color: '#666', marginBottom: 15, fontSize: 13}}>Crie seu link de agendamento grátis.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => onNavigate('proRegister')}>
          <Text style={styles.primaryButtonText}>Criar Meu Estúdio Grátis</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('proLogin')} style={{marginTop: 15, alignSelf: 'center'}}>
          <Text style={{color: '#8A74A8', fontWeight: 'bold'}}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.ghostButton} onPress={() => onNavigate('login')}>
        <Text style={styles.ghostButtonText}>Sou Cliente (Entrar)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={{marginTop: 15, alignSelf: 'center'}} onPress={() => setIsGuest(true)}>
        <Text style={{color: '#999'}}>Entrar como Visitante</Text>
      </TouchableOpacity>
    </View>
  </View> 
);

const LoginScreen = ({ onNavigate }) => { 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleLogin = async () => { 
    setErrorMessage('');
    if (email === '' || password === '') { setErrorMessage("Preencha e-mail e senha."); return; } 
    setIsLoading(true); 
    try { 
        await signInWithEmailAndPassword(auth, email.trim(), password); 
    } catch (error) { 
        setIsLoading(false); 
        if(error.code === 'auth/invalid-credential') setErrorMessage("E-mail ou senha incorretos."); else setErrorMessage("Erro ao entrar."); 
    } finally { setIsLoading(false); } 
  }; 
  
  return ( 
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('welcome')}><BackIcon/></TouchableOpacity>
      <Text style={styles.authTitle}>Login Cliente</Text>
      {errorMessage ? <View style={{backgroundColor:'#ffebee', padding:10, borderRadius:8, marginBottom:10, width:'100%'}}><Text style={{color:'#c62828', textAlign:'center'}}>{errorMessage}</Text></View> : null}
      <View style={styles.inputContainer}><Feather name="mail" size={20} color="#8A74A8" /><TextInput style={styles.input} placeholder="Digite seu e-mail" placeholderTextColor="#999" value={email} onChangeText={setEmail} autoCapitalize="none" /></View>
      <View style={styles.inputContainer}><Feather name="lock" size={20} color="#8A74A8" /><TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#8A74A8" /></TouchableOpacity></View>
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}</TouchableOpacity>
    </View> 
  ); 
};

const RegisterScreen = ({ onNavigate }) => { 
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', fullName: '', phone: '', cpf: '' });
  const [isLoading, setIsLoading] = useState(false); 
  const [errorMsg, setErrorMsg] = useState('');
  const { refreshProfile } = useAuth();
  
  const updateForm = (key, value) => { setFormData({...formData, [key]: value}); setErrorMsg(''); };

  const handleNextStep = () => {
    if (!formData.email.includes('@')) { setErrorMsg("E-mail inválido."); return; }
    if (formData.password.length < 6) { setErrorMsg("Senha muito curta (mín. 6)."); return; }
    if (formData.password !== formData.confirmPassword) { setErrorMsg("Senhas não conferem."); return; }
    setStep(2);
  };

  const handleFinalize = async () => { 
    if (formData.fullName.length < 3) { setErrorMsg("Nome incompleto."); return; }
    if (formData.phone.length < 8) { setErrorMsg("Telefone inválido."); return; }
    if (formData.cpf.length < 11) { setErrorMsg("CPF inválido."); return; }
    
    setIsLoading(true); 
    try { 
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password); 
      await setDoc(doc(db, "users", userCredential.user.uid), { 
        fullName: formData.fullName.trim(), 
        phone: formData.phone.trim(), 
        cpf: formData.cpf.trim(), 
        email: formData.email.trim(), 
        role: 'client', 
        fictionalBalance: 500.00 
      });
      if (refreshProfile) await refreshProfile(userCredential.user.uid);
    } catch (error) { 
      setIsLoading(false); 
      setErrorMsg(error.message); 
    } 
  }; 
  
  return ( 
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => step === 1 ? onNavigate('welcome') : setStep(1)}>
        <BackIcon />
      </TouchableOpacity>
      <Text style={styles.authTitle}>Criar Conta</Text>
      {errorMsg ? <View style={{backgroundColor:'#ffebee', padding:10, borderRadius:8, marginBottom:10, width:'100%'}}><Text style={{color:'#c62828', textAlign:'center', fontWeight:'bold'}}>{errorMsg}</Text></View> : null}
      <View style={{flexDirection: 'row', width: '100%', height: 4, backgroundColor: '#EEE', marginBottom: 30, borderRadius: 2}}><View style={{width: step === 1 ? '50%' : '100%', backgroundColor: '#E6AAB7', height: '100%', borderRadius: 2}} /></View>
      {step === 1 ? (
        <View style={{width: '100%'}}><Text style={[styles.authSubtitle, {alignSelf: 'flex-start'}]}>Passo 1: Acesso</Text><View style={styles.inputContainer}><Feather name="mail" size={20} color="#8A74A8" /><TextInput style={styles.input} placeholder="Digite seu e-mail aqui" placeholderTextColor="#999" value={formData.email} onChangeText={(t)=>updateForm('email', t)} autoCapitalize="none" /></View><View style={styles.inputContainer}><Feather name="lock" size={20} color="#8A74A8" /><TextInput style={styles.input} placeholder="Crie uma senha segura" placeholderTextColor="#999" value={formData.password} onChangeText={(t)=>updateForm('password', t)} secureTextEntry /></View><View style={styles.inputContainer}><Feather name="lock" size={20} color="#8A74A8" /><TextInput style={styles.input} placeholder="Digite a senha novamente" placeholderTextColor="#999" value={formData.confirmPassword} onChangeText={(t)=>updateForm('confirmPassword', t)} secureTextEntry /></View><TouchableOpacity style={styles.primaryButton} onPress={handleNextStep}><Text style={styles.primaryButtonText}>Continuar</Text></TouchableOpacity></View>
      ) : (
        <View style={{width: '100%'}}><Text style={[styles.authSubtitle, {alignSelf: 'flex-start'}]}>Passo 2: Sobre Você</Text><View style={styles.inputContainer}><Feather name="user" size={20} color="#8A74A8" /><TextInput style={styles.input} placeholder="Digite seu nome completo" placeholderTextColor="#999" value={formData.fullName} onChangeText={(t)=>updateForm('fullName', t)} /></View><View style={styles.inputContainer}><Feather name="smartphone" size={20} color="#8A74A8" /><TextInput style={styles.input} placeholder="Digite seu celular (com DDD)" placeholderTextColor="#999" value={formData.phone} onChangeText={(t)=>updateForm('phone', formatPhone(t))} keyboardType="phone-pad" /></View><View style={styles.inputContainer}><Feather name="file-text" size={20} color="#8A74A8" /><TextInput style={styles.input} placeholder="Digite seu CPF" placeholderTextColor="#999" value={formData.cpf} onChangeText={(t)=>updateForm('cpf', formatCPF(t))} keyboardType="numeric" /></View><TouchableOpacity style={styles.primaryButton} onPress={handleFinalize} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Finalizar Cadastro</Text>}</TouchableOpacity></View>
      )}
    </View> 
  ); 
};

const CompleteProfileScreen = ({ onNavigate }) => ( <View style={styles.container}><ActivityIndicator size="large" color="#E6AAB7" /><Text style={{marginTop: 20, color: '#8A74A8', textAlign: 'center'}}>Estamos preparando seu perfil...</Text><TouchableOpacity onPress={() => signOut(auth)} style={{marginTop: 30, padding: 10}}><Text style={{color: '#ef4444', fontWeight: 'bold'}}>Sair / Cancelar</Text></TouchableOpacity></View> );

const ProfessionalLoginScreen = ({ onNavigate }) => { 
  const [e,sE]=useState('');
  const [p,sP]=useState('');
  const handle=async()=>{
    try{await signInWithEmailAndPassword(auth,e,p);}catch(er){Alert.alert("Erro","Login inválido");}
  }; 
  return(
    <View style={styles.container}>
      <Text style={styles.authTitle}>Acesso Pro</Text>
      <View style={styles.inputContainer}><Feather name="mail" size={20} color="#8A74A8"/><TextInput style={styles.input} value={e} onChangeText={sE} placeholder="Digite o e-mail profissional" placeholderTextColor="#999"/></View>
      <View style={styles.inputContainer}><Feather name="lock" size={20} color="#8A74A8"/><TextInput style={styles.input} value={p} onChangeText={sP} secureTextEntry placeholder="Digite a senha" placeholderTextColor="#999"/></View>
      <TouchableOpacity style={styles.proButton} onPress={handle}><Text style={styles.proButtonText}>Entrar</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>onNavigate('welcome')} style={{marginTop:20}}><Text>Voltar</Text></TouchableOpacity>
    </View>
  ); 
};

const OnboardingModal = ({ visible, link, onClose }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.onboardingModal}>
      <View style={styles.onboardingCard}>
        <Feather name="check-circle" size={60} color="#22c55e" style={{marginBottom: 20}} />
        <Text style={styles.onboardingTitle}>Estúdio Criado!</Text>
        <Text style={styles.onboardingText}>Seu link exclusivo está pronto. Compartilhe com seus clientes para eles agendarem sozinhos.</Text>
        <View style={styles.linkBox}><Text style={styles.linkText}>{link}</Text></View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => { 
            Clipboard.setString(link); 
            Alert.alert("Copiado!", "Link copiado para a área de transferência.");
        }}>
           <Text style={styles.primaryButtonText}>Copiar Link</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}><Text style={{color: '#888', marginTop: 10}}>Entrar no Painel</Text></TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const ProfessionalRegisterScreen = ({onNavigate}) => { 
  const [f,sF]=useState('');const [e,sE]=useState('');const [p,sP]=useState('');
  const [showModal, setShowModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  
  const handle=async()=>{
      if(!f || !e || !p) return Alert.alert("Atenção", "Preencha todos os campos.");
      try{
          const u=await createUserWithEmailAndPassword(auth,e,p);
          await setDoc(doc(db,"users",u.user.uid),{fullName:f,email:e,role:'professional',fictionalBalance:0, plan:'free'});
          const link = `agendafacil.app/${f.replace(/\s+/g, '-').toLowerCase()}`;
          setGeneratedLink(link);
          setShowModal(true);
      }catch(er){Alert.alert("Erro",er.message);}
  }; 
  
  return(
    <View style={styles.container}>
      <Text style={styles.authTitle}>Criar Estúdio</Text>
      <Text style={{textAlign:'center', marginBottom:20, color:'#666'}}>Comece seu teste grátis agora.</Text>
      <View style={styles.inputContainer}><TextInput style={styles.input} value={f} onChangeText={sF} placeholder="Nome do Estúdio/Profissional"/></View>
      <View style={styles.inputContainer}><TextInput style={styles.input} value={e} onChangeText={sE} placeholder="Email"/></View>
      <View style={styles.inputContainer}><TextInput style={styles.input} value={p} onChangeText={sP} placeholder="Crie uma senha" secureTextEntry/></View>
      <TouchableOpacity style={styles.proButton} onPress={handle}><Text style={styles.proButtonText}>Criar Conta Grátis</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>onNavigate('welcome')} style={{marginTop:20}}><Text>Voltar</Text></TouchableOpacity>
      <OnboardingModal visible={showModal} link={generatedLink} onClose={() => {setShowModal(false); onNavigate('proLogin');}} />
    </View>
  ); 
};

// --- TELAS PROFISSIONAIS ---

const CouponManagementScreen = ({onNavigate}) => { 
  const [c,sC]=useState('');const [d,sD]=useState('');const [l,sL]=useState([]);
  useEffect(()=>{const q=query(collection(db,"coupons"));const u=onSnapshot(q,(s)=>sL(s.docs.map(i=>({id:i.id,...i.data()}))));return()=>u();},[]);
  const add=async()=>{if(c&&d){try{await addDoc(collection(db,"coupons"),{code:c.toUpperCase(),discount:parseFloat(d)});sC('');sD('');Alert.alert("Sucesso!");}catch(e){Alert.alert("Erro");}}};
  return(<ScrollView style={styles.page}><TouchableOpacity onPress={()=>onNavigate('proMenu')}><BackIcon/><Text style={styles.backButtonText}>Menu</Text></TouchableOpacity><Text style={styles.proDashboardTitle}>Cupons</Text><View style={styles.profileCard}><Text style={styles.proSectionTitle}>Novo</Text><View style={styles.inputContainerInline}><TextInput style={styles.inputInline} value={c} onChangeText={sC} placeholder="Código (Ex: PROMO10)"/></View><View style={styles.inputContainerInline}><TextInput style={styles.inputInline} value={d} onChangeText={sD} placeholder="Desconto (%)" keyboardType="numeric"/></View><TouchableOpacity style={[styles.primaryButton,{marginTop:10}]} onPress={add}><Text style={styles.primaryButtonText}>Criar</Text></TouchableOpacity></View>{l.map(i=><View key={i.id} style={styles.serviceListItem}><View><Text style={styles.serviceTitleClean}>{i.code}</Text><Text style={styles.servicePriceClean}>{i.discount}% OFF</Text></View><TouchableOpacity onPress={()=>deleteDoc(doc(db,"coupons",i.id))}><Feather name="trash-2" size={20} color="red"/></TouchableOpacity></View>)}</ScrollView>); 
};

const ProfessionalAgendaScreen = ({ onNavigate }) => {
  const { user } = useAuth(); const [bookings, setBookings] = useState([]);
  useEffect(() => { if(!user) return; const q = query(collection(db, "agendamentos"), where("professionalId", "==", user.uid), orderBy("date", "asc")); const unsub = onSnapshot(q, (snap) => setBookings(snap.docs.map(d=>({id:d.id, ...d.data()})))); return () => unsub(); }, [user]);
  
  const upcoming = bookings.filter(b => b.status === 'confirmado');
  const todayCount = upcoming.filter(b => b.date === new Date().toISOString().split('T')[0]).length;

  return ( 
    <View style={styles.page}>
      <ProfessionalHeader 
        title="Agenda" 
        onMenuPress={() => onNavigate('proMenu')} 
        onProfilePress={() => onNavigate('proProfile')} 
      />
      
      <View style={styles.agendaSummary}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Feather name="sun" size={24} color="#FFF" />
          <Text style={[styles.agendaSummaryText, {marginLeft:10}]}>Hoje: {todayCount} atendimentos</Text>
        </View>
      </View>

      <Text style={styles.proSectionTitle}>Próximos Horários</Text>
      
      <FlatList 
        data={upcoming} 
        keyExtractor={item => item.id} 
        ListEmptyComponent={<View style={{alignItems: 'center', marginTop: 50}}><Feather name="smile" size={48} color="#DDD" /><Text style={{color: '#999', marginTop: 10}}>Agenda livre por enquanto.</Text></View>}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => onNavigate('bookingDetail', {booking: item, userType: 'professional'})}>
            <View style={styles.agendaCard}>
              <View style={styles.agendaCardContent}>
                <Text style={styles.agendaCardTitle}>{item.serviceTitle || item.service}</Text>
                <Text style={styles.agendaCardDateTime}>{formatDateBR(item.date)} às {item.time}</Text>
              </View>
              <Feather name="chevron-right" size={24} color="#DDD" />
            </View>
          </TouchableOpacity>
        )} 
      />
    </View> 
  );
};

const ProfessionalMenuScreen = ({ onNavigate, onLogout }) => (
  <ScrollView style={styles.page}>
    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('mainApp_pro')}>
      <BackIcon /><Text style={styles.backButtonText}>Voltar</Text>
    </TouchableOpacity>
    <Text style={styles.proDashboardTitle}>Menu</Text>
    
    <TouchableOpacity style={styles.profileCard} onPress={() => onNavigate('proHistory')}>
      <Feather name="file-text" size={24} color="#8A74A8" />
      <Text style={styles.proSectionTitle}>Histórico Completo</Text>
    </TouchableOpacity>
    
    <TouchableOpacity style={[styles.profileCard, {marginTop: 20}]} onPress={() => onNavigate('serviceManagement')}>
      <Feather name="settings" size={24} color="#8A74A8" />
      <Text style={styles.proSectionTitle}>Gerenciar Serviços</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.profileCard, {marginTop: 20}]} onPress={() => onNavigate('couponManagement')}>
      <Feather name="tag" size={24} color="#E6AAB7" />
      <Text style={styles.proSectionTitle}>Cupons de Desconto</Text>
    </TouchableOpacity>
    
    <View style={{marginTop: 20, borderTopWidth: 1, borderColor: '#EEE', paddingTop: 20}}>
        <Text style={{color: '#999', marginBottom: 10, fontWeight: 'bold'}}>CONFIGURAÇÕES</Text>
        <TouchableOpacity style={styles.profileCard} onPress={() => onNavigate('paymentSettings')}>
            <Feather name="credit-card" size={24} color="#22c55e" />
            <Text style={styles.proSectionTitle}>Recebimento (Pix/Cartão)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.profileCard, {marginTop: 15}]} onPress={() => onNavigate('plans')}>
            <Feather name="star" size={24} color="#D4AF37" />
            <Text style={styles.proSectionTitle}>Planos & Assinatura</Text>
        </TouchableOpacity>
    </View>
    <View style={{height: 40}}/>
  </ScrollView>
);

const ProfessionalProfileScreen = ({ onNavigate, onLogout }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.fullName || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');

  useEffect(() => { setEditName(profile?.fullName || ''); setEditPhone(profile?.phone || ''); }, [profile]);

  const handleSave = async () => {
    if (!editName.trim()) return Alert.alert("Erro", "O nome não pode ficar vazio.");
    try {
      await updateDoc(doc(db, "users", user.uid), { fullName: editName, phone: editPhone });
      await refreshProfile(user.uid);
      setIsEditing(false);
      Alert.alert("Sucesso", "Dados atualizados!");
    } catch (e) { Alert.alert("Erro", "Não foi possível salvar."); }
  };

  return (
    <ScrollView style={styles.page}>
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('mainApp_pro')}>
         <BackIcon /><Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.proDashboardTitle}>Meu Perfil</Text>
      
      <View style={styles.profileCard}>
         <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEE', marginBottom: 10, alignItems:'center', justifyContent:'center'}}>
            <Feather name="user" size={40} color="#DDD" />
         </View>
         
         {isEditing ? (
           <View style={{width: '100%'}}>
             <View style={styles.inputContainerInline}>
                <Feather name="user" size={20} color="#8A74A8" />
                <TextInput style={styles.inputInline} value={editName} onChangeText={setEditName} placeholder="Seu Nome" />
             </View>
             <View style={styles.inputContainerInline}>
                <Feather name="smartphone" size={20} color="#8A74A8" />
                <TextInput style={styles.inputInline} value={editPhone} onChangeText={(t)=>setEditPhone(formatPhone(t))} placeholder="Seu Telefone/Pix" keyboardType="phone-pad" />
             </View>
             <TouchableOpacity style={[styles.primaryButton, {marginTop: 20}]} onPress={handleSave}><Text style={styles.primaryButtonText}>Salvar</Text></TouchableOpacity>
             <TouchableOpacity style={styles.ghostButton} onPress={() => setIsEditing(false)}><Text style={{color: '#8A74A8'}}>Cancelar</Text></TouchableOpacity>
           </View>
         ) : (
           <>
             <Text style={styles.profileName}>{profile?.fullName}</Text>
             <Text style={styles.profileEmail}>{user?.email}</Text>
             <Text style={styles.profilePhone}>{profile?.phone || 'Sem telefone cadastrado'}</Text>
             
             <TouchableOpacity style={[styles.editButton, {marginTop: 20}]} onPress={() => setIsEditing(true)}>
               <Text style={styles.editButtonText}>Editar Meus Dados</Text>
             </TouchableOpacity>
           </>
         )}
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Feather name="log-out" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ProfessionalDashboardScreen = () => {
  const { user } = useAuth(); const [bookings, setBookings] = useState([]);
  useEffect(() => { if(!user) return; const q = query(collection(db, "agendamentos"), where("professionalId", "==", user.uid)); const unsub = onSnapshot(q, (snap) => setBookings(snap.docs.map(d=>d.data()))); return () => unsub(); }, [user]);
  
  const confirmed = bookings.filter(b => b.status === 'confirmado');
  const totalReceber = confirmed.reduce((acc, b) => acc + b.price, 0);
  const completed = bookings.filter(b => b.status === 'concluido');
  const totalGanho = completed.reduce((acc, b) => acc + b.price, 0);
  const weeklyData = [30, 50, 80, 20, 100, 60, 40]; 

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.proDashboardTitle}>Financeiro</Text>
      
      <View style={styles.dashboardCard}>
        <Text style={styles.statLabel}>TOTAL A RECEBER (Próximos)</Text>
        <Text style={[styles.statValue, {color: '#E6AAB7', fontSize: 32}]}>R$ {totalReceber.toFixed(2)}</Text>
      </View>

      <View style={styles.dashboardRow}>
        <View style={styles.statCard}>
           <Feather name="check-circle" size={24} color="#22c55e" />
           <Text style={styles.statValue}>{completed.length}</Text>
           <Text style={styles.statLabel}>Atendidos</Text>
        </View>
        <View style={styles.statCard}>
           <Feather name="dollar-sign" size={24} color="#8A74A8" />
           <Text style={styles.statValue}>R$ {totalGanho}</Text>
           <Text style={styles.statLabel}>Recebido</Text>
        </View>
      </View>

      <Text style={styles.proSectionTitle}>Movimento Semanal</Text>
      <View style={[styles.dashboardCard, styles.chartContainer]}>
        {['D','S','T','Q','Q','S','S'].map((day, i) => (
          <View key={i} style={styles.chartBarWrapper}>
            <View style={[styles.chartBar, {height: weeklyData[i]}]} />
            <Text style={styles.chartLabel}>{day}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const ProfessionalHistoryScreen = ({ onNavigate }) => {
  const { user } = useAuth(); const [history, setHistory] = useState([]);
  useEffect(() => { if(!user) return; const q = query(collection(db, "agendamentos"), where("professionalId", "==", user.uid), orderBy("date", "desc")); const unsub = onSnapshot(q, (snap) => setHistory(snap.docs.map(d=>d.data()).filter(d=>d.status!=='confirmado'))); return () => unsub(); }, [user]);
  return ( <View style={styles.page}><TouchableOpacity style={styles.backButton} onPress={() => onNavigate('proMenu')}><BackIcon /><Text style={styles.backButtonText}>Voltar</Text></TouchableOpacity><Text style={styles.proDashboardTitle}>Histórico</Text><FlatList data={history} renderItem={({item}) => <View style={styles.historyCard}><Text style={styles.serviceTitleClean}>{item.serviceTitle}</Text><Text>{item.status.toUpperCase()}</Text></View>} /></View> );
};

const BookingDetailScreen = ({ onNavigate, route }) => { 
  const { booking, userType } = route.params; 
  const [clientData, setClientData] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [fetchingClient, setFetchingClient] = useState(false);
  const { user } = useAuth(); 

  useEffect(() => {
      if (userType === 'professional' && booking.clientId) {
          setFetchingClient(true);
          const fetchClient = async () => {
              try {
                  const userDoc = await getDoc(doc(db, "users", booking.clientId));
                  if (userDoc.exists()) setClientData(userDoc.data());
              } catch (error) { console.error(error); } finally { setFetchingClient(false); }
          };
          fetchClient();
      }
  }, [booking]);

  const handleCancel = async () => {
    Alert.alert("Cancelar Agendamento", "Tem certeza? O valor será estornado.", [
      { text: "Não", style: "cancel" },
      { 
        text: "Sim, Cancelar", 
        onPress: async () => {
          setLoading(true);
          const res = await cancelBookingTransaction(booking.id, user.uid, booking.price);
          setLoading(false);
          if (res.success) {
            Alert.alert("Cancelado", "Agendamento cancelado e valor reembolsado.");
            onNavigate('mainApp_client', {activeTab: 'meusAgendamentos'});
          } else {
            Alert.alert("Erro", "Não foi possível cancelar.");
          }
        }
      }
    ]);
  };

  const handleComplete = async () => { setLoading(true); try { await updateDoc(doc(db, "agendamentos", booking.id), { status: 'concluido' }); Alert.alert("Sucesso!"); onNavigate('mainApp_pro'); } catch(e){console.error(e);} setLoading(false); };
  
  const openWhatsapp = () => {
    const phone = clientData?.phone || booking.clientPhone;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${cleanPhone}`);
    } else {
      Alert.alert("Erro", "Telefone não disponível.");
    }
  };

  return ( 
    <ScrollView style={styles.page}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate(userType === 'client' ? 'mainApp_client' : 'mainApp_pro')}><BackIcon /><Text style={styles.backButtonText}>Voltar</Text></TouchableOpacity>
        <Text style={styles.agendaGreeting}>{booking.serviceTitle}</Text>
        
        <View style={styles.profileCard}>
            <Text style={styles.summaryText}><Text style={{fontWeight:'bold'}}>Cliente:</Text> {clientData?.fullName || booking.clientName}</Text>
            
            {userType === 'professional' && (
                <>
                     <Text style={styles.summaryText}><Text style={{fontWeight:'bold'}}>CPF:</Text> {clientData?.cpf || booking.clientCpf || 'Não informado'}</Text>
                     <Text style={styles.summaryText}><Text style={{fontWeight:'bold'}}>WhatsApp:</Text> {clientData?.phone || booking.clientPhone || 'Não informado'}</Text>
                     
                     <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsapp}>
                        <Feather name="message-circle" size={20} color="#FFF" style={{marginRight: 10}} />
                        <Text style={styles.whatsappButtonText}>Chamar no WhatsApp</Text>
                     </TouchableOpacity>

                     <Text style={[styles.proSectionTitle, {fontSize:16, marginTop:20}]}>Anotações do Prontuário</Text>
                     <TextInput style={{backgroundColor:'#F5F5F5', width:'100%', height:80, borderRadius:10, padding:10, textAlignVertical:'top'}} multiline placeholder="Escreva observações sobre o atendimento..." />
                </>
            )}

            <Text style={[styles.summaryText, {marginTop: 20}]}><Text style={{fontWeight:'bold'}}>Data:</Text> {formatDateBR(booking.date)} às {booking.time}</Text>
            <Text style={styles.summaryText}><Text style={{fontWeight:'bold'}}>Status:</Text> {booking.status}</Text>
            
            {userType === 'professional' && booking.status === 'confirmado' && <TouchableOpacity style={styles.successButton} onPress={handleComplete} disabled={loading}>{loading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.successButtonText}>✓ Concluir Atendimento</Text>}</TouchableOpacity>}

            {userType === 'client' && booking.status === 'confirmado' && (
              <TouchableOpacity 
                style={[styles.primaryButton, {backgroundColor: '#ef4444', marginTop: 20}]} 
                onPress={handleCancel} 
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.primaryButtonText}>Cancelar Agendamento</Text>}
              </TouchableOpacity>
            )}
        </View>
    </ScrollView> 
  );
};

const ServiceManagementScreen = ({ onNavigate }) => {
  const [servicesData, setServicesData] = useState([]); const [isLoading, setIsLoading] = useState(true); const [editingService, setEditingService] = useState(null); const [newPrice, setNewPrice] = useState(''); const [expandedCategory, setExpandedCategory] = useState(null);
  useEffect(() => { const q = query(collection(db, "services")); const unsubscribe = onSnapshot(q, (snap) => { setServicesData(snap.docs.map(d=>({id:d.id, ...d.data()}))); setIsLoading(false); }); return () => unsubscribe(); }, []);
  const handleEditClick = (s, sub) => { setEditingService({ serviceId: s.id, title: sub ? sub.title : s.title }); setNewPrice(sub ? sub.price.toString() : s.price.toString()); };
  const handleSavePrice = async () => { 
    if (!editingService) return; const price = parseFloat(newPrice);
    const serviceRef = doc(db, "services", editingService.serviceId); const serviceSnap = await getDoc(serviceRef); const data = serviceSnap.data();
    if (data.subservices && data.subservices.find(s => s.title === editingService.title)) {
       const updated = data.subservices.map(sub => sub.title === editingService.title ? { ...sub, price } : sub);
       await updateDoc(serviceRef, { subservices: updated });
    } else { await updateDoc(serviceRef, { price }); }
    Alert.alert("Atualizado", "Preço alterado com sucesso!"); setEditingService(null);
  };
  
  const renderServiceEditor = (service, sub) => {
    const isEditingThis = editingService && editingService.title === (sub ? sub.title : service.title);
    return ( 
      <View key={sub ? sub.title : service.id} style={styles.serviceListItem}>
        {isEditingThis ? (
            <View style={{width:'100%'}}>
                <Text style={styles.serviceTitleClean}>{sub?sub.title:service.title}</Text>
                <TextInput style={styles.inputInline} value={newPrice} onChangeText={setNewPrice} keyboardType="numeric"/>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSavePrice}><Text style={styles.primaryButtonText}>Salvar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.ghostButton} onPress={()=>setEditingService(null)}><Text style={{color:'#8A74A8'}}>Cancelar</Text></TouchableOpacity>
            </View>
        ) : (
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                <View>
                    <Text style={styles.serviceTitleClean}>{sub?sub.title:service.title}</Text>
                    <Text style={styles.servicePriceClean}>R$ {sub?sub.price.toFixed(2):service.price.toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={()=>handleEditClick(service,sub)}><Text style={styles.editButtonText}>Editar</Text></TouchableOpacity>
            </View>
        )}
      </View> 
    );
  };
  
  return ( <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 120 }}><TouchableOpacity style={styles.backButton} onPress={() => onNavigate('proMenu')}><BackIcon /><Text style={styles.backButtonText}>Menu</Text></TouchableOpacity><Text style={styles.proDashboardTitle}>Tabela de Preços</Text>{isLoading ? <ActivityIndicator /> : servicesData.map(s => ( <View key={s.id} style={{marginBottom:15}}><TouchableOpacity style={[styles.profileCard, {alignItems:'flex-start', padding:20, marginTop:0}]} onPress={()=>setExpandedCategory(expandedCategory===s.id?null:s.id)}><Text style={styles.proSectionTitle}>{s.title}</Text></TouchableOpacity>{expandedCategory===s.id && <View style={styles.serviceEditorContainer}>{(!s.subservices || s.subservices.length===0) && renderServiceEditor(s,null)}{s.subservices && s.subservices.map(sub => renderServiceEditor(s,sub))}</View>}</View> ))}</ScrollView> );
};

const PlansScreen = ({ onNavigate }) => {
  const PlanCard = ({ title, price, features, color, recommended, btnText }) => (
    <View style={[styles.planCard, recommended && styles.planCardRecommended, { borderColor: color }]}>
      {recommended && <View style={[styles.planBadge, { backgroundColor: color }]}><Text style={styles.planBadgeText}>MAIS VENDIDO</Text></View>}
      <Text style={[styles.planTitle, { color: color }]}>{title}</Text>
      <Text style={styles.planPrice}>{price}<Text style={{fontSize:14, fontWeight:'normal'}}>/mês</Text></Text>
      {features.map((f, i) => (<View key={i} style={styles.planFeatureRow}><Feather name="check" size={18} color="green"/><Text style={styles.planFeatureText}>{f}</Text></View>))}
      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: color, marginTop: 15, marginBottom:0 }]} onPress={() => Alert.alert("Em breve", "Integração de pagamento em desenvolvimento.")}>
        <Text style={styles.primaryButtonText}>{btnText}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.page}>
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('proMenu')}><BackIcon /><Text style={styles.backButtonText}>Menu</Text></TouchableOpacity>
      <Text style={styles.proDashboardTitle}>Assinatura</Text>
      <PlanCard title="GRÁTIS" price="R$ 0" color="#888" btnText="Plano Atual" features={["Agenda Digital", "Link Básico", "Até 20 clientes/mês"]} />
      <PlanCard title="PROFISSIONAL" price="R$ 29,90" color="#8A74A8" recommended={true} btnText="Assinar Agora" features={["Clientes Ilimitados", "Galeria de Fotos", "Relatório Financeiro", "Botão WhatsApp"]} />
      <PlanCard title="PREMIUM" price="R$ 59,90" color="#D4AF37" btnText="Ser Elite" features={["Tudo do Profissional", "Sua Logo no App", "Lembretes Automáticos", "Receber Online"]} />
      <View style={{height: 40}}/>
    </ScrollView>
  );
};

const PaymentSettingsScreen = ({ onNavigate }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [pix, setPix] = useState('');
  const [link, setLink] = useState('');
  useEffect(() => { if (profile) { setPix(profile.pixKey || ''); setLink(profile.paymentLink || ''); } }, [profile]);
  const handleSave = async () => { try { await updateDoc(doc(db, "users", user.uid), { pixKey: pix, paymentLink: link }); await refreshProfile(user.uid); Alert.alert("Sucesso", "Configurações salvas!"); } catch (e) { Alert.alert("Erro", "Falha ao salvar."); } };
  return (
    <ScrollView style={styles.page}>
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('proMenu')}><BackIcon /><Text style={styles.backButtonText}>Menu</Text></TouchableOpacity>
      <Text style={styles.proDashboardTitle}>Recebimento</Text>
      <View style={styles.profileCard}>
         <Text style={styles.proSectionTitle}>Configurar Pix e Cartão</Text>
         <Text style={{color:'#666', marginBottom:20, textAlign:'center'}}>Esses dados aparecerão para o cliente na hora de pagar.</Text>
         <Text style={styles.statLabel}>Sua Chave Pix</Text>
         <TextInput style={styles.inputInline} value={pix} onChangeText={setPix} placeholder="CPF, Email ou Telefone" />
         <Text style={styles.statLabel}>Seu Link de Cartão (Mercado Pago/SumUp)</Text>
         <TextInput style={styles.inputInline} value={link} onChangeText={setLink} placeholder="https://..." />
         <TouchableOpacity style={[styles.primaryButton, {marginTop: 20}]} onPress={handleSave}><Text style={styles.primaryButtonText}>Salvar Configurações</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const ProfessionalTabBar = ({ activeTab, onTabPress }) => ( <View style={styles.tabBar}><TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('saldo')}><Feather name="calendar" size={24} color={activeTab==='saldo'?'#A78B4F':'#C0B49D'} /><Text style={styles.tabLabel}>Agenda</Text></TouchableOpacity><TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('financeiro')}><Feather name="bar-chart-2" size={24} color={activeTab==='financeiro'?'#A78B4F':'#C0B49D'} /><Text style={styles.tabLabel}>Financeiro</Text></TouchableOpacity></View> );
const ProfessionalMainApp = ({ onNavigate, route, onLogout }) => { const [tab, setTab] = useState('saldo'); return ( <View style={{flex:1}}>{tab==='saldo' && <ProfessionalAgendaScreen onNavigate={onNavigate} />}{tab==='financeiro' && <ProfessionalDashboardScreen />}{/* Menu agora é acessado pelo header da agenda */}<ProfessionalTabBar activeTab={tab} onTabPress={setTab} /></View> ); };

const MainNavigator = () => {
  const { user, profile, isGuest, isLoadingAuth, setIsGuest, logout } = useAuth();
  const [screen, setScreen] = useState('loading');
  const [routeParams, setRouteParams] = useState({});
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => { const timer = setTimeout(() => { if (isLoadingAuth) setTimeoutReached(true); }, 4000); return () => clearTimeout(timer); }, [isLoadingAuth]);

  useEffect(() => {
    if (isLoadingAuth && !timeoutReached) { setScreen('loading'); return; }
    if (!user && !isGuest) { setScreen('welcome'); } else if (user) {
        if (profile?.role === 'professional') setScreen('mainApp_pro');
        else if (profile) setScreen('mainApp_client');
        else if (timeoutReached) setScreen('mainApp_client');
        else setScreen('loading');
    } else if (isGuest) { setScreen('mainApp_client'); }
  }, [user, profile, isGuest, isLoadingAuth, timeoutReached]);

  const nav = (s, p = {}) => { setRouteParams({ params: p }); setScreen(s); };
  const props = { onNavigate: nav, route: routeParams };

  if (screen === 'loading') return (<View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#E6AAB7"/><Text style={{marginTop:20, color:'#999'}}>Carregando...</Text><TouchableOpacity onPress={() => { signOut(auth); setScreen('welcome'); }} style={{marginTop: 20}}><Text style={{color: 'red'}}>Sair (Reset)</Text></TouchableOpacity></View>);

  return (
    <View style={{flex: 1, height: '100%'}}>
      {screen === 'welcome' && <WelcomeScreen {...props} setIsGuest={setIsGuest} />}
      {screen === 'login' && <LoginScreen {...props} />}
      {screen === 'register' && <RegisterScreen {...props} />}
      {screen === 'completeProfile' && <CompleteProfileScreen {...props} />}
      {screen === 'mainApp_client' && <ClientMainApp {...props} onLogout={logout} />}
      {screen === 'agendamentos' && <AgendamentosScreen {...props} />}
      {screen === 'payment' && <PaymentScreen {...props} />}
      {screen === 'meusAgendamentos' && <MeusAgendamentosScreen {...props} />}
      {screen === 'bookingDetail' && <BookingDetailScreen {...props} />}
      
      {screen === 'proLogin' && <ProfessionalLoginScreen {...props} />}
      {screen === 'proRegister' && <ProfessionalRegisterScreen {...props} />}
      {screen === 'mainApp_pro' && <ProfessionalMainApp {...props} onLogout={logout} />}
      {screen === 'proMenu' && <ProfessionalMenuScreen {...props} onLogout={logout} />}
      {screen === 'proHistory' && <ProfessionalHistoryScreen {...props} />}
      {screen === 'serviceManagement' && <ServiceManagementScreen {...props} />}
      {screen === 'proProfile' && <ProfessionalProfileScreen {...props} onLogout={logout} />}
      {screen === 'couponManagement' && <CouponManagementScreen {...props} />}
      {screen === 'paymentSettings' && <PaymentSettingsScreen {...props} />}
      {screen === 'plans' && <PlansScreen {...props} />}
    </View>
  );
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => { async function prepare() { try { await Font.loadAsync({ ...Feather.font }); } catch (e) {} finally { setFontsLoaded(true); } } prepare(); }, []);
  if (!fontsLoaded) return <View><ActivityIndicator /></View>;
  return (<SafeAreaProvider initialMetrics={initialWindowMetrics}><SafeAreaView style={[styles.safeArea, { height: '100%' }]}><AuthProvider><MainNavigator /></AuthProvider></SafeAreaView></SafeAreaProvider>);
}