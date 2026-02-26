# Use official Node.js image as base
FROM node:20-alpine

# Install OpenSSL (required by Prisma engine)
RUN apk add --no-cache openssl

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY server/package*.json ./
RUN npm install --production

# Generate Prisma Client
COPY server/prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application code
COPY server/ .

# Expose port (must match PORT in env or Render defaults)
EXPOSE 5000

# Start command
CMD ["npm", "start"]
