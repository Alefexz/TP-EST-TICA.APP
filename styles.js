import { StyleSheet, Platform, Dimensions } from 'react-native';

const isWeb = Platform.OS === 'web';
const screenWidth = Dimensions.get('window').width;

const webContainerStyle = isWeb && screenWidth > 600 ? {
  maxWidth: 480, width: '100%', alignSelf: 'center', minHeight: '100%',
  shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5,
} : { flex: 1 };

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: isWeb ? '#EFEFEF' : '#FDF5F7' },
  page: { backgroundColor: '#FDF5F7', paddingHorizontal: 20, paddingTop: 40, flex: 1, ...webContainerStyle },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#FDF5F7', ...webContainerStyle },

  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 },
  menuButton: { padding: 5, cursor: 'pointer' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  profileHeaderButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6AAB7', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },

  // --- INPUTS ---
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 15, marginBottom: 15, paddingHorizontal: 15 },
  input: { flex: 1, height: 55, fontSize: 16, color: '#333', marginLeft: 10, outlineStyle: 'none', backgroundColor: 'transparent' },
  inputContainerInline: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, paddingVertical: 5 },
  inputInline: { flex: 1, height: 50, fontSize: 16, color: '#333', marginLeft: 10, outlineStyle: 'none', backgroundColor: 'transparent' },

  // --- TEXTOS ---
  welcomeTitle: { fontFamily: Platform.OS === 'ios' ? "serif" : "Roboto", fontSize: 36, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginBottom: 5 },
  welcomeSubtitle: { fontSize: 16, color: '#8A74A8', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  welcomeSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10, textAlign: 'center' },
  authTitle: { fontSize: 28, fontWeight: 'bold', color: '#8A74A8', marginBottom: 10, alignSelf: 'center' },
  authSubtitle: { fontSize: 16, color: '#666', marginBottom: 30, alignSelf: 'center' },
  
  homeGreeting: { fontSize: 34, fontWeight: 'bold', color: '#333', alignSelf: 'flex-start', marginBottom: 5 },
  homeSubtitle: { fontSize: 16, color: '#8A74A8', marginBottom: 25 },
  homeSectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 30, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#E6AAB7', paddingLeft: 10 },
  
  agendaGreeting: { fontSize: 26, fontWeight: 'bold', color: '#8A74A8', marginBottom: 10 },
  agendaSectionTitle: { fontSize: 18, fontWeight: '600', color: '#555', marginTop: 25, marginBottom: 10 },
  
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  profileEmail: { fontSize: 16, color: '#777', marginTop: 4, textAlign: 'center' },
  profilePhone: { fontSize: 16, color: '#555', marginTop: 10, fontWeight: '500', textAlign: 'center' },
  profileSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, alignSelf: 'flex-start' },
  
  proDashboardTitle: { fontSize: 30, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  proSectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#8A74A8', marginTop: 30, marginBottom: 15 },

  // --- CARDS GERAIS ---
  promoCard: { width: '100%', height: 200, borderRadius: 20, justifyContent: 'flex-end', alignItems: 'flex-start', backgroundColor: '#DDD', overflow: 'hidden', marginBottom: 20 },
  promoImage: { width: '100%', height: '100%', position: 'absolute' },
  promoOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20, paddingVertical: 15, width: '100%', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  promoTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  promoSubtitle: { fontSize: 15, color: '#FFF', marginTop: 4 },
  
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  serviceCardSmall: { backgroundColor: '#FFF', paddingVertical: 25, borderRadius: 15, alignItems: 'center', width: '31%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, cursor: 'pointer' },
  serviceCardSmallText: { fontWeight: 'bold', color: '#8A74A8', textAlign: 'center' },

  proCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 10 },
  proPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#EEE' },
  proName: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  serviceListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, cursor: 'pointer' },
  serviceTitleClean: { fontSize: 18, fontWeight: '600', color: '#333' },
  servicePriceClean: { fontSize: 16, fontWeight: 'bold', color: '#8A74A8' },
  serviceChevron: { fontSize: 20, color: '#E6AAB7', marginLeft: 10 },

  historyCard: { flexDirection: 'column', alignItems: 'flex-start', backgroundColor: '#F9F9F9', padding: 20, borderRadius: 15, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#CCC' },
  historyCardConcluido: { borderLeftColor: '#22c55e' }, 
  
  profileCard: { width: '100%', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 30, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  profilePhoto: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, backgroundColor: '#EEE' },

  // --- PLANOS E SAAS (NOVOS) ---
  planCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 2, borderColor: '#EEE', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, alignItems: 'center' },
  planCardRecommended: { borderColor: '#8A74A8', transform: [{ scale: 1.02 }], zIndex: 10 },
  planBadge: { position: 'absolute', top: -15, backgroundColor: '#8A74A8', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  planBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  planTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  planPrice: { fontSize: 36, fontWeight: 'bold', color: '#333', marginVertical: 10 },
  planFeatureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' },
  planFeatureText: { marginLeft: 10, color: '#555', fontSize: 14 },

  // --- ONBOARDING MODAL (NOVO) ---
  onboardingModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  onboardingCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, width: '100%', maxWidth: 400, alignItems: 'center' },
  onboardingTitle: { fontSize: 24, fontWeight: 'bold', color: '#8A74A8', marginBottom: 10, textAlign: 'center' },
  onboardingText: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  linkBox: { backgroundColor: '#F0F0F0', padding: 15, borderRadius: 10, marginBottom: 20, width: '100%' },
  linkText: { color: '#333', fontWeight: 'bold', textAlign: 'center' },

  // --- BOTÕES ---
  buttonContainer: { marginTop: 30, width: '100%' },
  primaryButton: { width: '100%', paddingVertical: 15, backgroundColor: '#E6AAB7', borderRadius: 25, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, cursor: 'pointer' },
  primaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  secondaryButton: { width: '100%', paddingVertical: 13, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 25, alignItems: 'center', marginBottom: 15, cursor: 'pointer' },
  secondaryButtonText: { fontSize: 18, fontWeight: 'bold', color: '#D4AF37' },
  proButton: { width: '100%', paddingVertical: 15, backgroundColor: '#8A74A8', borderRadius: 25, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, cursor: 'pointer' },
  proButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  ghostButton: { width: '100%', paddingVertical: 13, alignItems: 'center', marginTop: 5, cursor: 'pointer' },
  ghostButtonText: { fontSize: 16, color: '#8A74A8' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: '#fecaca', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, cursor: 'pointer' },
  logoutButtonText: { color: '#ef4444', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start', cursor: 'pointer' },
  backButtonText: { color: '#8A74A8', fontSize: 16, marginLeft: 5, fontWeight: 'bold' },
  editButton: { marginTop: 20, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E6AAB7', cursor: 'pointer' },
  editButtonText: { color: '#E6AAB7', fontWeight: 'bold' },
  successButton: { width: '100%', paddingVertical: 15, backgroundColor: '#22c55e', borderRadius: 25, marginTop: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, cursor: 'pointer' },
  successButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  whatsappButton: { width: '100%', paddingVertical: 15, backgroundColor: '#25D366', borderRadius: 25, marginTop: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, cursor: 'pointer' },
  whatsappButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },

  // --- PAGAMENTO ---
  paymentOptionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, width: '100%' },
  paymentOption: { width: '31%', paddingVertical: 15, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', cursor: 'pointer' },
  paymentOptionSelected: { backgroundColor: '#E6AAB7', borderColor: '#E6AAB7' },
  paymentOptionText: { fontSize: 12, fontWeight: 'bold', color: '#555', marginTop: 5 },
  paymentOptionTextSelected: { color: '#FFF' },
  paymentInfoBox: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#EEE', marginBottom: 20, alignItems: 'center' },
  copyButton: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#DDD', borderRadius: 20 },
  cardLinkButton: { marginTop: 10, paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#3b82f6', borderRadius: 25, width: '100%', alignItems: 'center' },

  // --- DASHBOARD & ESTATÍSTICAS ---
  dashboardCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  dashboardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 15, padding: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 5 },
  statLabel: { fontSize: 12, color: '#888', textAlign: 'center' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150, paddingTop: 20, paddingBottom: 10 },
  chartBar: { width: 30, backgroundColor: '#E6AAB7', borderRadius: 5 },
  chartLabel: { fontSize: 10, color: '#999', marginTop: 5, textAlign: 'center' },
  chartBarWrapper: { alignItems: 'center' },
  agendaSummary: { backgroundColor: '#8A74A8', borderRadius: 15, padding: 15, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  agendaSummaryText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // --- TAB BAR ---
  tabBar: { position: isWeb ? 'fixed' : 'absolute', bottom: 0, left: 0, right: 0, height: 90, paddingTop: 10, paddingBottom: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', ...webContainerStyle, width: isWeb && screenWidth > 600 ? 480 : '100%' },
  tabItem: { alignItems: 'center', flex: 1, cursor: 'pointer' },
  tabLabel: { fontSize: 12, color: '#C0B49D', marginTop: 4 },

  // --- CALENDÁRIO E SLOTS ---
  calendarGrid: { backgroundColor: '#FFF', borderRadius: 15, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
  dateCell: { alignItems: 'center', paddingVertical: 10, borderRadius: 10, width: 45, height: 60, justifyContent: 'center', cursor: 'pointer' },
  dateCellSelected: { backgroundColor: '#E6AAB7' },
  dateDay: { fontSize: 12, color: '#8A74A8', fontWeight: 'bold' },
  dateDaySelected: { color: '#FFF' },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
  dateTextSelected: { color: '#FFF' },
  timeSlotContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  timeSlot: { width: '31%', paddingVertical: 15, backgroundColor: '#FFF', borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EEE', cursor: 'pointer' },
  timeSlotText: { color: '#333', fontWeight: 'bold' },
  timeSlotBooked: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  timeSlotTextSelected: { color: '#FFF', fontWeight: 'bold' },
  timeSlotSelected: { backgroundColor: '#E6AAB7', borderColor: '#E6AAB7' },
  
  // --- OUTROS ---
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20, cursor: 'pointer' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#E6AAB7', backgroundColor: '#FFF', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#E6AAB7' },
  checkboxLabel: { fontSize: 16, color: '#333', flex: 1 },
  saldoCardSmall: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, alignItems: 'center', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  saldoTotalSmall: { fontSize: 28, fontWeight: 'bold', color: '#8A74A8' },
  saldoItemPrice: { fontSize: 16, fontWeight: 'bold', color: '#8A74A8', marginTop: 5 },
  serviceEditorContainer: { padding: 15, backgroundColor: '#FFF', borderRadius: 15, marginTop: -10, borderTopLeftRadius: 0, borderTopRightRadius: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  agendaCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  agendaCardContent: { flex: 1 },
  agendaCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  agendaCardDateTime: { fontSize: 15, color: '#666' },
});