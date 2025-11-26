import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  // --- ESTRUTURA GERAL ---
  safeArea: { flex: 1, backgroundColor: '#FDF5F7' },
  page: { backgroundColor: '#FDF5F7', paddingHorizontal: 20, paddingTop: 40 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#FDF5F7' },

  // --- TELA DE BOAS VINDAS (Welcome) ---
  welcomeTitle: { 
    fontFamily: "serif", 
    fontSize: 48, 
    fontWeight: 'bold', 
    color: '#D4AF37', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  welcomeSubtitle: { 
    fontSize: 18, 
    color: '#8A74A8', 
    textAlign: 'center', 
    marginBottom: 40,
    lineHeight: 24
  },
  welcomeSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center'
  },

  // --- TELAS DE LOGIN E CADASTRO (Auth) ---
  authTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#8A74A8', 
    marginBottom: 10, 
    alignSelf: 'center' 
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    alignSelf: 'center'
  },

  // --- TELA HOME (Cliente) ---
  homeGreeting: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    color: '#333', 
    alignSelf: 'flex-start', 
    marginBottom: 5, 
  },
  homeSubtitle: {
    fontSize: 16,
    color: '#8A74A8',
    marginBottom: 25
  },
  homeSectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 30, 
    marginBottom: 15, 
    borderLeftWidth: 4,
    borderLeftColor: '#E6AAB7', 
    paddingLeft: 10
  },

  // --- TELA DE AGENDAMENTO ---
  agendaGreeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8A74A8',
    marginBottom: 10
  },
  agendaSectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#555', 
    marginTop: 25, 
    marginBottom: 10, 
  },
  
  // --- TELA DE PERFIL ---
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  profileEmail: { fontSize: 16, color: '#777', marginTop: 4, textAlign: 'center' },
  profilePhone: { fontSize: 16, color: '#555', marginTop: 10, fontWeight: '500', textAlign: 'center' },
  profileSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, alignSelf: 'flex-start' },

  // --- TELA PAINEL PROFISSIONAL ---
  proDashboardTitle: { fontSize: 30, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  proSectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#8A74A8', marginTop: 30, marginBottom: 15 },
  
  // --- COMPONENTES VISUAIS ---
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 15, marginBottom: 15, paddingHorizontal: 15, },
  input: { flex: 1, height: 50, fontSize: 16, color: '#333', marginLeft: 10, },
  inputContainerInline: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', borderRadius: 10, marginBottom: 10, paddingHorizontal: 10, },
  inputInline: { flex: 1, height: 45, fontSize: 16, color: '#333', marginLeft: 10, },

  promoCard: { width: '100%', height: 200, borderRadius: 20, justifyContent: 'flex-end', alignItems: 'flex-start', backgroundColor: '#DDD', overflow: 'hidden', marginBottom: 20 },
  promoImage: { width: '100%', height: '100%', position: 'absolute' },
  promoOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20, paddingVertical: 15, width: '100%', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  promoTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', },
  promoSubtitle: { fontSize: 15, color: '#FFF', marginTop: 4, },
  
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', },
  serviceCardSmall: { backgroundColor: '#FFF', paddingVertical: 25, borderRadius: 15, alignItems: 'center', width: '31%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  serviceCardSmallText: { fontWeight: 'bold', color: '#8A74A8' },

  proCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 10 },
  proPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#EEE' },
  proName: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  subServiceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  subServiceTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1, marginRight: 10 },
  subServiceButton: { fontSize: 14, fontWeight: 'bold', color: '#E6AAB7' },

  profileCard: { width: '100%', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 30, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, },
  profilePhoto: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, backgroundColor: '#EEE' },

  buttonContainer: { marginTop: 30, width: '100%', },
  primaryButton: { width: '100%', paddingVertical: 15, backgroundColor: '#E6AAB7', borderRadius: 25, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  primaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', },
  secondaryButton: { width: '100%', paddingVertical: 13, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 25, alignItems: 'center', marginBottom: 15 },
  secondaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37', },
  proButton: { width: '100%', paddingVertical: 15, backgroundColor: '#8A74A8', borderRadius: 25, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  proButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', },
  ghostButton: { width: '100%', paddingVertical: 13, alignItems: 'center', marginTop: 5 },
  ghostButtonText: { fontSize: 16, color: '#8A74A8', },
  logoutButton: { flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: '#fecaca', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, },
  logoutButtonText: { color: '#ef4444', fontWeight: 'bold', marginLeft: 8, fontSize: 16, },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#8A74A8', fontSize: 16, marginLeft: 5, fontWeight: 'bold' },
  editButton: { marginTop: 20, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E6AAB7' },
  editButtonText: { color: '#E6AAB7', fontWeight: 'bold' },

  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 100 : 90, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', },
  tabItem: { alignItems: 'center', flex: 1, },
  tabLabel: { fontSize: 12, color: '#C0B49D', marginTop: 4, },

  calendarGrid: { backgroundColor: '#FFF', borderRadius: 15, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
  dateCell: { alignItems: 'center', paddingVertical: 10, borderRadius: 10, width: 45, height: 60, justifyContent: 'center' },
  dateCellSelected: { backgroundColor: '#E6AAB7' },
  dateDay: { fontSize: 12, color: '#8A74A8', fontWeight: 'bold' },
  dateDaySelected: { color: '#FFF' },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
  dateTextSelected: { color: '#FFF' },

  timeSlotContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10, },
  timeSlot: { width: '31%', paddingVertical: 15, backgroundColor: '#FFF', borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  timeSlotText: { color: '#333', fontWeight: 'bold' },
  timeSlotBooked: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  timeSlotTextBooked: { color: '#AAA', textDecorationLine: 'line-through' },
  timeSlotSelected: { backgroundColor: '#E6AAB7', borderColor: '#E6AAB7' },
  timeSlotTextSelected: { color: '#FFF', fontWeight: 'bold' },

  summaryText: { fontSize: 16, color: '#333', marginBottom: 10, lineHeight: 22 },
  termsText: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 20, },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#E6AAB7', backgroundColor: '#FFF', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#E6AAB7' },
  checkboxLabel: { fontSize: 16, color: '#333', flex: 1 },
  
  saldoCardSmall: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, alignItems: 'center', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, },
  saldoTotal: { fontSize: 42, fontWeight: 'bold', color: '#8A74A8', marginBottom: 10, textAlign: 'center', },
  saldoTotalSmall: { fontSize: 28, fontWeight: 'bold', color: '#8A74A8', },
  saldoItemPrice: { fontSize: 16, fontWeight: 'bold', color: '#22c55e', marginTop: 8, },

  serviceEditorContainer: { padding: 15, backgroundColor: '#FFF', borderRadius: 15, marginTop: -10, borderTopLeftRadius: 0, borderTopRightRadius: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, },

  // ==================================================
  // NOVO: ESTILOS DO SWITCH (ABAS)
  // ==================================================
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0EAE0', // Cor de fundo suave
    borderRadius: 12,
    padding: 4,
    marginVertical: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A74A8', // Roxo desativado
  },
  segmentTextActive: {
    color: '#D4AF37', // Dourado quando ativo
    fontWeight: 'bold',
  }
});