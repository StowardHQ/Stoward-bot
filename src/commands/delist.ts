import { type CommandContext, EmbedBuilder, SimpleCommand, Stoat } from "stoatx";
import api from "../utils/api.js";

@Stoat()
export class DeleteServerCommand {
  @SimpleCommand({
    name: "delist",
    description: "Permanently removes your server from Stoward.",
    cooldown: 10000,
  })
  async deleteServer(ctx: CommandContext) {
    const server = ctx.message.server;

    if (!server) {
      return ctx.message.reply("❌ This command must be used within a server channel.");
    }

    if (ctx.message.authorId !== server.ownerId) {
      return ctx.message.reply("⛔ Only the server owner can remove this listing.");
    }

    const processingMessage = await ctx.message.reply("🛰️ Verifying listing status...");

    try {
      const serverListing = await api.getServer(server.id);

      if ("error" in serverListing && serverListing.error) {
        const notFoundEmbed = new EmbedBuilder()
          .setColor("#FF4A4A")
          .setTitle("Not Listed")
          .setDescription("❌ This server is not currently registered on Stoward.");

        const notFoundText =
          "❌ **Not Listed:** This server is not currently registered on Stoward.";

        return await processingMessage
          .edit({ content: "‎", embeds: [notFoundEmbed.toJSON()] })
          .catch(async (err) => {
            if (err.toString().includes("403")) {
              return processingMessage.edit(notFoundText);
            }
            throw err;
          });
      }
    } catch (err) {
      console.error("Server Listing Verification Error:", err);
      return processingMessage.edit("❌ **Error:** Failed to verify server registration status.");
    }

    const confirmationInput = ctx.args.join(" ");

    if (!confirmationInput || confirmationInput.trim() !== server.name) {
      return processingMessage.edit(
        `⚠️ **Confirmation Required:** To permanently delist this server, please type the exact server name as an argument.\n` +
          `> Usage: \`${ctx.prefix}delist ${server.name}\``,
      );
    }

    await processingMessage.edit("🛰️ Delisting this server...");

    try {
      const backendResponse = await api.deleteServer(server.id, server.ownerId);

      if ("error" in backendResponse && backendResponse.error) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#FF4A4A")
          .setTitle("Backend Error")
          .setDescription(`❌ ${backendResponse.error}`);

        return await processingMessage
          .edit({ content: "‎", embeds: [errorEmbed.toJSON()] })
          .catch(async (err) => {
            if (err.toString().includes("403")) {
              return processingMessage.edit(`❌ **Backend Error:** ${backendResponse.error}`);
            }
            throw err;
          });
      }

      const successEmbed = new EmbedBuilder()
        .setColor("#E74C3C")
        .setTitle("🗑️ Listing Removed")
        .setDescription(
          `**${server.name}** has been completely delisted and removed from Stoward.`,
        );

      const successText = `🗑️ **Listing Removed**\n**${server.name}** has been completely delisted and removed from Stoward.`;

      return await processingMessage
        .edit({ content: "‎", embeds: [successEmbed.toJSON()] })
        .catch(async (err) => {
          if (err.toString().includes("403")) {
            return processingMessage.edit(successText);
          }
          throw err;
        });
    } catch (err: any) {
      console.error("Server Deletion Fatal Error:", err.toString());

      const failureEmbed = new EmbedBuilder()
        .setColor("#D63031")
        .setTitle("Connection Error")
        .setDescription("❌ Failed to communicate with the backend.");

      const failureText = "⚠️ **Connection Error**\n❌ Failed to communicate with the backend.";

      return await processingMessage
        .edit({ content: "‎", embeds: [failureEmbed.toJSON()] })
        .catch(async (embedErr) => {
          if (embedErr.toString().includes("403")) {
            return processingMessage.edit(failureText);
          }
          throw embedErr;
        });
    }
  }
}
