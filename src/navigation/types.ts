import { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  MethodSelection: undefined;
  CreateAccount: undefined;
  AllSet: { name?: string } | undefined;
};

// ─── Main Tab Bar ─────────────────────────────────────────────────────────────

export type MainTabParamList = {
  Home:    NavigatorScreenParams<HomeStackParamList>;
  Bible:   NavigatorScreenParams<BibleStackParamList>;
  Journal: NavigatorScreenParams<JournalStackParamList>;
  History: NavigatorScreenParams<HistoryStackParamList>;
  Profile: undefined;
};

// ─── Bible Stack ─────────────────────────────────────────────────────────────

export type BibleStackParamList = {
  Books:    undefined;
  Chapters: { bookId: number; bookName: string; totalChapters: number };
  Verses:   { bookId: number; bookName: string; chapter: number };
};

// ─── Home Stack ───────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  HomeMain: undefined;
};

// ─── Journal Stack ────────────────────────────────────────────────────────────

export type JournalStackParamList = {
  JournalHome: { prefill?: JournalPrefill } | undefined;
  SoapJournal: { entryId?: string; prefill?: JournalPrefill };
  McpwaJournal: { entryId?: string; prefill?: JournalPrefill };
  SwordJournal: { entryId?: string; prefill?: JournalPrefill };
  SermonNotes: { noteId?: string };
};

export type JournalPrefill = {
  reference: string;
  text: string;
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
