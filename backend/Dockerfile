# ── Etapa única: imagem enxuta baseada em Node Alpine ──────────────────
FROM node:20-alpine

WORKDIR /usr/src/app

# Instala dependências primeiro (aproveita cache do Docker em rebuilds)
COPY package*.json ./
RUN npm install --omit=dev

# Copia o restante do código
COPY . .

ENV NODE_ENV=production
# Limita o heap do Node para caber com folga em uma VM de 512MB de RAM
ENV NODE_OPTIONS="--max-old-space-size=256"
EXPOSE 3001

# healthcheck simples usado pelo docker-compose
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
