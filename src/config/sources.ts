import type { QuizQuestion, TrustedSource } from '../types';

/**
 * Canais oficiais e agências de checagem reconhecidas para consulta direta.
 */
export const TRUSTED_SOURCES: TrustedSource[] = [
  {
    id: 'fato-ou-boato',
    name: 'Fato ou Boato — Justiça Eleitoral',
    description: 'Canal oficial da Justiça Eleitoral dedicado ao esclarecimento de informações sobre eleições.',
    url: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
  },
  {
    id: 'tse',
    name: 'Justiça Eleitoral (TSE)',
    description: 'Portal oficial do Tribunal Superior Eleitoral com normas, comunicados e serviços ao eleitor.',
    url: 'https://www.tse.jus.br/',
  },
  {
    id: 'lupa',
    name: 'Agência Lupa',
    description: 'Agência de checagem jornalística independente para conferência de declarações públicas.',
    url: 'https://lupa.uol.com.br/',
  },
  {
    id: 'aos-fatos',
    name: 'Aos Fatos',
    description: 'Organização jornalística dedicada à verificação de fatos e monitoramento de desinformação.',
    url: 'https://www.aosfatos.org/',
  },
];

/**
 * Endereços oficiais do TSE para encaminhamento consciente de possíveis irregularidades.
 */
export const OFFICIAL_TSE_REPORTING_URLS = {
  pardal: 'https://www.tse.jus.br/eleicoes/pardal-eleicoes-2026',
  siade: 'https://www.tse.jus.br/eleicoes/sistema-de-alertas',
  guidance:
    'https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/encontrou-desinformacao-sobre-as-eleicoes-saiba-como-denunciar-ao-tse',
} as const;

export const POINTS_PER_QUESTION = 10;

export interface QuizProgressTier {
  title: string;
  encouragement: string;
  practicalTip: string;
}

export function getQuizProgressTier(score: number): QuizProgressTier {
  if (score >= 80) {
    return {
      title: 'Guia da checagem',
      encouragement:
        'Excelente percurso! Você aplicou passos consistentes para localizar fontes originais, datas e canais oficiais antes de agir.',
      practicalTip:
        'Dica prática: mesmo quando o tema parecer familiar, abra a publicação original e confirme data, local e contexto completo antes de comentar ou repassar.',
    };
  }
  if (score >= 40) {
    return {
      title: 'Rastreador de fontes',
      encouragement:
        'Bom avanço! Você já reconhece boa parte dos cuidados necessários para confirmar informações eleitorais com segurança.',
      practicalTip:
        'Dica prática: desconfie de capturas de tela isoladas e procure sempre o documento ou comunicado diretamente nos portais oficiais `.jus.br` ou em agências de checagem.',
    };
  }
  return {
    title: 'Começando a checar',
    encouragement:
      'Todo cuidado começa pela prática! Rever cada explicação ajuda a criar o hábito de pausar e consultar fontes confiáveis.',
    practicalTip:
      'Dica prática: quando uma mensagem pedir pressa ou provocar alarme, faça uma pausa e pesquise o assunto no Fato ou Boato do TSE antes de qualquer decisão.',
  };
}

/**
 * Conjunto inicial de 10 perguntas originais do Desafio da Checagem (Voto Claro).
 * Foco: qual é o próximo passo mais seguro para verificar a informação.
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Local e horário de votação',
    question:
      'Você recebe no celular um aviso urgente dizendo que o horário e os locais de votação da sua cidade mudaram hoje. Qual é o próximo passo mais seguro para verificar?',
    alternatives: [
      {
        id: 'q1-a',
        label: 'Encaminhar o aviso para vizinhos e parentes enquanto tenta descobrir quem escreveu.',
        isCorrect: false,
      },
      {
        id: 'q1-b',
        label: 'Consultar diretamente sua seção e os comunicados nos canais oficiais do TSE, do TRE ou no app e-Título.',
        isCorrect: true,
      },
      {
        id: 'q1-c',
        label: 'Confiar no aviso caso venha acompanhado de um áudio grave e muitas visualizações.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Ação segura! Mudanças em seção, zona ou horário de votação são sempre publicadas nos canais oficiais da Justiça Eleitoral (TSE, TREs e e-Título), nunca apenas por mensagens encaminhadas.',
    explanationIncorrect:
      'Visualizações ou tom urgente não comprovam nada. Para confirmar local e horário de votação com segurança, consulte diretamente o portal do TSE, seu TRE ou o aplicativo oficial e-Título.',
    sourceLabel: 'Consulta oficial de local de votação — TSE',
    sourceUrl: 'https://www.tse.jus.br/servicos-eleitorais/local-de-votacao-zonas-eleitorais',
  },
  {
    id: 'q2',
    topic: 'Captura de tela sem origem',
    question:
      'Em um grupo aparece apenas o recorte de imagem (print) de uma manchete polêmica sobre eleições, sem link, nome de quem publicou nem data visível. Qual passo você deve dar?',
    alternatives: [
      {
        id: 'q2-a',
        label: 'Acessar diretamente o portal de notícias citado e canais oficiais para procurar se a matéria existe e quando saiu.',
        isCorrect: true,
      },
      {
        id: 'q2-b',
        label: 'Aceitar a imagem como prova suficiente porque mostra cores e logotipo parecidos com os de um jornal.',
        isCorrect: false,
      },
      {
        id: 'q2-c',
        label: 'Pedir opinião apenas nos comentários da própria postagem para decidir se é real.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Bem pensado! Capturas de tela podem omitir datas ou sofrer montagem visual. Ir direto ao veículo citado e a fontes oficiais permite verificar se o conteúdo realmente foi publicado.',
    explanationIncorrect:
      'Aparência visual em um print não garante autenticidade. O passo seguro é buscar o texto completo, a autoria e a data diretamente no site original ou em agências de checagem.',
    sourceLabel: 'Fato ou Boato — Justiça Eleitoral',
    sourceUrl: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
  },
  {
    id: 'q3',
    topic: 'Pressão por repasse imediato',
    question:
      'Uma corrente afirma revelar um escândalo eleitoral secreto, não indica nenhuma fonte verificável e termina com "repasse agora antes que apaguem". Qual é a atitude mais segura?',
    alternatives: [
      {
        id: 'q3-a',
        label: 'Salvar e reenviar rapidamente para não perder a informação caso suma da rede.',
        isCorrect: false,
      },
      {
        id: 'q3-b',
        label: 'Presumir que é verdade se o texto for longo e usar palavras jurídicas difíceis.',
        isCorrect: false,
      },
      {
        id: 'q3-c',
        label: 'Não repassar no impulso e pesquisar a alegação em canais oficiais e agências de checagem.',
        isCorrect: true,
      },
    ],
    explanationCorrect:
      'Escolha certa! Pedidos de compartilhamento imediato sem fonte verificável buscam impedir que você confira os fatos. Pausar e pesquisar em fontes confiáveis protege contra boatos.',
    explanationIncorrect:
      'Textos longos ou urgentes sem fonte verificável não são evidência. Pare antes de agir e procure se há registro em órgãos oficiais ou checagens independentes.',
    sourceLabel: 'Fato ou Boato — Justiça Eleitoral',
    sourceUrl: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
  },
  {
    id: 'q4',
    topic: 'Registro de pesquisa eleitoral',
    question:
      'Um cartão colorido nas redes sociais mostra percentuais de intenção de voto, mas não traz número de registro, período de entrevistas nem margem de erro. Qual passo ajuda a verificar?',
    alternatives: [
      {
        id: 'q4-a',
        label: 'Conferir no sistema PesqEle do TSE se existe pesquisa registrada com instituto, contratante e metodologia.',
        isCorrect: true,
      },
      {
        id: 'q4-b',
        label: 'Confiar nos números se tiverem sido publicados por um perfil com muitos seguidores.',
        isCorrect: false,
      },
      {
        id: 'q4-c',
        label: 'Tratar qualquer enquete aberta de rede social como pesquisa eleitoral oficial.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Correto! Pela norma eleitoral, pesquisas divulgadas ao público devem possuir registro verificável no sistema PesqEle do TSE, informando metodologia, contratante e margem de erro.',
    explanationIncorrect:
      'Popularidade do perfil ou enquetes informais não substituem metodologia estatística nem registro legal. Confira sempre os dados oficiais no sistema PesqEle do TSE.',
    sourceLabel: 'Pesquisas eleitorais e sistema PesqEle — TSE',
    sourceUrl: 'https://www.tse.jus.br/eleicoes/pesquisas-eleitorais',
  },
  {
    id: 'q5',
    topic: 'Vídeo ou áudio possivelmente manipulado',
    question:
      'Circula um trecho curto de vídeo em que uma liderança pública parece fazer uma declaração grave, com cortes bruscos e voz metálica. Qual é o próximo passo mais seguro?',
    alternatives: [
      {
        id: 'q5-a',
        label: 'Concluir pelo vídeo curto que a fala ocorreu exatamente daquele modo.',
        isCorrect: false,
      },
      {
        id: 'q5-b',
        label: 'Procurar a gravação integral em canais oficiais, imprensa profissional e agências de checagem.',
        isCorrect: true,
      },
      {
        id: 'q5-c',
        label: 'Julgar apenas pela qualidade da imagem: se estiver nítida, não pode ter sido editada.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Exato! Nem um detalhe isolado nem a nitidez provam sozinhos se há edição ou síntese por IA. Buscar o vídeo original completo e checagens técnicas mostra o real contexto.',
    explanationIncorrect:
      'Edições fora de contexto e recursos de inteligência artificial podem imitar vozes e cenas nítidas. Compare sempre com registros integrais em fontes confiáveis e checagens.',
    sourceLabel: 'Agência Lupa — Verificação independente',
    sourceUrl: 'https://lupa.uol.com.br/',
  },
  {
    id: 'q6',
    topic: 'Link suspeito sobre título eleitoral',
    question:
      'Você recebe por SMS um link encurtado exigindo pagamento imediato via Pix para impedir o bloqueio do seu título eleitoral ainda hoje. Qual ação é a mais segura?',
    alternatives: [
      {
        id: 'q6-a',
        label: 'Não abrir o link recebido e verificar sua situação diretamente em `tse.jus.br` ou no aplicativo oficial e-Título.',
        isCorrect: true,
      },
      {
        id: 'q6-b',
        label: 'Abrir o link e digitar seus dados pessoais apenas para ver o valor cobrado.',
        isCorrect: false,
      },
      {
        id: 'q6-c',
        label: 'Realizar o pagamento pelo link da mensagem para evitar fila no cartório.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Perfeito! A Justiça Eleitoral não envia cobranças urgentes por SMS ou mensageiros. Consultar por conta própria o Autoatendimento Eleitoral em `tse.jus.br` ou o app e-Título evita golpes.',
    explanationIncorrect:
      'Links de cobrança enviados por mensagem costumam ser tentativas de golpe. Nunca informe dados nem pague por fora do Autoatendimento Eleitoral oficial do TSE ou do e-Título.',
    sourceLabel: 'Autoatendimento Eleitoral oficial — TSE',
    sourceUrl: 'https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral',
  },
  {
    id: 'q7',
    topic: 'Regra sobre votos brancos e nulos',
    question:
      'Uma postagem garante que, se mais de 50% do eleitorado votar nulo ou em branco, a eleição inteira é cancelada e novos candidatos devem concorrer. Como checar essa alegação?',
    alternatives: [
      {
        id: 'q7-a',
        label: 'Conferir a regra de contagem de votos válidos nos esclarecimentos oficiais do TSE, que demonstram que brancos e nulos não anulam o pleito.',
        isCorrect: true,
      },
      {
        id: 'q7-b',
        label: 'Aceitar a postagem porque muita gente repete essa frase em toda eleição.',
        isCorrect: false,
      },
      {
        id: 'q7-c',
        label: 'Assumir que a regra muda informalmente conforme os comentários nas redes sociais.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Correto! Ao consultar o TSE e a legislação vigente, confirma-se que votos brancos e nulos não entram nos votos válidos e não cancelam a eleição mesmo passando de 50%.',
    explanationIncorrect:
      'Repetição popular não cria regra eleitoral. As normas de apuração devem ser conferidas na Justiça Eleitoral, onde consta que votos brancos e nulos não anulam a eleição.',
    sourceLabel: 'Esclarecimentos oficiais — Fato ou Boato (TSE)',
    sourceUrl: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
  },
  {
    id: 'q8',
    topic: 'Conteúdo antigo fora de época',
    question:
      'Um vídeo real de fila em seção eleitoral volta a circular como se tivesse acontecido neste fim de semana, gerando alarme. Qual é o próximo passo para verificar o contexto?',
    alternatives: [
      {
        id: 'q8-a',
        label: 'Como o vídeo é real e não tem montagem, considerar que aconteceu hoje mesmo.',
        isCorrect: false,
      },
      {
        id: 'q8-b',
        label: 'Pesquisar a data original da gravação, o local do fato e comunicados atuais do TRE/TSE ou de checadores.',
        isCorrect: true,
      },
      {
        id: 'q8-c',
        label: 'Olhar apenas os comentários mais recentes para confirmar se foi hoje.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Muito bem! Imagens verdadeiras de anos anteriores frequentemente são republicadas fora de contexto como se fossem atuais. Conferir data e local originais esclarece o episódio.',
    explanationIncorrect:
      'Um vídeo autêntico de outro ano pode enganar quando apresentado como atual. Sempre verifique quando e onde a cena ocorreu originalmente.',
    sourceLabel: 'Aos Fatos — Checagem de contexto e datas',
    sourceUrl: 'https://www.aosfatos.org/',
  },
  {
    id: 'q9',
    topic: 'Citação sem link para a fonte original',
    question:
      'Um texto diz "Segundo nova resolução publicada ontem pelo TSE..." para sustentar uma proibição surpreendente, mas não traz link nem número da norma. Como proceder?',
    alternatives: [
      {
        id: 'q9-a',
        label: 'Acreditar imediatamente porque o texto mencionou a sigla do TSE.',
        isCorrect: false,
      },
      {
        id: 'q9-b',
        label: 'Entrar diretamente no portal oficial do TSE e buscar se essa resolução ou notícia realmente foi publicada.',
        isCorrect: true,
      },
      {
        id: 'q9-c',
        label: 'Descartar como mentira sem pesquisar apenas porque parece surpreendente.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Passo certeiro! Citar o nome de um órgão público não prova que ele disse aquilo — e estranhar também não substitui a checagem. Buscar a publicação original no portal do TSE resolve a dúvida com base documental.',
    explanationIncorrect:
      'Mensagens enganosas costumam citar órgãos oficiais sem mostrar o documento original. Acesse diretamente `tse.jus.br` para conferir se o ato existe e o que ele realmente diz.',
    sourceLabel: 'Portal oficial do Tribunal Superior Eleitoral',
    sourceUrl: 'https://www.tse.jus.br/',
  },
  {
    id: 'q10',
    topic: 'Quando ainda faltam evidências',
    question:
      'Você pesquisou um rumor recente em portais oficiais e agências de checagem, mas ainda não há confirmação nem desmentido publicado com provas. Qual é a conduta mais responsável?',
    alternatives: [
      {
        id: 'q10-a',
        label: 'Reconhecer que a informação ainda não tem evidência suficiente, não compartilhar como fato e aguardar apuração em fontes confiáveis.',
        isCorrect: true,
      },
      {
        id: 'q10-b',
        label: 'Cravar por conta própria que é 100% verdadeiro porque ninguém desmentiu ainda.',
        isCorrect: false,
      },
      {
        id: 'q10-c',
        label: 'Inventar detalhes que faltam para avisar logo seus contatos.',
        isCorrect: false,
      },
    ],
    explanationCorrect:
      'Excelente! Quando ainda não há evidência verificável, o mais honesto e seguro é não transformar rumor em certeza nem repassá-lo adiante até que fontes confiáveis apurem os fatos.',
    explanationIncorrect:
      'A falta momentânea de checagem não transforma um rumor em verdade confirmada. Sem evidências sólidas, evite compartilhar e acompanhe os canais oficiais.',
    sourceLabel: 'Fato ou Boato — Justiça Eleitoral',
    sourceUrl: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
  },
];
