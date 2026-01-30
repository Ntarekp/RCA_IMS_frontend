#!/bin/sh

# Generate env-config.js from environment variables
echo "window.env = {" > /usr/share/nginx/html/env-config.js
# Use VITE_API_URL if set, otherwise default to /api
API_URL=${VITE_API_URL:-/api}
echo "  VITE_API_URL: \"${API_URL}\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Inject BACKEND_API_URL into nginx.conf
# Defaults to http://backend:8080/ims/api/ if not set
export BACKEND_API_URL=${BACKEND_API_URL:-http://backend:8080/ims/api/}
# Use envsubst to replace the variable in nginx.conf
# We only substitute BACKEND_API_URL to avoid breaking other $ variables (like $host)
envsubst '${BACKEND_API_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp && mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Execute the CMD
exec "$@"
