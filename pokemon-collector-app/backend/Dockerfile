# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm i

# Copiar código fuente (sin .env, se usa el de docker-compose)
COPY server.js app.js ./
COPY routes ./routes
COPY middleware ./middleware
COPY controllers ./controllers
COPY config ./config
COPY scripts ./scripts

# Generar Prisma Client para PostgreSQL
RUN npx prisma generate

# Imagen de producción
FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL en producción
RUN apk add --no-cache openssl

# Copiar dependencias y código
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.js ./
COPY --from=builder /app/app.js ./
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/config ./config
COPY --from=builder /app/scripts ./scripts

# Exponer puerto
EXPOSE 3001

# Script de inicio que ejecuta migraciones y arranca el servidor
CMD npx prisma migrate deploy && node scripts/seedRarities.js && node server.js
