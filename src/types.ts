export type TabId = 'verificar' | 'quiz' | 'configuracoes';

/**
 * Perfil de público selecionado na experiência inicial.
 * Desacoplado dos controles técnicos de acessibilidade para permitir personalização livre.
 */
export type AudienceProfile = 'idosa' | 'cega' | 'surda';

/**
 * Modos técnicos visuais e estruturais de acessibilidade.
 */
export type AccessibilityProfile = 'padrao' | 'visual' | 'auditiva';

export type ThemeMode = 'light' | 'dark';

export type AnalysisStatus = 'idle' | 'loading' | 'done';

export type VerificationOutcome =
  | 'match_found'
  | 'insufficient_evidence'
  | 'technical_failure';

export type ClaimAssessment =
  | 'false'
  | 'misleading'
  | 'true'
  | 'unverified'
  | 'unknown';

export interface TrustedSource {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface VerificationEvidenceItem {
  id: string;
  title: string;
  publisher: string;
  rating?: string;
  claimAssessment: ClaimAssessment;
  summary: string;
  url: string;
  publishedAt?: string;
}

export interface VerificationResult {
  outcome: VerificationOutcome;
  claimAssessment: ClaimAssessment;
  headline: string;
  explanation: string;
  limitationNote: string;
  providerAttribution: string;
  externalProviderConfigured: boolean;
  evidences: VerificationEvidenceItem[];
  consultedDirectories: TrustedSource[];
}

export interface QuizAlternative {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  alternatives: QuizAlternative[];
  explanationCorrect: string;
  explanationIncorrect: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface UserPreferences {
  audience: AudienceProfile;
  profile: AccessibilityProfile;
  theme: ThemeMode;
  textScale: number;
  voiceReadingEnabled: boolean;
  librasEnabled: boolean;
}
