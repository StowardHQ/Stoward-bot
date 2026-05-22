import { SweeperManager, UserPresence } from "@stoatx/client";
import "dotenv/config";
import "reflect-metadata";
import { Client } from "stoatx";
import api, { type PlatformStats } from "./utils/api.js";
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

let sweepers: SweeperManager;

async function updateDiscoveryPresence(): Promise<void> {
  try {
    const stats = await api.getStats();

    if ("error" in stats && stats.error) {
      throw new Error(stats.error);
    }

    const data = stats as PlatformStats;
    const serverCount = data.total_servers;
    const totalMembers = data.total_members;

    console.log(`📊 Servers: ${serverCount} | Members: ${totalMembers.toLocaleString()}`);

    if (client.user) {
      await client.users.editMe({
        status: {
          text: `Watching ${serverCount} servers with ${totalMembers.toLocaleString()} members! 🛰️`,
          presence: UserPresence.Online,
        },
      });
    }
  } catch (err: any) {
    console.error("Presence Sync Failed:", err.message);
    if (client.user) {
      await client.users.editMe({
        status: {
          text: "Offline 📡",
          presence: UserPresence.Busy,
        },
      });
    }
  }
}

async function start() {
  try {
    await client.initCommands();
    console.log("Commands loaded");

    await client.login(token!);
    console.log("Bot is ready!");

    sweepers = new SweeperManager(client, {
      messages: {
        lifetime: 3600000,
        interval: 600000,
      },
    });
    sweepers.start();

    await updateDiscoveryPresence();
    setInterval(() => void updateDiscoveryPresence(), 10 * 60 * 1000);

    client.on("error", (error: Error) => {
      console.error("Bot encountered a client-side error:", error);
    });
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
