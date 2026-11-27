import type {
  ClaimAssessment,
  TrustedSourceRef,
  VerificationEvidenceItem,
} from './types.ts';

export interface OfficialClarificationEntry {
  id: string;
  title: string;
  publisher: string;
  rating: string;
  claimAssessment: ClaimAssessment;
  summary: string;
  url: string;
  anchorGroups: string[][];
  excludePhrases?: string[];
}

export const OFFICIAL_DIRECTORIES: TrustedSourceRef[] = [
  {
    id: 'fato-ou-boato',
    name: 'Fato ou Boato — Justiça Eleitoral (TSE)',
    description: 'Página oficial de esclarecimentos e checagens da Justiça Eleitoral.',
    url: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
  },
  {
    id: 'tse',
    name: 'Portal do Tribunal Superior Eleitoral (TSE)',
    description: 'Comunicados oficiais, normas eleitorais e serviços ao eleitor.',
    url: 'https://www.tse.jus.br/',
  },
  {
    id: 'lupa',
    name: 'Agência Lupa',
    description: 'Agência de checagem jornalística independente.',
    url: 'https://lupa.uol.com.br/',
  },
  {
    id: 'aos-fatos',
    name: 'Aos Fatos',
    description: 'Jornalismo investigativo e verificação independente de discursos públicos.',
    url: 'https://www.aosfatos.org/',
  },
];

/**
 * Base curada de checagens e esclarecimentos oficiais da Justiça Eleitoral (TSE).
 * Separa explicitamente alegações já desmentidas como falsas/enganosas pelo TSE
 * de afirmações verdadeiras confirmadas e de orientações normativas gerais ('unknown'),
 * nunca inventando avaliação sem respaldo inequívoco da fonte.
 */
export const TSE_OFFICIAL_CORPUS: OfficialClarificationEntry[] = [
  // Alegações desmentidas oficialmente pelo TSE como FALSAS ('false')
  {
    id: 'tse-boato-urna-internet-fraude',
    title: 'É falso que a urna eletrônica se conecte à internet ou possa ser invadida remotamente',
    publisher: 'Justiça Eleitoral — Fato ou Boato (TSE)',
    rating: 'Falso (Fato ou Boato — TSE)',
    claimAssessment: 'false',
    summary:
      'O TSE classifica como falsa a alegação de que urnas eletrônicas possuam acesso à internet, Wi-Fi ou Bluetooth ou sofram invasão remota. O equipamento funciona isolado de redes e emite Zerésima e Boletim de Urna auditáveis em cada seção.',
    url: 'https://www.tse.jus.br/eleicoes/urna-eletronica/seguranca-da-urna',
    anchorGroups: [
      ['urna', 'urnas'],
      [
        'conectada na internet',
        'conecta na internet',
        'tem internet',
        'tem wifi',
        'tem wi-fi',
        'hackeada',
        'invadida',
        'adulterada',
        'fraudada',
        'fraude nas urnas',
        'acesso remoto',
      ],
    ],
    excludePhrases: ['nao tem internet', 'nao se conecta', 'nao possui internet', 'sem internet'],
  },
  {
    id: 'tse-fato-urna-sem-internet',
    title: 'Confirmado pelo TSE: a urna eletrônica não tem conexão com a internet e é auditável',
    publisher: 'Tribunal Superior Eleitoral (TSE)',
    rating: 'Verdadeiro (Informação oficial do TSE)',
    claimAssessment: 'true',
    summary:
      'O TSE confirma que a urna eletrônica não possui placa de rede, Wi-Fi nem Bluetooth, permanece isolada de qualquer rede e conta com Boletim de Urna público, lacres físicos e Teste Público de Segurança.',
    url: 'https://www.tse.jus.br/eleicoes/urna-eletronica/seguranca-da-urna',
    anchorGroups: [
      ['urna', 'urnas'],
      ['nao tem internet', 'nao se conecta', 'nao possui internet', 'sem internet', 'boletim de urna', 'auditoria', 'auditavel', 'codigo-fonte'],
    ],
  },
  {
    id: 'tse-boato-voto-nulo-50',
    title: 'É falso que mais de 50% de votos brancos ou nulos anulem a eleição',
    publisher: 'Justiça Eleitoral — Fato ou Boato (TSE)',
    rating: 'Falso (Fato ou Boato — TSE)',
    claimAssessment: 'false',
    summary:
      'O Fato ou Boato do TSE esclarece que é falsa a corrente segundo a qual mais da metade de votos nulos ou em branco cancela a eleição e convoca novos candidatos. Pela Constituição e pelo Código Eleitoral, contam-se apenas os votos válidos.',
    url: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
    anchorGroups: [
      ['nulo', 'nulos', 'branco', 'brancos'],
      ['anula', 'anulam', 'anular', 'cancela', 'cancelam', 'cancelar', '50%', 'metade', 'nova eleicao'],
    ],
    excludePhrases: ['nao anula', 'nao anulam', 'nao cancela', 'nao cancelam'],
  },
  {
    id: 'tse-fato-voto-nulo-nao-anula',
    title: 'Confirmado pelo TSE: votos em branco e nulos não anulam a eleição',
    publisher: 'Justiça Eleitoral — Fato ou Boato (TSE)',
    rating: 'Verdadeiro (Regra oficial do TSE)',
    claimAssessment: 'true',
    summary:
      'A Justiça Eleitoral confirma que votos brancos e nulos não entram no cálculo dos votos válidos e não anulam o pleito, independentemente do percentual atingido.',
    url: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
    anchorGroups: [
      ['nulo', 'nulos', 'branco', 'brancos'],
      ['nao anula', 'nao anulam', 'nao cancela', 'nao cancelam'],
    ],
  },
  {
    id: 'tse-boato-biometria-quebra-sigilo',
    title: 'É falso que a biometria ou o terminal do mesário revelem em quem o eleitor votou',
    publisher: 'Justiça Eleitoral — Fato ou Boato (TSE)',
    rating: 'Falso (Fato ou Boato — TSE)',
    claimAssessment: 'false',
    summary:
      'Segundo o TSE, é falso que a identificação biométrica ou a digitação do título permita descobrir o voto do eleitor. O terminal do mesário apenas libera a urna, e o Registro Digital do Voto (RDV) grava cada voto de forma embaralhada, preservando o sigilo constitucional.',
    url: 'https://www.tse.jus.br/eleicoes/urna-eletronica/seguranca-da-urna',
    anchorGroups: [
      ['biometria', 'digital', 'cpf', 'mesario'],
      ['descobrir', 'revela', 'saber em quem', 'identifica o voto', 'rastreia', 'rastrear', 'vincula o voto'],
    ],
    excludePhrases: ['nao revela', 'nao identifica'],
  },
  {
    id: 'tse-boato-golpe-pix-titulo-cancelado',
    title: 'É falsa a cobrança por link ou mensagem ameaçando cancelamento imediato do título ou CPF',
    publisher: 'Tribunal Superior Eleitoral (TSE)',
    rating: 'Falso / Alerta de golpe (TSE)',
    claimAssessment: 'false',
    summary:
      'O TSE alerta que é falsa qualquer mensagem por SMS, WhatsApp ou redes sociais enviando links externos de pagamento para evitar bloqueio imediato de título ou CPF. Consultas e eventuais guias oficiais existem apenas no portal tse.jus.br e no app e-Título.',
    url: 'https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral',
    anchorGroups: [
      ['titulo', 'cpf', 'multa'],
      ['link', 'sms', 'whatsapp', 'pix urgente', 'bloquear hoje', 'cancelado hoje', 'pague agora', 'clique aqui'],
    ],
  },
  // Alegações enganosas / fora de contexto ('misleading')
  {
    id: 'tse-enganoso-enquete-como-pesquisa',
    title: 'É enganoso divulgar enquete informal ou números sem registro PesqEle como pesquisa eleitoral oficial',
    publisher: 'Tribunal Superior Eleitoral (TSE)',
    rating: 'Enganoso / Irregular segundo normas do TSE',
    claimAssessment: 'misleading',
    summary:
      'Apresentar sondagens informais de redes sociais ou gráficos sem registro no sistema PesqEle como se fossem pesquisas eleitorais oficiais induz o eleitor a erro e viola as normas da Justiça Eleitoral.',
    url: 'https://www.tse.jus.br/eleicoes/pesquisas-eleitorais',
    anchorGroups: [
      ['enquete', 'pesquisa', 'pesquisas', 'intencao de voto'],
      ['sem registro', 'falsa', 'inventada', 'enquete como pesquisa', 'sem pesqele', 'clandestina'],
    ],
  },
  // Orientações e normas institucionais gerais ('unknown' quando é consulta informativa, sem alegação falsa)
  {
    id: 'tse-orientacao-horario-local-votacao',
    title: 'Horário e local de votação devem ser confirmados diretamente nos canais oficiais do TSE',
    publisher: 'Tribunal Superior Eleitoral (TSE)',
    rating: 'Orientação institucional (TSE)',
    claimAssessment: 'unknown',
    summary:
      'A Justiça Eleitoral orienta conferir qualquer informação sobre seção, zona ou horário de votação diretamente no portal oficial do TSE ou no aplicativo e-Título, pois mudanças oficiais nunca dependem apenas de correntes em grupos.',
    url: 'https://www.tse.jus.br/servicos-eleitorais/local-de-votacao-zonas-eleitorais',
    anchorGroups: [
      ['horario', 'hora', 'local de votacao', 'secao eleitoral', 'zona eleitoral'],
      ['mudou', 'mudaram', 'alterado', 'alteraram', 'votacao', 'votar', 'fechar mais cedo', 'adiado', 'consultar'],
    ],
  },
  {
    id: 'tse-orientacao-pesquisa-registro',
    title: 'Como conferir o registro oficial de pesquisas eleitorais no sistema PesqEle do TSE',
    publisher: 'Tribunal Superior Eleitoral (TSE)',
    rating: 'Norma eleitoral oficial (TSE)',
    claimAssessment: 'unknown',
    summary:
      'Toda pesquisa eleitoral regular deve informar número de registro no TSE, empresa responsável, contratante, período de entrevistas, margem de erro e nível de confiança, todos consultáveis no sistema público PesqEle.',
    url: 'https://www.tse.jus.br/eleicoes/pesquisas-eleitorais',
    anchorGroups: [
      ['pesquisa', 'pesquisas', 'pesqele'],
      ['registro', 'registrada', 'conferir', 'consultar', 'margem de erro', 'instituto'],
    ],
  },
  {
    id: 'tse-orientacao-ia-deepfake',
    title: 'Regras eleitorais proíbem deepfakes para enganar eleitores e exigem identificação de IA',
    publisher: 'Justiça Eleitoral — Fato ou Boato (TSE)',
    rating: 'Norma eleitoral oficial (TSE)',
    claimAssessment: 'unknown',
    summary:
      'As resoluções do TSE vedam o uso de áudio ou vídeo fabricado/manipulado digitalmente (deepfake) para difundir fatos inverídicos sobre candidaturas ou sobre o pleito, exigindo rótulo explícito quando recursos sintéticos são empregados em propaganda.',
    url: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
    anchorGroups: [
      ['deepfake', 'inteligencia artificial', 'voz clonada', 'video manipulado', 'montagem'],
      ['candidato', 'candidatura', 'eleicao', 'eleitoral', 'video', 'audio', 'propaganda'],
    ],
  },
  {
    id: 'tse-orientacao-situacao-eleitoral',
    title: 'Consulta de situação do título e regularização pelo Autoatendimento Eleitoral do TSE',
    publisher: 'Tribunal Superior Eleitoral (TSE)',
    rating: 'Serviço oficial (TSE)',
    claimAssessment: 'unknown',
    summary:
      'Para verificar se o título está regular ou emitir guias oficiais de multa eleitoral, utilize exclusivamente o Autoatendimento Eleitoral em tse.jus.br ou o aplicativo oficial e-Título.',
    url: 'https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral',
    anchorGroups: [
      ['titulo', 'situacao eleitoral', 'e-titulo', 'etitulo', 'multa eleitoral'],
      ['cancelado', 'regularizar', 'consultar', 'quitacao', 'boleto', 'biometria'],
    ],
  },
  {
    id: 'tse-orientacao-documentos-votacao',
    title: 'Documentos oficiais com foto aceitos para votar e uso do e-Título',
    publisher: 'Tribunal Superior Eleitoral (TSE)',
    rating: 'Orientação oficial (TSE)',
    claimAssessment: 'true',
    summary:
      'Para votar, basta apresentar documento oficial com foto (RG/CIN, CNH, passaporte, carteira de trabalho ou identidade funcional). A via impressa do título não é obrigatória, e o e-Título com foto substitui o documento impresso.',
    url: 'https://www.tse.jus.br/servicos-eleitorais/servicos/aplicativo-e-titulo',
    anchorGroups: [
      ['documento', 'documentos', 'rg', 'cnh', 'e-titulo', 'etitulo', 'titulo impresso'],
      ['votar', 'obrigatorio', 'aceito', 'aceitos', 'levar no dia', 'sem titulo'],
    ],
  },
];

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchTseOfficialCorpus(query: string): VerificationEvidenceItem[] {
  const normalized = normalizeText(query);
  if (normalized.length < 4) return [];

  const scored: { entry: OfficialClarificationEntry; score: number }[] = [];

  for (const entry of TSE_OFFICIAL_CORPUS) {
    if (
      entry.excludePhrases &&
      entry.excludePhrases.some((phrase) => normalized.includes(normalizeText(phrase)))
    ) {
      continue;
    }

    let matchedAllGroups = true;
    let totalHits = 0;

    for (const group of entry.anchorGroups) {
      const groupHits = group.filter((term) => normalized.includes(normalizeText(term))).length;
      if (groupHits === 0) {
        matchedAllGroups = false;
        break;
      }
      totalHits += groupHits;
    }

    if (matchedAllGroups) {
      scored.push({ entry, score: totalHits });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(({ entry }) => ({
    id: entry.id,
    title: entry.title,
    publisher: entry.publisher,
    rating: entry.rating,
    claimAssessment: entry.claimAssessment,
    summary: entry.summary,
    url: entry.url,
  }));
}
