import { TRUSTED_SOURCES } from '../config/sources';
import { VerificationResult } from '../types';

const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

const VERIFY_ENDPOINT =
  import.meta.env.VITE_VERIFY_API_URL?.trim() ||
  (rawApiBase ? `${rawApiBase}/api/verify` : '/api/verify');

const HEALTH_ENDPOINT =
  import.meta.env.VITE_VERIFY_HEALTH_URL?.trim() ||
  (rawApiBase ? `${rawApiBase}/api/health` : '/api/health');

export interface ServiceHealthInfo {
  reachable: boolean;
  externalProviderConfigured: boolean;
  sources: string[];
}

export async function checkVerificationServiceHealth(): Promise<ServiceHealthInfo> {
  try {
    const response = await fetch(HEALTH_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return { reachable: false, externalProviderConfigured: false, sources: [] };
    }
    const data = (await response.json()) as Partial<ServiceHealthInfo> & { ok?: boolean };
    return {
      reachable: Boolean(data.ok),
      externalProviderConfigured: Boolean(data.externalProviderConfigured),
      sources: Array.isArray(data.sources) ? data.sources : [],
    };
  } catch {
    return { reachable: false, externalProviderConfigured: false, sources: [] };
  }
}

export async function verifyElectoralContent(query: string): Promise<VerificationResult> {
  try {
    const response = await fetch(VERIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        outcome: 'technical_failure',
        claimAssessment: 'unknown',
        headline: 'Serviço de checagem indisponível no momento',
        explanation: `O serviço de verificação respondeu com código HTTP ${response.status} e não pôde concluir a consulta agora.`,
        limitationNote:
          'Não houve checagem concluída nem geração de resultado simulado. Tente novamente em instantes ou consulte diretamente os canais oficiais abaixo.',
        providerAttribution: 'Serviço de checagem temporariamente indisponível',
        externalProviderConfigured: false,
        evidences: [],
        consultedDirectories: TRUSTED_SOURCES,
      };
    }

    const payload = (await response.json()) as VerificationResult;
    return {
      ...payload,
      claimAssessment: payload.claimAssessment ?? 'unknown',
    };
  } catch {
    return {
      outcome: 'technical_failure',
      claimAssessment: 'unknown',
      headline: 'Não foi possível conectar ao serviço de checagem',
      explanation:
        'A aplicação não conseguiu alcançar o serviço de verificação no momento. Verifique sua conexão com a internet e tente novamente.',
      limitationNote:
        'Não houve checagem concluída. Para evitar engano, nenhum resultado foi simulado. Você pode tentar novamente ou consultar diretamente os portais oficiais abaixo.',
      providerAttribution: 'Sem conexão com o serviço de checagem',
      externalProviderConfigured: false,
      evidences: [],
      consultedDirectories: TRUSTED_SOURCES,
    };
  }
}
