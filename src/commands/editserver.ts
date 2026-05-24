import { type CommandContext, EmbedBuilder, SimpleCommand, Stoat } from "stoatx";
import api from "../utils/api.js";

const BYPASS_USER_ID = "01H72THN43HSSYMZY81249J6GP";

@Stoat()
export class ServerEditCommands {
  @SimpleCommand({
    name: "editserver",
    description: "Update your server's invite link or rating status (NSFW/SFW).",
    cooldown: 5000,
  })
  async editServer(ctx: CommandContext) {
    const server = ctx.message.server;
    if (!server) {
      return ctx.message.reply("❌ This command must be used within a server channel.");
    }

    const authorId = ctx.message.authorId;
    if (authorId !== server.ownerId && authorId !== BYPASS_USER_ID) {
      return ctx.message.reply("⛔ Only the server owner can edit this listing.");
    }

    const input = ctx.args[0];
    const fullMessageText = ctx.message.content?.toLowerCase() || "";
    
    const wantsNsfw = fullMessageText.includes("nsfw");
    const wantsSfw = fullMessageText.includes("sfw");

    if (!input && !wantsNsfw && !wantsSfw) {
      return ctx.message.reply(
        `ℹ️ **Usage:** \`${ctx.prefix}editserver [invite_link] [nsfw / sfw]\`\n` +
        `*Examples:*\n` +
        `• \`${ctx.prefix}editserver nsfw\`\n` +
        `• \`${ctx.prefix}editserver sfw\`\n` +
        `• \`${ctx.prefix}editserver stoat.chat/invite/xyz sfw\``
      );
    }

    const processingMessage = await ctx.message.reply("🔄 Updating server listing...");

    try {
      let updateData: any = { server_id: server.id };
      let inviteUpdated = false;

      if (input && input.includes("stoat.chat/")) {
        const inviteCode = input.split("/").pop();
        const platformResponse = await fetch(`https://stoat.chat/api/invites/${inviteCode}`);

        if (platformResponse.ok) {
          const inviteData = await platformResponse.json();
          
          if (inviteData.server_id === server.id) {
            const iconId = inviteData.server_icon?._id;
            const bannerId = inviteData.server_banner?._id;

            updateData = {
              ...updateData,
              server_name: server.name,
              invite_link: `https://stoat.chat/invite/${inviteCode}`,
              members: inviteData.member_count || 0,
              icon_url: iconId ? `https://cdn.stoatusercontent.com/icons/${iconId}?max_side=256` : null,
              banner_url: bannerId ? `https://cdn.stoatusercontent.com/banners/${bannerId}` : null,
            };
            inviteUpdated = true;
          }
        }
      }

      if (inviteUpdated) {
        const backendResponse = await api.addServer(updateData);
        if ("error" in backendResponse && backendResponse.error) {
          return processingMessage.edit(`❌ **Backend Error:** ${backendResponse.error}`);
        }
      }

      let ratingUpdatedMessage: string | null = null;
      if (wantsNsfw) {
        await api.setNsfw(server.id, true);
        ratingUpdatedMessage = "🔞 Marked as NSFW";
      } else if (wantsSfw) {
        await api.setNsfw(server.id, false);
        ratingUpdatedMessage = "🌐 Marked as SFW";
      }

      const changesList = [
        inviteUpdated ? "✅ New invite link applied" : null,
        ratingUpdatedMessage
      ].filter(Boolean);

      const successEmbed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle("⚙️ Listing Updated!")
        .setDescription(
          changesList.length > 0
            ? `Successfully updated **${server.name}**:\n\n${changesList.join("\n")}`
            : `Successfully refreshed listing data for **${server.name}**.`
        );

      const successText = [
        "⚙️ **Listing Updated!**",
        "",
        changesList.length > 0
          ? `Successfully updated **${server.name}**:\n\n${changesList.join("\n")}`
          : `Successfully refreshed listing data for **${server.name}**.`
      ].join("\n");

      return await processingMessage
        .edit({ content: "‎", embeds: [successEmbed.toJSON()] })
        .catch(async (err) => {
          if (err.toString().includes("403") || err.toString().includes("50013")) {
            return processingMessage.edit({ content: successText, embeds: [] });
          }
          throw err;
        });
        
    } catch (err) {
      console.error("Server Edit Error:", err);
      return processingMessage.edit("❌ **Error:** Failed to save changes.");
    }
  }
}