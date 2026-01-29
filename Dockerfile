# Build stage
FROM node:20-alpine AS build
WORKDIR /app
# Copy only package.json to force fresh dependency resolution for Linux
COPY package.json ./
RUN npm install
COPY . .
# Set API URL to /api so it uses the Nginx proxy
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Run stage
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
