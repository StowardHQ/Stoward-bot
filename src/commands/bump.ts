import { type CommandContext, EmbedBuilder, SimpleCommand, Stoat } from "stoatx";
import api from "../utils/api.js";

const BUMP_FEED_CHANNEL_ID = "01KSFSAV0N5NR0806EEG2KV0A9";

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

      try {
        const feedEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("🔥 Server Bumped!")
          .setDescription(
            `**${ctx.message.server?.name || "A server"}** has just bumped their listing!\n\n` +
              `🔗 [View Listing Page](https://stoward.space/server/${serverId})`,
          );

        let targetChannel = ctx.client.channels.cache.get(BUMP_FEED_CHANNEL_ID);
        if (!targetChannel) {
          targetChannel = await ctx.client.channels.fetch(BUMP_FEED_CHANNEL_ID);
        }

        if (
          targetChannel &&
          targetChannel.messages &&
          typeof targetChannel.messages.send === "function"
        ) {
          await targetChannel.messages.send({ embeds: [feedEmbed.toJSON()] });
        }
      } catch (feedErr) {
        console.error("Failed to send to bump feed channel:", feedErr);
      }

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
