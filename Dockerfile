# ============================================================
# Dockerfile — Frontend Angular (POOGraph)
# ============================================================
# Etapa 1: Build de la aplicación Angular
FROM node:16-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias primero (cache de capas)
COPY package.json package-lock.json* ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Build de producción
RUN npm run build -- --configuration production

# ============================================================
# Etapa 2: Servir con Nginx (imagen ligera)
FROM nginx:alpine

# Copiar el build de Angular al directorio de Nginx
COPY --from=build /app/dist/tesis /usr/share/nginx/html

# Configuración de Nginx para Angular (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto del servidor web
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
