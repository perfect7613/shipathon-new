FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create data directory for SQLite
RUN mkdir -p data

# Start bot
CMD ["npm", "start"]
