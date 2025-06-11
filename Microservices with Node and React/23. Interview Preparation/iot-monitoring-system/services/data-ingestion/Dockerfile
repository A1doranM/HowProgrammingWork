# Use Node.js LTS (Long Term Support) as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies 
# Using --omit=dev to exclude dev dependencies in production
RUN npm install --omit=dev

# Copy the source code
COPY . .

# Expose the port the app runs on
EXPOSE 3002

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "src/index.js"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1
