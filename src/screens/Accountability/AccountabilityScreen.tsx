import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { useColors } from '../../theme';
import { makeStyles } from './Accountability.styles';
import { useAppStore } from '../../store/useAppStore';
import { auth } from '../../services/firebase';
import {
  acceptRequest,
  getIncomingRequests,
  getMyPartners,
  getOrCreatePartnerCode,
  getPartnerStats,
  PartnerConnection,
  PartnerRequest,
  PublicProfile,
  rejectRequest,
  removePartner,
  sendPartnerRequest,
} from '../../services/partnerService';

function relTime(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 2)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  if (d === 1) return 'yesterday';
  return `${d} days ago`;
}

export default function AccountabilityScreen() {
  const navigation  = useNavigation();
  const colors      = useColors();
  const styles      = makeStyles(colors);
  const profile     = useAppStore((s) => s.profile);
  const uid         = auth.currentUser?.uid ?? '';
  const displayName = profile?.name ?? auth.currentUser?.displayName ?? 'Anonymous';

  const [myCode,     setMyCode]     = useState('');
  const [requests,   setRequests]   = useState<PartnerRequest[]>([]);
  const [partners,   setPartners]   = useState<PartnerConnection[]>([]);
  const [statsMap,   setStatsMap]   = useState<Record<string, PublicProfile>>({});
  const [codeInput,  setCodeInput]  = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!uid) return;
    if (!silent) setLoading(true);
    try {
      const [code, reqs, conns] = await Promise.all([
        getOrCreatePartnerCode(uid, displayName),
        getIncomingRequests(uid),
        getMyPartners(uid),
      ]);
      setMyCode(code);
      setRequests(reqs);
      setPartners(conns);
      // Fetch stats for all partners
      const entries = await Promise.all(conns.map((c) => getPartnerStats(c.uid)));
      const map: Record<string, PublicProfile> = {};
      entries.forEach((s) => { if (s) map[s.userId] = s; });
      setStatsMap(map);
    } catch {
      Alert.alert('Error', 'Could not load data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uid, displayName]);

  useEffect(() => { void load(); }, [load]);

  async function handleCopyCode() {
    await Clipboard.setStringAsync(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendRequest() {
    const trimmed = codeInput.trim().toUpperCase();
    if (trimmed.length !== 6) {
      Alert.alert('Invalid code', 'Partner codes are exactly 6 characters.');
      return;
    }
    setSending(true);
    try {
      const result = await sendPartnerRequest(uid, displayName, trimmed);
      setCodeInput('');
      const messages: Record<typeof result, string> = {
        ok:               '✅ Request sent! They will see your request when they open this screen.',
        not_found:        'No account found with that code. Double-check and try again.',
        already_sent:     'You already sent a request to this user. Waiting for them to respond.',
        self:             "That's your own code! Ask a friend to share their code with you.",
        already_partners: 'You are already accountability partners with this user.',
      };
      Alert.alert(result === 'ok' ? 'Request Sent' : 'Heads Up', messages[result]);
    } catch {
      Alert.alert('Error', 'Could not send request. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function handleAccept(req: PartnerRequest) {
    setAcceptingId(req.id);
    try {
      await acceptRequest(req, displayName);
      await load(true);
    } catch {
      Alert.alert('Error', 'Could not accept request. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleReject(req: PartnerRequest) {
    Alert.alert('Reject Request', `Decline the request from ${req.fromName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          try {
            await rejectRequest(req.id);
            setRequests((prev) => prev.filter((r) => r.id !== req.id));
          } catch {
            Alert.alert('Error', 'Could not decline request.');
          }
        },
      },
    ]);
  }

  async function handleRemove(conn: PartnerConnection) {
    Alert.alert('Remove Partner', `Remove ${conn.name} from your partners?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removePartner(uid, conn.uid);
            setPartners((prev) => prev.filter((p) => p.uid !== conn.uid));
            setStatsMap((prev) => { const next = { ...prev }; delete next[conn.uid]; return next; });
          } catch {
            Alert.alert('Error', 'Could not remove partner.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Icon source="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accountability Partners</Text>
        <TouchableOpacity onPress={() => load()} hitSlop={8}>
          <Icon source="refresh" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(true); }} tintColor={colors.primary} />}
        >
          {/* ── Your Code ─────────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>YOUR PARTNER CODE</Text>
          <View style={styles.codeCard}>
            <View style={styles.codeRow}>
              {myCode.split('').map((ch, i) => (
                <View key={i} style={styles.codeChar}>
                  <Text style={styles.codeCharTxt}>{ch}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.codeHint}>Share this code with a friend. Once they send you a request, you can accept it below.</Text>
            <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnDone]} onPress={handleCopyCode} activeOpacity={0.8}>
              <Icon source={copied ? 'check' : 'content-copy'} size={16} color={copied ? '#fff' : colors.primary} />
              <Text style={[styles.copyTxt, copied && { color: '#fff' }]}>{copied ? 'Copied!' : 'Copy Code'}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Incoming Requests ─────────────────────────────────────── */}
          {requests.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>INCOMING REQUESTS  •  {requests.length}</Text>
              {requests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.reqAvatar}>
                    <Text style={styles.reqInitial}>{req.fromName[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.reqInfo}>
                    <Text style={styles.reqName}>{req.fromName}</Text>
                    <Text style={styles.reqTime}>Sent {relTime(req.createdAt)}</Text>
                  </View>
                  <View style={styles.reqActions}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(req)}
                      disabled={acceptingId === req.id}
                      activeOpacity={0.8}
                    >
                      {acceptingId === req.id
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.acceptTxt}>Accept</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.declineBtn} onPress={() => handleReject(req)} activeOpacity={0.8}>
                      <Text style={styles.declineTxt}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* ── Add Partner ───────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>ADD PARTNER</Text>
          <View style={styles.addCard}>
            <Text style={styles.addLabel}>Enter a friend's 6-character code to send them a request</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={codeInput}
                onChangeText={(t) => setCodeInput(t.toUpperCase())}
                placeholder="ABC123"
                placeholderTextColor={colors.textMuted}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!codeInput.trim() || sending) && styles.sendBtnDisabled]}
                onPress={handleSendRequest}
                disabled={!codeInput.trim() || sending}
                activeOpacity={0.8}
              >
                {sending
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.sendTxt}>Send</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── My Partners ───────────────────────────────────────────── */}
          {partners.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>MY PARTNERS  •  {partners.length}</Text>
              {partners.map((conn) => {
                const stats = statsMap[conn.uid];
                return (
                  <View key={conn.uid} style={styles.partnerCard}>
                    <View style={styles.partnerTop}>
                      <View style={styles.partnerAvatar}>
                        {stats?.avatarUri ? (
                          <Image
                            source={{ uri: stats.avatarUri }}
                            style={{ width: 48, height: 48, borderRadius: 24 }}
                          />
                        ) : (
                          <Text style={styles.partnerInitial}>{conn.name[0].toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={styles.partnerInfo}>
                        <Text style={styles.partnerName}>{conn.name}</Text>
                        <Text style={styles.partnerSince}>Partners since {relTime(conn.connectedAt)}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemove(conn)} hitSlop={8} style={styles.removeBtn}>
                        <Icon source="account-remove-outline" size={20} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                    {stats ? (
                      <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                          <Icon source="fire" size={18} color={colors.primary} />
                          <Text style={styles.statNum}>{stats.streakCount}</Text>
                          <Text style={styles.statLbl}>STREAK</Text>
                        </View>
                        <View style={[styles.statBox, styles.statMid]}>
                          <Icon source="book-multiple" size={18} color={colors.primary} />
                          <Text style={styles.statNum}>{stats.completedCount}</Text>
                          <Text style={styles.statLbl}>COMPLETED</Text>
                        </View>
                        <View style={styles.statBox}>
                          <Icon source="clock-outline" size={18} color={colors.primary} />
                          <Text style={styles.statNum} numberOfLines={1} adjustsFontSizeToFit>{relTime(stats.lastActivity)}</Text>
                          <Text style={styles.statLbl}>LAST ACTIVE</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.noStats}>Stats will appear after their next devotional</Text>
                    )}
                  </View>
                );
              })}
            </>
          ) : (
            <View style={styles.emptyWrap}>
              <Icon source="account-group-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No partners yet</Text>
              <Text style={styles.emptySub}>Share your code or enter a friend's code above to get started. You'll see their streak and progress here once connected.</Text>
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}


