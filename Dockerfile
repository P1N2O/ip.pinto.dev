# Use official Bun image (small & fast)
FROM oven/bun:alpine

# Set working directory
WORKDIR /app

# Copy only what we need
COPY index.ts .

# Expose port
EXPOSE 3000

# Run server
CMD ["bun", "run", "index.ts"]
