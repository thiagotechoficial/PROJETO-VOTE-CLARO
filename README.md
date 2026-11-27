# Voto Claro

Aplicação web acessível (mobile-first) desenvolvida em **React + TypeScript + Vite** com API de checagem em **Node.js + TypeScript + Fastify** para apoiar a verificação de conteúdos eleitorais em fontes confiáveis.

## Funcionalidades principais

- **Verificar conteúdo eleitoral (`POST /api/verify`):**
  - Consulta a base verificável de esclarecimentos oficiais da Justiça Eleitoral (TSE) e, opcionalmente, a **Google Fact Check Tools API** (quando `FACT_CHECK_API_KEY` está configurada no servidor).
  - Distingue claramente entre **Checagem encontrada**, **Evidência insuficiente** (sem inventar veredito) e **Serviço indisponível / Falha técnica** (sem disfarçar mock como resultado real).
  - Apresenta atribuição da origem e links diretos para abrir cada publicação original.
  - Informa o processamento previamente e **não armazena histórico de textos consultados**.
- **Quiz educativo expandido:** 7 perguntas curtas com barra de progresso, feedback educativo imediato e resumo de conclusão.
- **Perfis de acessibilidade e temas:**
  - **Padrão:** identidade acolhedora em azul (`#2457A7`), teal (`#126E69`) e destaques quentes (`#F2C14E`), nos temas claro e escuro, com contrastes validados pelo WCAG AA.
  - **Visual:** alto contraste preservado (preto, branco e amarelo), tipografia ampliada e **leitura em voz alta** das telas e resultados usando a síntese de voz do navegador (`speechSynthesis`), além de semântica completa para leitores de tela.
  - **Auditiva:** avisos visuais estruturados e painel de Libras com **avatar humano** (declarando de forma transparente quando não há tradução real ativa).

## Como executar

```powershell
npm.cmd install
npm.cmd run dev
```

O comando `npm.cmd run dev` inicia simultaneamente a API Fastify (`http://127.0.0.1:3001`) e o front-end Vite (`http://localhost:5173` com proxy `/api`).

Consulte [INTEGRACAO_CHECAGEM.md](./INTEGRACAO_CHECAGEM.md) para detalhes sobre fontes, limites, privacidade e variáveis de ambiente.
