# Stage 1: Base image with Node.js 22 and TypeScript
FROM node:22-alpine AS base

WORKDIR /app

# Stage 2: Builder - Install dependencies and build the project
FROM base AS builder

# Copy package files and install dependencies
COPY package*.json . 
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Stage 3: Production - Minimal runtime image
FROM base AS runner

WORKDIR /app

# Copy only the built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Expose the port of this container
EXPOSE 8000

# Start the server using the --watch flag for development
CMD ["npm", "start"]
