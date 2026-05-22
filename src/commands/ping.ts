import { type CommandContext, EmbedBuilder, SimpleCommand, Stoat } from "stoatx";
import api, { type PlatformStats } from "../utils/api.js";

@Stoat()
export class GeneralCommands {
  @SimpleCommand({
    description: "Check ping & statistics",
    aliases: ["i", "stats", "ping", "p"],
    cooldown: 5000,
  })
  async info(ctx: CommandContext) {
    const reply = await ctx.message.reply("📡 Gathering...");

    const latency = reply.createdAt!.getTime() - ctx.message.createdAt!.getTime();

    try {
      const stats = await api.getStats();

      if ("error" in stats && stats.error) {
        throw new Error(stats.error);
      }

      const data = stats as PlatformStats;
      const totalServers = data.total_servers.toLocaleString();
      const totalMembers = data.total_members.toLocaleString();

      const embedDescription = [
        `🏓 **Bot Latency:** \`${latency}ms\``,
        `📁 **Total Servers:** \`${totalServers}\``,
        `👥 **Total Members:** \`${totalMembers}\``,
        "",
        "🔗 *Support Server: [Join Here](https://stt.gg/VHS7Pe7k)*",
      ].join("\n");

      const plainTextFallback = [
        "🛰️ **Stoward Information**",
        "-----------------------------------------",
        `🏓 **Bot Latency:** \`${latency}ms\``,
        `📁 **Total Servers:** \`${totalServers}\``,
        `👥 **Total Members:** \`${totalMembers}\``,
        "-----------------------------------------",
        "🔗 *Support Server: https://stt.gg/VHS7Pe7k*",
      ].join("\n");

      const successEmbed = new EmbedBuilder()
        .setColor("#4DB6AC") 
        .setTitle("🛰️ Stoward Information")
        .setDescription(embedDescription);

      return await reply.edit({ content: "\u200B", embeds: [successEmbed.toJSON()] }).catch(async (err) => {
        if (err.toString().includes("403") || err.toString().includes("50013")) {
          return reply.edit({ content: plainTextFallback, embeds: [] });
        }
        throw err;
      });
    } catch (err: any) {
      console.error("Info compilation failed:", err.message);

      const errorDescription = `🏓 **Bot Latency:** \`${latency}ms\`\n\n⚠️ *Could not connect to API right meow.*`;
      const errorFallback = `🏓 **Pong!** Bot Latency is \`${latency}ms\`.\n\n⚠️ *Could not connect to API right meow.*`;

      const failureEmbed = new EmbedBuilder()
        .setColor("#FF4A4A")
        .setTitle("Database Connection Error")
        .setDescription(errorDescription);

      return await reply.edit({ content: "\u200B", embeds: [failureEmbed.toJSON()] }).catch(async (err) => {
        if (err.toString().includes("403") || err.toString().includes("50013")) {
          return reply.edit({ content: errorFallback, embeds: [] });
        }
        throw err;
      });
    }
  }
}