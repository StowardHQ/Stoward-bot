# Stoward Bot

> The official discovery bot for the Stoward platform.

<p align="center">
  <img src="https://img.shields.io/github/license/StowardHQ/stoward-bot?style=for-the-badge">
  <img src="https://img.shields.io/github/stars/StowardHQ/stoward-bot?style=for-the-badge">
  <img src="https://img.shields.io/github/forks/StowardHQ/stoward-bot?style=for-the-badge">
</p>

---

## 🛰️ Overview

Stoward Bot powers discovery features for the Stoward platform!

Built with TypeScript using [StoatX](https://github.com/stoatx-ts/stoatx).

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/StowardHQ/Stoward-bot stoward-bot
cd stoward-bot
```

---

## Install Dependencies

Using pnpm:

```bash
pnpm install
```

> [!TIP]
> pnpm is preferred 

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
TOKEN=
DISCOVERY_API_KEY=
PREFIX=s!
```

> [!IMPORTANT]
> Never commit your `.env` file publicly.

---

# 🚀 Development

Start the bot in development mode:

```bash
pnpm dev
```

---

# 🏗️ Build

Compile TypeScript into production files:

```bash
pnpm build
```

---

# 🌐 Production

Run the compiled production build:

```bash
pnpm start
```

---

# 📁 Project Structure

```txt
src/
├── commands/
├── utils/
└── index.ts
```

---

# 📜 Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development environment |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Start production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Automatically fix lint issues |
| `pnpm fmt` | Format source files |

---

# 🤝 Contributing

Pull requests, suggestions, and issue reports are welcome.

```bash
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request
```

> [!TIP]
> Keep commits focused and descriptive for easier review.

---

# 🔗 Links

| Platform | Link |
|---|---|
| 🌍 Website | https://stoward.space |
| 💻 GitHub | https://github.com/StowardHQ |
| 💬 Support Server | https://stt.gg/YdbvBN6q |

---