# Specify the base image
FROM node:22-bullseye

# Set the working directory in the container
WORKDIR /app

# Install dependencies (leverage Docker cache)
COPY package*.json ./

# Install autoprefixer, postcss, and tailwindcss explicitly
RUN npm install && \
    npm install --save-dev autoprefixer postcss tailwindcss @tailwindcss/postcss ts-node prettier globby

# Create scripts directory
RUN mkdir -p scripts

# Copy the sitemap generator script first
COPY scripts/generate-sitemap.ts ./scripts/
COPY tsconfig.node.json ./tsconfig.node.json

# Copy the rest of the application code
COPY . .

# Create necessary configuration files if they don't exist
RUN if [ ! -f next.config.js ]; then \
    echo "/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;" > next.config.ts; \
    fi

RUN if [ ! -f tailwind.config.js ]; then \
    echo "/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ['./src/**/*.{js,ts,jsx,tsx}'],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};" > tailwind.config.js; \
    fi

# Copy the updated postcss.config.js
COPY postcss.config.js ./postcss.config.js

# Expose the port the app runs on
EXPOSE 3000

# Update package.json to fix the sitemap generation
RUN if grep -q "\"generate-sitemap\":" package.json; then \
    sed -i 's#"generate-sitemap": "ts-node --project tsconfig.node.json scripts/generate-sitemap.ts"#"generate-sitemap": "ts-node --project tsconfig.node.json ./scripts/generate-sitemap.ts"#g' package.json; \
    fi

# Build the Next.js application
RUN npm run build || (echo "Build failed but continuing to debug" && exit 0)

# Command to run the application
# For production, you should use 'start' instead of 'dev'
CMD ["npm", "run", "start"]