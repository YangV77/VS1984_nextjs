# syntax=docker/dockerfile:1

############################
# Build stage
############################
FROM ubuntu:24.04 AS build
ARG DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# base tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git \
    && rm -rf /var/lib/apt/lists/*

# Node.js (LTS)
ARG NODE_MAJOR=20
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# install deps (cache-friendly)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    else npm install; fi

# copy source and build
COPY . .

RUN npm run build


############################
# Runtime stage
############################
FROM ubuntu:24.04 AS runtime
ARG DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# runtime libs:
# - libstdc++/libgcc: common for native addons + C++ deps
# - zlib: common dependency
# - libssl3: many native stacks need it
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    libstdc++6 libgcc-s1 libatomic1 \
    zlib1g libpng16-16 libssl3 \
    libpulse0 libasound2t64 libjack-jackd2-0 \
    libmicrohttpd12 \
    && rm -rf /var/lib/apt/lists/*


# Node.js runtime
ARG NODE_MAJOR=20
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Keep repo layout intact so your RUNPATH($ORIGIN/...) works.
COPY --from=build /app /app
RUN ln -sf /app/lib/native/vs1984-btd /usr/bin/vs1984-btd \
 && ln -sf /app/lib/native/vs1984-btd /usr/local/bin/vs1984-btd \
 && ln -sf /app/lib/native/vs1984-btd /app/vs1984-btd

# Ensure BT daemon is executable (in case git lost +x bit)
RUN chmod +x /app/lib/native/vs1984-btd || true

# Optional safety net (doesn't hurt even if RUNPATH is correct)
ENV LD_LIBRARY_PATH=/app/lib/native/lib:${LD_LIBRARY_PATH}

# VS1984 home (compose will bind-mount ./vshome here by default in my compose files)
ENV VS1984_HOME=/app/vshome

# Start Next.js (native addon will auto-start vs1984-btd when needed)
CMD ["npm", "run", "start"]
