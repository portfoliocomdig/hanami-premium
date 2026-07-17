# Deploy do backend em uma VM de 512MB (CD)

Cenário: o GitHub Actions já faz o **CI** (testa, builda e publica a imagem
`ghcr.io/portfoliocomdig/hanami-premium/backend:latest`). A VM do professor
faz o **CD**: só precisa puxar essa imagem pronta e rodar. Nada de build,
Node.js ou npm instalado na VM — só Docker.

Como a VM tem apenas 512MB, o banco de dados **não roda nela** — usamos um
PostgreSQL gerenciado gratuito (Neon.tech é o mais simples). O front-end
também não roda na VM — fica no GitHub Pages. A VM sobe só 1 container.

## 1. Criar o banco gratuito (Neon)

1. Crie uma conta em https://neon.tech (tem free tier permanente, não é trial).
2. Crie um projeto → copie a *connection string* completa (algo como
   `postgresql://usuario:senha@ep-xxx.neon.tech/hanami_db?sslmode=require`).
3. Guarde essa string — ela vai direto na variável `DATABASE_URL` no passo 4,
   sem precisar quebrar em host/usuário/senha separados.

## 2. Preparar a VM (uma vez só)

```bash
ssh usuario@ip-da-vm

# Instala o Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# Cria um swap de 512MB — rede de segurança contra OOM kill, essencial
# em VMs com pouca RAM (o kernel usa disco como memória de emergência)
sudo fallocate -l 512M /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 3. Autenticar no GitHub Container Registry

Se o pacote `backend` estiver privado (padrão do GHCR):
```bash
# Gere um token em github.com/settings/tokens com escopo "read:packages"
echo SEU_TOKEN_GITHUB | docker login ghcr.io -u SEU_USUARIO_GITHUB --password-stdin
```
Ou torne o pacote público em *seu perfil → Packages → backend → Package
settings → Change visibility* — aí nenhum login é necessário.

## 4. Rodar o container

```bash
docker run -d \
  --name hanami-backend \
  --restart unless-stopped \
  --memory 320m \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e CLIENT_URL=https://portfoliocomdig.github.io/hanami-premium \
  -e DATABASE_URL="postgresql://usuario_neon:senha_neon@ep-xxx.neon.tech/hanami_db?sslmode=require" \
  -e JWT_SECRET=troque_por_um_segredo_forte \
  -e PAGBANK_API_URL=https://sandbox.api.pagseguro.com \
  -e PAGBANK_TOKEN=seu_token_pagbank \
  ghcr.io/portfoliocomdig/hanami-premium/backend:latest
```

Cole a *connection string* exatamente como o Neon te entregou em `DATABASE_URL`
— o `database.js` já detecta esse formato automaticamente (inclusive o SSL
exigido pelo Neon), sem precisar quebrar host/usuário/senha em variáveis
separadas.

`--memory 320m` impede que esse container sozinho consuma toda a RAM da VM
e derrube o SO — combinado com o `NODE_OPTIONS=--max-old-space-size=256` que
já vem definido no `Dockerfile`, o processo Node fica com uma margem segura.

## 5. Popular o banco (primeira vez)

```bash
docker exec hanami-backend npm run seed
```

## 6. Verificar

```bash
curl http://ip-da-vm:3001/health
# { "status": "ok", "timestamp": "..." }
```

## 7. Redeploy (toda vez que o GitHub Actions publicar uma imagem nova)

```bash
docker pull ghcr.io/portfoliocomdig/hanami-premium/backend:latest
docker stop hanami-backend && docker rm hanami-backend
# repita o comando `docker run` do passo 4
```

Se quiser, isso pode virar um script `redeploy.sh` de uma linha na VM, ou até
ser automatizado via SSH Action no próprio workflow do GitHub Actions — me
avise se for esse o próximo passo que você quer.
