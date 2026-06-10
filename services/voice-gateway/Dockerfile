# Voice gateway — container image for an always-on host (Render/Fly/Railway/VM).
# NOT serverless: Twilio Media Streams are long-lived WebSockets.
FROM node:22-slim

WORKDIR /app

# Install deps first (better layer caching). tsx is the runtime runner, so install all deps.
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY tsconfig.json ./
COPY src ./src
# Optional: bake a tenants file into the image, or mount/Set TENANTS_FILE at runtime.
# COPY tenants.json ./tenants.json

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Health: GET /healthz returns 200. Start the HTTP + WS server.
CMD ["npm", "start"]
