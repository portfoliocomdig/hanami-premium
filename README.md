# Hanami — E-commerce (React + Express + Sequelize + PostgreSQL + PagBank)

Evolução do site estático original (`index-----.html` / `style.css` / `script.js`)
para uma aplicação full-stack, mantendo o mesmo layout e design.

Documentação detalhada:
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) — diagramas, decisões (Tree-of-Thought) e autoavaliação (Ralph Loop)
- [`docs/CRUD.md`](docs/CRUD.md) — tabela completa de endpoints REST

## Estrutura do repositório

```
hanami/
├── backend/          # API REST (Node.js, Express, Sequelize, PostgreSQL)
├── frontend/          # SPA (React + Vite)
├── docker-compose.yml # orquestra db + backend + frontend
├── .github/workflows/  # CI/CD (GitHub Actions)
└── docs/               # arquitetura e documentação de CRUD
```

## Rodando localmente com Docker (recomendado)

```bash
cp .env.example .env        # ajuste os segredos (JWT, token do PagBank)
docker compose up --build
```

- Front-end: http://localhost:8080
- Back-end (API): http://localhost:3001
- PostgreSQL: localhost:5432

Depois de subir os containers, popule o cardápio e crie o usuário admin:

```bash
docker compose exec backend npm run seed
```

## Rodando sem Docker (desenvolvimento)

### Back-end
```bash
cd backend
cp .env.example .env   # configure DB_* apontando para um PostgreSQL local
npm install
npm run seed            # popula produtos + cria admin@hanami.com.br / Admin@123
npm run dev              # http://localhost:3001
```

### Front-end
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Variáveis de ambiente do PagBank

1. Crie uma conta em https://developer.pagbank.com.br e gere um **token de
   autenticação** (sandbox) e sua **chave pública**.
2. Preencha `PAGBANK_TOKEN` no `backend/.env` e `VITE_PAGBANK_PUBLIC_KEY` no
   `frontend/.env`.
3. Use os [cartões de teste do PagBank](https://developer.pagbank.com.br) para
   simular aprovação/recusa sem cobrar de verdade.

## Deploy (CI/CD)

O workflow `.github/workflows/ci-cd.yml`, a cada push em `main`:
1. Roda os testes do back-end contra um PostgreSQL efêmero.
2. Builda o front-end (`vite build`) e publica em **GitHub Pages**.
3. Builda e publica a imagem Docker do back-end no **GitHub Container
   Registry** (`ghcr.io/<usuário>/<repo>/backend:latest`).

Para habilitar o GitHub Pages: *Settings → Pages → Source: GitHub Actions*.

> GitHub Pages hospeda apenas arquivos estáticos, então o back-end (que
> precisa de um processo Node.js rodando continuamente) é publicado como
> imagem Docker e deve ser executado em qualquer host que suporte Docker
> (ex.: uma VM própria rodando `docker compose up` com a imagem do GHCR).
> Essa decisão está detalhada na seção 5.1 de `docs/ARQUITETURA.md`.

## Autenticação e validação — resumo

- Senhas: hash com `bcryptjs` (nunca armazenadas em texto puro).
- Sessão: JWT (`Authorization: Bearer <token>`), expira em `JWT_EXPIRES_IN`.
- Validação de entrada: `express-validator` no back-end (fonte da verdade) +
  validação leve no React para feedback imediato ao usuário.
- Dados de cartão: criptografados no navegador pelo SDK do PagBank antes de
  qualquer chamada ao nosso back-end (reduz escopo PCI-DSS).

## Deploy completo (VSCode + GitHub + Docker + Nginx)

Guia passo a passo para publicar no repositório `portfoliocomdig/hanami-premium`
e colocar no ar em um servidor próprio (VPS) com Docker + Nginx + SSL.

### 1. Do VSCode para o GitHub

```bash
cd hanami                     # pasta raiz deste projeto, extraída do zip
git init
git remote add origin https://github.com/portfoliocomdig/hanami-premium.git
git add .
git commit -m "Full-stack Hanami: React, Express, Sequelize, PagBank, Docker, CI/CD"
git branch -M main
git push -u origin main
```

Se o repositório remoto já tiver commits (README inicial, licença etc.), primeiro
sincronize antes de dar push:
```bash
git pull origin main --allow-unrelated-histories
# resolva conflitos se aparecerem, depois:
git push -u origin main
```

No VSCode, a extensão **GitHub Pull Requests and Issues** (ou só o painel
"Source Control" nativo) já permite fazer isso pela interface, se preferir não
usar o terminal.

### 2. Configurar Secrets e Variables no GitHub (necessário para o CI/CD)

Em *Settings → Secrets and variables → Actions* no repositório:

**Secrets** (sensíveis):
- `VITE_PAGBANK_PUBLIC_KEY` — chave pública do PagBank usada no build do front-end

**Variables** (não sensíveis):
- `VITE_API_URL` — URL pública da sua API, ex.: `https://SEU_DOMINIO.com.br/api`

O `GITHUB_TOKEN` usado para publicar no GHCR já é gerado automaticamente pelo
GitHub Actions, não precisa configurar nada.

### 3. O que o workflow (`.github/workflows/ci-cd.yml`) faz automaticamente

A cada push em `main`:
1. Testa o back-end contra um PostgreSQL efêmero.
2. Builda o front-end e publica em GitHub Pages (se você habilitar em
   *Settings → Pages → Source: GitHub Actions* — opcional, veja passo 5).
3. Builda e publica **duas imagens Docker** no GitHub Container Registry:
   - `ghcr.io/portfoliocomdig/hanami-premium/backend:latest`
   - `ghcr.io/portfoliocomdig/hanami-premium/frontend:latest`

Por padrão, os pacotes publicados no GHCR ficam privados. Para o seu servidor
conseguir baixá-los, vá em *seu perfil → Packages → (cada pacote) → Package
settings → Change visibility → Public*, ou gere um token de acesso (`docker
login ghcr.io`) no servidor.

### 4. Deploy no servidor (VPS) com Docker + Nginx + SSL

No servidor (Ubuntu, por exemplo), com Docker e Docker Compose instalados:

```bash
# 1) Instalar Docker (se ainda não tiver)
curl -fsSL https://get.docker.com | sh

# 2) Trazer só os arquivos de orquestração (não precisa clonar o código-fonte
#    inteiro, já que as imagens vêm prontas do GHCR)
mkdir hanami-deploy && cd hanami-deploy
# copie estes 2 arquivos deste projeto para o servidor:
#   docker-compose.prod.yml
#   nginx/reverse-proxy.conf   (edite SEU_DOMINIO.com.br para o seu domínio real)

# 3) Configurar variáveis de ambiente de produção
cp .env.prod.example .env.prod
nano .env.prod   # preencha senhas, JWT_SECRET e token do PagBank de produção

# 4) Login no GitHub Container Registry (se os pacotes estiverem privados)
echo SEU_TOKEN_GITHUB | docker login ghcr.io -u SEU_USUARIO --password-stdin

# 5) Gerar o certificado SSL (primeira vez, antes do Nginx apontar para HTTPS)
docker run --rm -v certbot_certs:/etc/letsencrypt -v certbot_www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d SEU_DOMINIO.com.br -d www.SEU_DOMINIO.com.br --email voce@email.com --agree-tos

# 6) Subir tudo
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 7) Popular o banco (primeira vez)
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

Aponte o DNS do seu domínio (registro A) para o IP público do servidor antes
do passo 5, ou o Certbot não conseguirá validar o domínio.

Para atualizar depois de um novo push no GitHub (novas imagens no GHCR):
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### 5. Alternativa: front-end só no GitHub Pages (sem servidor próprio para ele)

Se preferir não servir o front-end pelo seu Nginx/VPS, pode publicar só ele no
GitHub Pages (gratuito) e manter apenas o back-end + banco no seu servidor:
1. *Settings → Pages → Source: GitHub Actions* no repositório — o job
   `deploy-pages` do workflow já cuida disso a cada push.
2. Remova o serviço `frontend` do `docker-compose.prod.yml` e ajuste o
   `nginx/reverse-proxy.conf` para não fazer proxy de `/`, mantendo só `/api`.
3. Configure `VITE_API_URL` (nas *Variables* do GitHub) apontando para o
   domínio/IP onde o back-end está publicado.



- Suíte de testes automatizados (Jest + Supertest) cobrindo os controllers.
- Fila (BullMQ/Redis) para processar webhooks do PagBank de forma assíncrona.
- Validação de assinatura do webhook do PagBank.
- Refresh tokens (atualmente só há access token de curta duração).
- Página de administração (CRUD de produtos) no front-end — hoje o CRUD de
  produtos existe apenas na API, testável via Postman/Insomnia.
