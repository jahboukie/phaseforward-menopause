FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../../shared-ecosystem-client/package.json ../shared-ecosystem-client/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .
COPY ../../shared-ecosystem-client ../shared-ecosystem-client

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]