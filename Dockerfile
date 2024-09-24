# Etapa 1: Usando uma imagem base com Node.js 20 e Yarn
FROM node:20-alpine AS build

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos package.json e yarn.lock para o container
COPY package.json yarn.lock ./

# Instalar as dependências do projeto
RUN yarn install --frozen-lockfile

# Copiar o restante do código da aplicação para o container
COPY . .

# Rodar o build da aplicação NestJS
RUN yarn build

# Etapa 2: Imagem final para execução da aplicação
FROM node:20-alpine

# Definir o diretório de trabalho para a etapa de produção
WORKDIR /app

# Copiar os artefatos de build da etapa anterior
COPY --from=build /app/dist ./dist

# Copiar as dependências do projeto
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

# Expor a porta que a aplicação vai utilizar
EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]
