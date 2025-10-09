FROM mirror.gcr.io/library/node:20-bullseye

WORKDIR /usr/src/app

# Copy package files from repo root and install dependencies once (cacheable layer)
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy frontend source
COPY client ./client

ENV PORT=3000
EXPOSE 3000

# Use the root dev script which changes directory into client
CMD ["npm", "run", "dev:frontend"]
