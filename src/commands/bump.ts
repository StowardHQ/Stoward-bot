import { type CommandContext, EmbedBuilder, SimpleCommand, Stoat } from "stoatx";
import api from "../utils/api.js";

@Stoat()
export class ServerListingCommands {
  @SimpleCommand({
    description: "Bumps your server to push it higher up the listings.",
    cooldown: 5000,
  })
  async bump(ctx: CommandContext) {
    const serverId = ctx.message.serverId;

    if (!serverId) {
      return ctx.message.reply("❌ This command must be used within a server.");
    }

    try {
      const response = await api.bumpServer(serverId);

      if ("error" in response && response.error) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#FF4A4A")
          .setTitle("Cooldown / Error")
          .setDescription(`⏳ ${response.error}`);

        return await ctx.message.reply({ embeds: [errorEmbed.toJSON()] }).catch(async (err) => {
          if (err.toString().includes("403")) {
            return ctx.message.reply(`⚠️ **Cooldown / Error**\n⏳ ${response.error}`);
          }
          throw err;
        });
      }

      const successText =
        `Your server has been boosted higher on Stoward! You can find your listing here: https://stoward.space/server/${serverId} !\n\n` +
        "Want update notifications, to report a bug, or share suggestions?\n" +
        "Join our support server: https://stt.gg/YdbvBN6q";

      const successEmbed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle("🚀 Bump Successful!")
        .setDescription(successText);

      return await ctx.message.reply({ embeds: [successEmbed.toJSON()] }).catch(async (err) => {
        if (err.toString().includes("403")) {
          return ctx.message.reply(`🚀 **Bump Successful!**\n\n${successText}`);
        }
        throw err;
      });
    } catch (err: any) {
      console.error("Bump Command Error Context:", err.toString());

      const failureEmbed = new EmbedBuilder()
        .setColor("#D63031")
        .setTitle("Connection Error")
        .setDescription("❌ Something went wrong while connecting to the API.");

      return await ctx.message.reply({ embeds: [failureEmbed.toJSON()] }).catch(() => {
        return ctx.message.reply(
          "⚠️ **Connection Error**\n❌ Something went wrong while connecting to the API.",
        );
      });
    }
  }
}
