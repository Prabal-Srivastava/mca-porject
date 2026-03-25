# Stage 1: Build the React frontend
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files first for better caching
COPY frontend/package*.json ./

# Use npm ci for a cleaner, more reliable build
RUN npm ci --no-audit --no-fund --legacy-peer-deps

# Copy the rest of the frontend source
COPY frontend/ ./

# Run the build with explicit memory limits and optimized flags
# We disable the vite-specific pre-bundling during build to avoid cytoscape hang
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build -- --emptyOutDir

# Stage 2: Serve the frontend with Nginx
FROM nginx:stable-alpine
# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy our custom Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
