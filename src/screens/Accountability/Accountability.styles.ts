import { StyleSheet } from 'react-native';
import { type ColorScheme } from '../../theme';

export const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe:         { flex: 1, backgroundColor: c.background },
    header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
    headerTitle:  { fontSize: 17, fontWeight: '700', color: c.textPrimary },
    center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
    container:    { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: c.textMuted, marginBottom: 10, marginTop: 6 },

    // Code
    codeCard:    { backgroundColor: c.surface, borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: c.border },
    codeRow:     { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 14 },
    codeChar:    { width: 44, height: 52, borderRadius: 10, backgroundColor: c.background, borderWidth: 1.5, borderColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    codeCharTxt: { fontSize: 22, fontWeight: '800', color: c.primary },
    codeHint:    { fontSize: 13, color: c.textMuted, textAlign: 'center', marginBottom: 14, lineHeight: 18 },
    copyBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, borderWidth: 1.5, borderColor: c.primary, paddingVertical: 10 },
    copyBtnDone: { backgroundColor: c.primary, borderColor: c.primary },
    copyTxt:     { fontSize: 14, fontWeight: '600', color: c.primary },

    // Incoming requests
    requestCard:  { backgroundColor: c.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
    reqAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary + '22', alignItems: 'center', justifyContent: 'center' },
    reqInitial:   { fontSize: 18, fontWeight: '800', color: c.primary },
    reqInfo:      { flex: 1 },
    reqName:      { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    reqTime:      { fontSize: 12, color: c.textMuted, marginTop: 2 },
    reqActions:   { flexDirection: 'row', gap: 8 },
    acceptBtn:    { backgroundColor: c.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, minWidth: 64, alignItems: 'center' },
    acceptTxt:    { fontSize: 13, fontWeight: '700', color: '#fff' },
    declineBtn:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: c.border, alignItems: 'center' },
    declineTxt:   { fontSize: 13, fontWeight: '600', color: c.textMuted },

    // Add partner
    addCard:      { backgroundColor: c.surface, borderRadius: 14, padding: 16, marginBottom: 28, borderWidth: 1, borderColor: c.border },
    addLabel:     { fontSize: 13, color: c.textMuted, marginBottom: 12 },
    inputRow:     { flexDirection: 'row', gap: 10 },
    input:        { flex: 1, height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, fontSize: 18, fontWeight: '700', letterSpacing: 3, color: c.textPrimary, backgroundColor: c.background },
    sendBtn:      { height: 48, paddingHorizontal: 20, borderRadius: 10, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { opacity: 0.45 },
    sendTxt:      { fontSize: 14, fontWeight: '700', color: '#fff' },

    // Partners
    partnerCard:    { backgroundColor: c.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.border },
    partnerTop:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    partnerAvatar:  { width: 48, height: 48, borderRadius: 24, backgroundColor: c.primary + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    partnerInitial: { fontSize: 20, fontWeight: '800', color: c.primary },
    partnerInfo:    { flex: 1 },
    partnerName:    { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    partnerSince:   { fontSize: 12, color: c.textMuted, marginTop: 2 },
    removeBtn:      { padding: 4 },
    statsRow:       { flexDirection: 'row' },
    statBox:        { flex: 1, backgroundColor: c.background, borderRadius: 10, padding: 10, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: c.border },
    statMid:        { marginHorizontal: 8 },
    statNum:        { fontSize: 15, fontWeight: '800', color: c.textPrimary, textAlign: 'center' },
    statLbl:        { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: c.textMuted },
    noStats:        { fontSize: 12, color: c.textMuted, textAlign: 'center', paddingVertical: 4 },

    // Empty
    emptyWrap:    { alignItems: 'center', paddingTop: 24, gap: 10 },
    emptyTitle:   { fontSize: 18, fontWeight: '700', color: c.textPrimary },
    emptySub:     { fontSize: 14, color: c.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  });
