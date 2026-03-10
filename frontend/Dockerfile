# Stage 1: Build the React Application
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies - we intentionally don't copy package-lock.json 
# to avoid os-specific dependency issues with rollup (linux-x64-musl)
COPY package.json ./
# 使用加速站點，加速下載過程
RUN npm config set registry https://registry.npmmirror.com
RUN npm install

# Copy application code and build
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built output from stage 1 to Nginx's static file serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration containing API reverse proxy settings
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
