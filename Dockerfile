FROM oven/bun:1.4.4 AS build

WORKDIR /app

COPY package.json bun.lock tsconfig.json bunfig.toml ./
RUN bun install --frozen-lockfile

COPY src ./src
RUN bun run build:server

FROM oven/bun:1.4.4

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist/server ./dist/server

EXPOSE 3000
CMD ["bun", "run", "start"]
