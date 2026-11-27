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

export interface TrustedSourceRef {
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

export interface VerificationApiResponse {
  outcome: VerificationOutcome;
  claimAssessment: ClaimAssessment;
  headline: string;
  explanation: string;
  limitationNote: string;
  providerAttribution: string;
  externalProviderConfigured: boolean;
  evidences: VerificationEvidenceItem[];
  consultedDirectories: TrustedSourceRef[];
}
