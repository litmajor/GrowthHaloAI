FROM mirror.gcr.io/library/node:20-alpine
WORKDIR /usr/src/app

# Install dependencies first to leverage cache (uses package-lock.json if present)
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --no-audit --no-fund \
	&& npm install prom-client rollup

# Copy server source
COPY server/ ./server
COPY shared/ ./shared

ENV PORT=5000
EXPOSE 5000

# Run dev server
CMD ["npm", "run", "dev:backend"]
