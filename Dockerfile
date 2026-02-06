# Dockerfile para produção
FROM node:18-alpine

# Configurar diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Remover dev dependencies
RUN npm prune --production

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Mudar ownership dos arquivos
USER nestjs

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/main"]