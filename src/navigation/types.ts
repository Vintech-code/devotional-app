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
  Home: undefined;
  Bible: undefined;
  Journal: undefined;
  Profile: undefined;
};

// ─── Home Stack ───────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  HomeMain: undefined;
};

// ─── Journal Stack ────────────────────────────────────────────────────────────

export type JournalStackParamList = {
  JournalHome: undefined;
  SoapJournal: { entryId?: string };
  McpwaJournal: { entryId?: string };
  SwordJournal: { entryId?: string };
  SermonNotes: { noteId?: string };
};

// ─── Profile Stack ────────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Reminders: undefined;
  JournalHistory: undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
