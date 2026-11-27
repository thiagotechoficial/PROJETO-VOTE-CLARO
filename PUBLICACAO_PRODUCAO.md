# Guia de Publicação em Produção (HTTPS) — Voto Claro

O projeto está configurado com **hospedagem unificada** (um único serviço Node.js/Fastify serve tanto o front-end compilado em `dist/` quanto os endpoints `/api/verify` e `/api/health` sob o mesmo domínio HTTPS) e também suporta **hospedagem separada** via `VITE_API_BASE_URL` e `ALLOWED_ORIGINS`.

---

## Opção A (Recomendada): Hospedagem Unificada HTTPS no Render, Railway ou Cloud Run

Nesta arquitetura, um único endereço HTTPS público serve o aplicativo móvel e a API, sem problemas de CORS e mantendo segredos restritos ao servidor:

1. Crie um repositório Git privado ou público com o conteúdo desta pasta (`voto-claro`).
2. **No Render (plano gratuito com HTTPS automático):**
   - Acesse `New +` -> `Blueprint` (que lerá automaticamente o arquivo `render.yaml`) **ou** `New Web Service`.
   - Comando de Build: `npm ci --include=dev && npm run build`
   - Comando de Inicialização: `npm start`
   - Health Check Path: `/api/health`
3. **Variáveis de ambiente no painel da plataforma (segredos do servidor):**
   - `NODE_ENV` = `production`
   - `FACT_CHECK_API_KEY` = *(opcional)* sua chave da Google Fact Check Tools API (nunca adicione `VITE_` a esta chave).
   - `PORT` é fornecida automaticamente pela plataforma.
4. **No Google Cloud Run / Fly.io / Railway:**
   - O `Dockerfile` na raiz já realiza o build multi-stage e inicia em `0.0.0.0` usando a porta `PORT` do ambiente.

---

## Opção B: Front-end Estático Separado da API (ex.: Vercel / Netlify + API Node)

Caso publique o front-end separado da API:

1. **No serviço da API (Render / Railway / Cloud Run):**
   - Defina `ALLOWED_ORIGINS=https://seu-dominio-frontend.app` (sem barra no final).
   - Defina `FACT_CHECK_API_KEY` se desejar consultas externas além da base oficial do TSE.
2. **No serviço do Front-end (Vercel / Netlify / Cloudflare Pages):**
   - Defina `VITE_API_BASE_URL=https://sua-api-publicada.app` antes do `npm run build`.
   - Diretório de saída: `dist`.
