# ── Etapa 1: build da aplicação React com Vite ──────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_PAGBANK_PUBLIC_KEY=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PAGBANK_PUBLIC_KEY=$VITE_PAGBANK_PUBLIC_KEY
RUN npm run build

# ── Etapa 2: serve os arquivos estáticos com Nginx ──────────────────────
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
