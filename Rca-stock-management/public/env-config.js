// Runtime configuration
// In development, this file is served as-is.
// In production (Docker), this file is overwritten by docker-entrypoint.sh
window.env = {
  // Leave empty in dev to fall back to import.meta.env (VITE_API_URL)
  // which allows docker-compose.dev.yml to control it.
};