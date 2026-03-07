import { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  MethodSelection: undefined;
  CreateAccount: undefined;
};

// ─── Main Tab Bar ─────────────────────────────────────────────────────────────

export type MainTabParamList = {
  Home:    NavigatorScreenParams<HomeStackParamList>;
  Bible:   undefined;
  Journal: undefined;
  History: NavigatorScreenParams<HistoryStackParamList>;
  Profile: undefined;
};

// ─── Home Stack ───────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  HomeMain:   undefined;
  VerseOfDay: undefined;
};

// ─── Journal Stack ────────────────────────────────────────────────────────────

export type JournalStackParamList = {
  JournalHome: undefined;
  SoapJournal: { entryId?: string };
  McpwaJournal: { entryId?: string };
  SwordJournal: { entryId?: string };
  SermonNotes: { noteId?: string };
};

// ─── History Stack ───────────────────────────────────────────────────────────

export type HistoryStackParamList = {
  HistoryMain:      undefined;
  DevotionalDetail: { entryId: string; entryType: string };
};

// ─── Profile Stack ────────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Reminders:   undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
