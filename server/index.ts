import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizeText,
  OFFICIAL_DIRECTORIES,
  searchTseOfficialCorpus,
} from './tseOfficialCorpus.ts';
import type {
  ClaimAssessment,
  VerificationApiResponse,
  VerificationEvidenceItem,
} from './types.ts';

const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
const HOST =
  process.env.HOST ||
  process.env.API_HOST ||
  (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '0.0.0.0');
const FACT_CHECK_API_KEY = process.env.FACT_CHECK_API_KEY?.trim() || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(currentDir, '..', 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

interface GoogleFactCheckClaim {
  text?: string;
  claimant?: string;
  claimReview?: Array<{
    publisher?: { name?: string; site?: string };
    url?: string;
    title?: string;
    reviewDate?: string;
    textualRating?: string;
    languageCode?: string;
  }>;
}

interface GoogleFactCheckApiResponse {
  claims?: GoogleFactCheckClaim[];
}

export function mapTextualRatingToAssessment(textualRating?: string): ClaimAssessment {
  if (!textualRating) return 'unknown';
  const norm = normalizeText(textualRating);
  if (!norm) return 'unknown';

  const misleadingTerms = [
    'enganos',
    'fora de contexto',
    'sem contexto',
    'distorcid',
    'parcialmente',
    'exagerad',
    'imprecis',
    'incomplet',
    'subestimad',
    'superestimad',
    'nao e bem assim',
  ];
  if (misleadingTerms.some((term) => norm.includes(term))) {
    return 'misleading';
  }

  const unverifiedTerms = [
    'insustentavel',
    'sem provas',
    'sem evidenc',
    'nao verificad',
    'inconclusiv',
    'nao ha registro',
  ];
  if (unverifiedTerms.some((term) => norm.includes(term))) {
    return 'unverified';
  }

  const falseTerms = [
    'falso',
    'falsa',
    'boato',
    'mentira',
    'fake',
    'montagem',
    'inveridic',
    'fraudulent',
  ];
  if (falseTerms.some((term) => norm.includes(term))) {
    return 'false';
  }

  const trueTerms = ['verdadeir', 'comprovad', 'fato', 'corret', 'exato', 'procede'];
  if (trueTerms.some((term) => norm.includes(term))) {
    return 'true';
  }

  return 'unknown';
}

export function deriveOverallAssessment(evidences: VerificationEvidenceItem[]): ClaimAssessment {
  if (evidences.length === 0) return 'unverified';

  const assessments = new Set(evidences.map((item) => item.claimAssessment));
  if (assessments.has('true') && (assessments.has('false') || assessments.has('misleading'))) {
    return 'unknown';
  }
  if (assessments.has('false')) return 'false';
  if (assessments.has('misleading')) return 'misleading';
  if (assessments.has('true')) return 'true';
  if (assessments.has('unverified')) return 'unverified';
  return 'unknown';
}

async function queryGoogleFactCheckApi(
  query: string,
  apiKey: string
): Promise<{ items: VerificationEvidenceItem[]; failed: boolean }> {
  if (!apiKey) {
    return { items: [], failed: false };
  }

  const endpoint = new URL('https://factchecktools.googleapis.com/v1alpha1/claims:search');
  endpoint.searchParams.set('languageCode', 'pt-BR');
  endpoint.searchParams.set('pageSize', '4');
  endpoint.searchParams.set('query', query.slice(0, 280));
  endpoint.searchParams.set('key', apiKey);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6500),
    });

    if (!response.ok) {
      return { items: [], failed: true };
    }

    const data = (await response.json()) as GoogleFactCheckApiResponse;
    const claims = Array.isArray(data.claims) ? data.claims : [];
    const evidences: VerificationEvidenceItem[] = [];

    claims.forEach((claim, claimIdx) => {
      const reviews = Array.isArray(claim.claimReview) ? claim.claimReview : [];
      reviews.forEach((review, revIdx) => {
        if (!review.url) return;
        const publisherName =
          review.publisher?.name || review.publisher?.site || 'Agência de checagem indexada';
        const claimText = claim.text ? `Declaração analisada: "${claim.text}".` : '';
        const assessment = mapTextualRatingToAssessment(review.textualRating);

        evidences.push({
          id: `fc-${claimIdx}-${revIdx}`,
          title: review.title || claim.text || 'Verificação jornalística publicada',
          publisher: publisherName,
          rating: review.textualRating || 'Checagem publicada',
          claimAssessment: assessment,
          summary:
            `${claimText} Classificação registrada pela fonte (${publisherName}): ${
              review.textualRating || 'consulte o artigo completo'
            }.`.trim(),
          url: review.url,
          publishedAt: review.reviewDate ? review.reviewDate.slice(0, 10) : undefined,
        });
      });
    });

    return { items: evidences.slice(0, 4), failed: false };
  } catch {
    return { items: [], failed: true };
  }
}

function resolveAllowedOrigin(requestOrigin: string | undefined): string | null {
  if (!requestOrigin || ALLOWED_ORIGINS.length === 0) return null;
  if (ALLOWED_ORIGINS.includes('*')) return '*';
  if (ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  return null;
}

const app = Fastify({
  logger: false, // Evita gravar consultas de usuários em logs
  trustProxy: true,
});

// Cabeçalhos de segurança e suporte explícito a CORS quando front-end e API estiverem separados
app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('X-Frame-Options', 'DENY');

  const allowedOrigin = resolveAllowedOrigin(request.headers.origin);
  if (allowedOrigin) {
    reply.header('Access-Control-Allow-Origin', allowedOrigin);
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    if (allowedOrigin !== '*') {
      reply.header('Vary', 'Origin');
    }
  }

  if (request.method === 'OPTIONS' && request.url.startsWith('/api/')) {
    return reply.status(204).send();
  }
});

app.get('/api/health', async () => {
  return {
    ok: true,
    service: 'voto-claro-verify-api',
    externalProviderConfigured: Boolean(FACT_CHECK_API_KEY),
    sources: FACT_CHECK_API_KEY
      ? ['Google Fact Check Tools API (pt-BR)', 'Base oficial verificável do TSE']
      : ['Base oficial verificável do TSE'],
  };
});

app.post<{ Body: { query?: unknown } }>('/api/verify', async (request, reply) => {
  const rawQuery = typeof request.body?.query === 'string' ? request.body.query.trim() : '';

  if (rawQuery.length === 0) {
    return reply.status(400).send({
      error: 'Informe um texto, mensagem ou endereço para realizar a consulta.',
    });
  }

  const sanitizedQuery = rawQuery.slice(0, 2500);

  const [externalResult, tseMatches] = await Promise.all([
    queryGoogleFactCheckApi(sanitizedQuery, FACT_CHECK_API_KEY),
    Promise.resolve(searchTseOfficialCorpus(sanitizedQuery)),
  ]);

  const combinedEvidences: VerificationEvidenceItem[] = [
    ...externalResult.items,
    ...tseMatches,
  ];

  if (FACT_CHECK_API_KEY && externalResult.failed && combinedEvidences.length === 0) {
    const failureResponse: VerificationApiResponse = {
      outcome: 'technical_failure',
      claimAssessment: 'unknown',
      headline: 'Falha técnica ao consultar provedor externo de checagens',
      explanation:
        'O servidor tentou consultar a API externa configurada, mas não obteve resposta válida no momento, e não houve correspondência direta na base institucional local do TSE.',
      limitationNote:
        'Não houve checagem concluída nem geração de veredito. Tente novamente em instantes ou consulte diretamente os canais oficiais abaixo.',
      providerAttribution: 'Serviço Voto Claro (consulta externa temporariamente indisponível)',
      externalProviderConfigured: true,
      evidences: [],
      consultedDirectories: OFFICIAL_DIRECTORIES,
    };
    return reply.status(200).send(failureResponse);
  }

  if (combinedEvidences.length > 0) {
    const usedExternal = externalResult.items.length > 0;
    const usedTse = tseMatches.length > 0;
    const overallAssessment = deriveOverallAssessment(combinedEvidences);

    const attributionParts: string[] = [];
    if (usedExternal) attributionParts.push('Google Fact Check Tools API (agências de checagem)');
    if (usedTse) attributionParts.push('Base de esclarecimentos oficiais da Justiça Eleitoral (TSE)');

    let explanation =
      'Encontramos referências publicadas por fontes confiáveis relacionadas aos termos informados. Confira abaixo a classificação atribuída por cada fonte e abra o link original para verificar o contexto completo.';

    if (overallAssessment === 'false' || overallAssessment === 'misleading') {
      explanation =
        'A(s) fonte(s) consultada(s) classifica(m) esta alegação como falsa ou enganosa. Leia o esclarecimento abaixo e confira a publicação original para verificar todos os detalhes.';
    } else if (overallAssessment === 'true') {
      explanation =
        'A(s) fonte(s) consultada(s) confirma(m) a informação ou regra descrita. Ainda assim, confira na publicação original se datas, locais ou exceções se aplicam ao seu caso.';
    } else if (overallAssessment === 'unknown') {
      explanation =
        'Encontramos orientação institucional oficial sobre este tema, sem um rótulo automático de verdadeiro ou falso para o texto livre digitado. Consulte a fonte oficial abaixo antes de compartilhar.';
    }

    const foundResponse: VerificationApiResponse = {
      outcome: 'match_found',
      claimAssessment: overallAssessment,
      headline:
        combinedEvidences.length === 1
          ? '1 referência verificável encontrada na consulta'
          : `${combinedEvidences.length} referências verificáveis encontradas na consulta`,
      explanation,
      limitationNote:
        'A avaliação acima reflete exclusivamente a classificação registrada pelas fontes listadas. Verifique sempre na publicação original se nomes, datas e circunstâncias correspondem exatamente ao conteúdo recebido.',
      providerAttribution: attributionParts.join(' + '),
      externalProviderConfigured: Boolean(FACT_CHECK_API_KEY),
      evidences: combinedEvidences,
      consultedDirectories: OFFICIAL_DIRECTORIES,
    };
    return reply.status(200).send(foundResponse);
  }

  const providerNote = FACT_CHECK_API_KEY
    ? 'Consultamos a API de agências de checagem (Google Fact Check Tools) e a base institucional de esclarecimentos do TSE.'
    : 'Consultamos a base de esclarecimentos oficiais do TSE.';

  const insufficientResponse: VerificationApiResponse = {
    outcome: 'insufficient_evidence',
    claimAssessment: 'unverified',
    headline: 'Evidência insuficiente nas bases consultadas',
    explanation: `Não encontramos checagem ou comunicado oficial correspondente a este conteúdo específico. ${providerNote}`,
    limitationNote:
      'A ausência de correspondência não confirma nem comprova falsidade. Evite compartilhar conteúdo não verificado e consulte diretamente os portais oficiais abaixo.',
    providerAttribution: FACT_CHECK_API_KEY
      ? 'Google Fact Check Tools API + Base oficial TSE'
      : 'Base de esclarecimentos oficiais da Justiça Eleitoral (TSE)',
    externalProviderConfigured: Boolean(FACT_CHECK_API_KEY),
    evidences: [],
    consultedDirectories: OFFICIAL_DIRECTORIES,
  };

  return reply.status(200).send(insufficientResponse);
});

// Entrega estática do front-end compilado (dist/) com fallback SPA em produção
app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  if (
    request.url.startsWith('/api/') ||
    (request.method !== 'GET' && request.method !== 'HEAD')
  ) {
    return reply.status(404).send({ error: 'Rota não encontrada.' });
  }

  try {
    const cleanPath = decodeURIComponent(request.url.split('?')[0]);
    const requestedFile = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, '');
    const resolvedFile = path.resolve(distDir, requestedFile);

    // Proteção contra travessia de diretórios
    if (!resolvedFile.startsWith(distDir)) {
      return reply.status(403).send({ error: 'Acesso negado.' });
    }

    try {
      const stat = await fs.stat(resolvedFile);
      if (stat.isFile()) {
        const ext = path.extname(resolvedFile).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const isHashedAsset = cleanPath.startsWith('/assets/');

        reply.header('Content-Type', contentType);
        reply.header(
          'Cache-Control',
          isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache'
        );

        if (request.method === 'HEAD') {
          return reply.status(200).send();
        }
        const content = await fs.readFile(resolvedFile);
        return reply.status(200).send(content);
      }
    } catch {
      // Se tiver extensão explícita (ex.: .js/.png inexistente), retorna 404
      if (path.extname(cleanPath) !== '') {
        return reply.status(404).send({ error: 'Arquivo não encontrado.' });
      }
    }

    // Fallback SPA para rotas da aplicação React
    const indexHtmlPath = path.join(distDir, 'index.html');
    const htmlContent = await fs.readFile(indexHtmlPath);
    reply.header('Content-Type', 'text/html; charset=utf-8');
    reply.header('Cache-Control', 'no-cache');
    if (request.method === 'HEAD') {
      return reply.status(200).send();
    }
    return reply.status(200).send(htmlContent);
  } catch {
    return reply.status(404).send({
      error: 'Arquivos de produção do front-end ainda não foram gerados (execute npm run build).',
    });
  }
});

if (process.env.VOTO_CLARO_SKIP_LISTEN !== '1') {
  app
    .listen({ port: PORT, host: HOST })
    .then(() => {
      console.log(`[voto-claro] Servidor ativo em http://${HOST}:${PORT}`);
    })
    .catch((err) => {
      console.error('[voto-claro] Erro ao iniciar servidor:', err);
      process.exit(1);
    });
}

export { app };
