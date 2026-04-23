# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the frontend
RUN npm run build

# Prune devDependencies to keep the image small
RUN npm prune --production

# Expose the port (Cloud Run sets PORT automatically, but 3000 is default)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
