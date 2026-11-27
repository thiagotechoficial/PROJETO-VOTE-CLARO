# Integração do Serviço de Checagem e Encaminhamento — Voto Claro

Este documento descreve a arquitetura, a avaliação explícita de alegações, os critérios para exibição dos canais de denúncia (**Pardal** e **SIADE**), as garantias de privacidade e a configuração necessária para `POST /api/verify`.

## 1. Arquitetura e Avaliação Explícita (`claimAssessment`)

- **Estado técnico (`outcome`):**
  - `match_found`: uma ou mais referências verificáveis foram encontradas.
  - `insufficient_evidence`: nenhuma correspondência suficiente foi encontrada nas bases consultadas.
  - `technical_failure`: indisponibilidade de rede ou erro HTTP no serviço (nenhum resultado é simulado).
- **Avaliação sustentada pela fonte (`claimAssessment`):**
  - `false`: a fonte consultada classifica a alegação inequivocamente como falsa ou boato.
  - `misleading`: a fonte consultada classifica a alegação como enganosa, fora de contexto ou parcialmente falsa.
  - `true`: a fonte consultada confirma a regra ou afirmação.
  - `unverified`: não há comprovação conclusiva ou evidência suficiente.
  - `unknown`: há orientação institucional relacionada ao tema, mas sem rótulo inequívoco de verdadeiro/falso para o texto livre informado.

## 2. Regra de Encaminhamento Oficial (Pardal e SIADE)

- O cartão **Próximos passos se você encontrou uma possível irregularidade** aparece **apenas** quando `outcome === 'match_found'` **e** `claimAssessment` é `false` ou `misleading`.
- Antes dos links, explica em linguagem simples que:
  - **Pardal** (`https://www.tse.jus.br/eleicoes/pardal-eleicoes-2026`) destina-se a possíveis irregularidades em **propaganda eleitoral** (exigindo identificação via e-Título ou Gov.br no serviço oficial).
  - **SIADE** (`https://www.tse.jus.br/eleicoes/sistema-de-alertas`) recebe alertas de desinformação capaz de afetar a **integridade do processo eleitoral ou da Justiça Eleitoral**.
  - O **Voto Claro não envia denúncias automaticamente**; a pessoa decide se o caso se enquadra e conclui o processo diretamente no canal oficial do TSE.

## 3. Privacidade e Execução

- As consultas em `POST /api/verify` são processadas apenas em memória durante a requisição (`logger: false`), sem gravação de histórico.
- Para iniciar a API Fastify e o front-end Vite simultaneamente:
  ```powershell
  npm.cmd run dev
  ```
- Para habilitar busca adicional em tempo real na **Google Fact Check Tools API** (apenas no servidor):
  ```powershell
  $env:FACT_CHECK_API_KEY="SUA_CHAVE_AQUI"
  npm.cmd run dev
  ```
