# VS1984 NextJS Demo

***Currently, only Ubuntu 24.04 is supported.***

## In Ubuntu24.04 you can simply run:
```bash
npm install && npm run start
```
## Run demo in docker:
### Linux:
```bash
 docker compose -f docker-compose.linux.yml up -d --build
```
### MacOS:
```bash
 docker compose -f docker-compose.desktop.yml up -d --build
```
### Windows:
#### [Configure Docker Desktop](Docker-windows.md)

```bash
 docker compose -f docker-compose.desktop.yml up -d --build
```

# VS1984 Overview

[English](README.md) | [中文](README.zh-CN.md)

**VS1984** is a **Decentralized Anonymous Communication & Content Sharing Network**.

It aims to provide a self-hostable, anonymous and censorship-resistant
infrastructure for creators and everyday users, in a world that often feels
increasingly like *1984*.

## Core Goals

- **Decentralization** – No central server. Content propagates directly between
peers over a P2P network.
- **Anonymity & Privacy** – A dual identity model (Guard ID / Real ID) that
separates routing identity from settlement identity at the protocol level.
- **End-to-End Encryption** – Content is encrypted by default. Only parties
holding the proper keys can decrypt it.
- **Censorship Resistance** – Multi-hop routing, on-chain proofs and
distributed nodes make takedowns harder and more visible.

## Why VS1984?
Because the world needs a system that does not rely on servers but still provides complete encrypted communication + anonymous content publishing + anonymous transactions.

**VS1984** is designed for scenarios such as:

- ✔ Anonymous chat
- ✔ Anonymous voice calls
- ✔ Uncensorable content publishing
- ✔ Untraceable on-chain transactions
- ✔ Paid BT content platforms
- ✔ A globally distributed, secure communication network
- ✔ An encrypted ecosystem beyond the reach of nation-state censors
When traditional platforms shut down, censorship rises, and communication is restricted, VS1984 can still operate.
