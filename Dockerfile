FROM node:22-bookworm-slim AS ui
WORKDIR /src/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

FROM rust:1-bookworm AS build
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
COPY crates crates
COPY vendor vendor
COPY src-tauri src-tauri
COPY --from=ui /src/ui/dist ui/dist
RUN cargo build --release --locked -p fishtorrnet-server

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --uid 1000 --create-home fishtorrnet \
    && mkdir -p /config /downloads \
    && chown fishtorrnet:fishtorrnet /config /downloads
COPY --from=build /src/target/release/fishtorrnet-server /usr/local/bin/fishtorrnet-server
ENV FISHTORRNET_CONFIG_DIR=/config \
    FISHTORRNET_DOWNLOAD_DIR=/downloads \
    FISHTORRNET_LISTEN=0.0.0.0:8787
VOLUME ["/config", "/downloads"]
EXPOSE 8787 51420/tcp 51420/udp
USER fishtorrnet
ENTRYPOINT ["fishtorrnet-server"]
