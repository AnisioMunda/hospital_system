# ============================================================
# HospitalAO Frontend — Dockerfile (Multi-stage)
# ============================================================
#
# Stage 1 (development): Node.js com ng serve e hot-reload
# Stage 2 (builder):     Compila o Angular para produção
# Stage 3 (production):  Nginx serve os ficheiros compilados
# ============================================================


# ==============================================================
# STAGE 1 — development
# ==============================================================
# Usado pelo docker-compose.yml em desenvolvimento.
# O Angular CLI fica a monitorizar alterações nos ficheiros
# e recompila automaticamente quando mudas algo no código.
# ==============================================================
FROM node:20-alpine AS development

WORKDIR /app

# TRUQUE DE PERFORMANCE — igual ao backend:
# Copiar package.json e package-lock.json ANTES do código fonte.
# Se estes ficheiros não mudarem, o "npm ci" não corre de novo
# e as dependências são reutilizadas do cache Docker.
# Isto evita re-descarregar os ~300MB do node_modules.
COPY package.json package-lock.json ./

# "npm ci" é mais rigoroso que "npm install":
# - usa exactamente as versões do package-lock.json
# - mais rápido em CI/CD
# - falha se o package-lock.json não estiver sincronizado
RUN npm ci

# Copiar o resto do código (depois do npm ci para usar cache)
COPY . .

EXPOSE 4200

# Arrancar o servidor de desenvolvimento Angular
# "--host 0.0.0.0" = aceitar ligações de fora do container
#                    (necessário para aceder do teu browser)
# "--poll 2000"     = verificar alterações de ficheiros a cada 2s
#                    (necessário dentro do Docker no Windows/Mac)
CMD ["npx", "ng", "serve", \
     "--host", "0.0.0.0", \
     "--port", "4200", \
     "--poll", "2000"]


# ==============================================================
# STAGE 2 — builder
# ==============================================================
# Compila o Angular para produção:
# - Remove código não usado (tree-shaking)
# - Minifica HTML, CSS, JavaScript
# - Adiciona hashes aos nomes dos ficheiros (cache busting)
#   Ex: main.a3f2c1d8.js (muda quando o código muda)
# ==============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# "--configuration production" activa todas as optimizações
# "--output-path /dist" define onde os ficheiros ficam
RUN npx ng build \
    --configuration production \
    --output-path /dist


# ==============================================================
# STAGE 3 — production
# ==============================================================
# Imagem final: só Nginx com os ficheiros HTML/CSS/JS compilados.
# O Node.js não está presente — não é necessário para servir
# ficheiros estáticos. A imagem ocupa apenas ~25MB.
# ==============================================================
FROM nginx:alpine AS production

# Remover a configuração padrão do Nginx
# (serve uma página de boas-vindas que não queremos)
RUN rm /etc/nginx/conf.d/default.conf

# Copiar a nossa configuração customizada do Nginx
# (este ficheiro está explicado abaixo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os ficheiros compilados do Stage 2 para a pasta
# que o Nginx serve por defeito
COPY --from=builder /dist/browser /usr/share/nginx/html

EXPOSE 80

# Arrancar o Nginx em modo "foreground" (necessário no Docker)
CMD ["nginx", "-g", "daemon off;"]