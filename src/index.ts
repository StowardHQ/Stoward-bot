import { SweeperManager, UserPresence } from "@stoatx/client";
import "dotenv/config";
import "reflect-metadata";
import { Client, On, Stoat } from "stoatx";
import api from "./utils/api.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = __dirname.includes("dist");
const token = process.env.TOKEN;
const prefix = process.env.PREFIX || "s!";

if (!token) {
  throw new Error("❌ Missing TOKEN env");
}

const client = new Client({
  prefix: prefix,
  commandsDir: path.join(__dirname, "commands"),
  extensions: isProduction ? [".js"] : [".ts"],
});

const sweepers = new SweeperManager(client, {
  messages: {
    lifetime: 3600000,
    interval: 600000,
  },
});

@Stoat()
export class LifecycleManager {
  private async updateDiscoveryPresence(): Promise<void> {
    try {
      const servers = await api.getServers();
      if (Array.isArray(servers)) {
        const totalMembers = servers.reduce((acc, s) => acc + (s.members || 0), 0);
        const serverCount = servers.length;

        if (client.user) {
          client.user.status = {
            text: `Watching ${serverCount} servers with ${totalMembers.toLocaleString()} members! 🛰️`,
            presence: UserPresence.Online,
          };
        }
      }
    } catch (err: any) {
      console.error("Presence Sync Failed:", err.message);
      if (client.user) {
        client.user.status = {
          text: "Offline 📡",
          presence: UserPresence.Busy,
        };
      }
    }
  }

  @On("ready")
  async onReady() {
    console.log("Bot is ready!");
    sweepers.start();

    await this.updateDiscoveryPresence();
    setInterval(() => void this.updateDiscoveryPresence(), 10 * 60 * 1000);
  }

  @On("error")
  onError(error: Error) {
    console.error("Bot encountered a client-side error:", error);
  }
}

async function start() {
  try {
    await client.initCommands();
    console.log("Commands loaded");

    await client.login(token!);
  } catch (error) {
    console.error("Fatal error during startup:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ [ERROR] :: Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error, origin) => {
  console.error(`❌ [ERROR] :: Uncaught Exception at ${origin}:`, error);
});

void start();
