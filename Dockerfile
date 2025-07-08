# This Dockerfile is a modified version of the one suggested by Puppeteer:
# https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile
# For more information on running Puppeteer in Docker, see:
# https://pptr.dev/troubleshooting#running-puppeteer-in-docker

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}

ARG HOST=0.0.0.0
ARG PORT=8087

ENV \
    # Configure default locale (important for chrome-headless-shell).
    LANG=en_US.UTF-8 \
    # UID of the non-root user 'pptruser'
    PPTRUSER_UID=10042

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer installs, work.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        # Base puppeteer dependencies
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-khmeros \
        fonts-kacst \
        fonts-freefont-ttf \
        dbus \
        dbus-x11 \
        # Custom dependencies
        fonts-noto-color-emoji \
        fonts-roboto

# Add pptruser
RUN groupadd -r pptruser && useradd -u $PPTRUSER_UID -rm -g pptruser -G audio,video pptruser

# Set up application directory (as root for build)
WORKDIR /app

# Set DBUS environment
ENV DBUS_SESSION_BUS_ADDRESS=autolaunch:

# Set runtime environment variables from build args (can be overridden at build or runtime)
ENV HOST=${HOST}
ENV PORT=${PORT}

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source code and build
COPY . .
RUN npm run build

# Overriding the cache directory to install the deps for the Chrome
# version installed for pptruser. 
RUN PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
  npx puppeteer browsers install chrome --install-deps

# Clean up development dependencies and cache
RUN npm prune --production && npm cache clean --force

# Change ownership of directories to pptruser
RUN chown -R pptruser:pptruser /app /home/pptruser

# Switch to non-root user for runtime
USER $PPTRUSER_UID

# Expose the port
EXPOSE 8087

# Start the application
CMD ["npm", "start"] 
