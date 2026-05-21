import { type CommandContext, EmbedBuilder, SimpleCommand, Stoat } from "stoatx";
import api from "../utils/api.js";

const BYPASS_USER_ID = "01H72THN43HSSYMZY81249J6GP";

@Stoat()
export class ServerRegistrationCommands {
  @SimpleCommand({
    name: "addserver",
    description: "Registers your server to Stoward.",
    cooldown: 10000,
  })
  async addServer(ctx: CommandContext) {
    const server = ctx.message.server;
    const inviteInput = ctx.args[0];

    if (!server) {
      return ctx.message.reply("❌ This command must be used within a server channel.");
    }

    if (!inviteInput) {
      return ctx.message.reply(`❌ Usage: \`${ctx.prefix}addserver <invite_link>\``);
    }

    const authorId = ctx.message.authorId;
    if (authorId !== server.ownerId && authorId !== BYPASS_USER_ID) {
      return ctx.message.reply("⛔ Only the server owner can register this server.");
    }

    const processingMessage = await ctx.message.reply(
      "🛰️ Fetching server data and validating invite link...",
    );

    try {
      const inviteCode = inviteInput.split("/").pop();
      if (!inviteCode) throw new Error("Invalid invite link format.");
      const platformResponse = await fetch(`https://stoat.chat/api/invites/${inviteCode}`);

      if (!platformResponse.ok) {
        return processingMessage.edit(
          "❌ **Error:** That invite code was not found or has expired.",
        );
      }

      const inviteData = await platformResponse.json();

      if (inviteData.server_id !== server.id) {
        return processingMessage.edit("❌ **Failed:** This invite belongs to a different server.");
      }

      const iconId = inviteData.server_icon?._id;
      const bannerId = inviteData.server_banner?._id;

      const finalData = {
        server_name: server.name,
        server_id: server.id,
        icon_url: iconId ? `https://cdn.stoatusercontent.com/icons/${iconId}?max_side=256` : null,
        banner_url: bannerId ? `https://cdn.stoatusercontent.com/banners/${bannerId}` : null,
        invite_link: `https://stoat.chat/invite/${inviteCode}`,
        members: inviteData.member_count || 0,
        description: server.description || "No description provided.",
        owner: ctx.message.author?.username || "Unknown",
        is_verified: 0,
      };

      const backendResponse = await api.addServer(finalData);

      if ("error" in backendResponse && backendResponse.error) {
        return processingMessage.edit(`❌ **Backend Error:** ${backendResponse.error}`);
      }

      const successEmbed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle("✨ Success!")
        .setDescription(
          `**${server.name}** has been successfully registered and is now live on our site!`,
        );

      await processingMessage.delete();
      return ctx.message.reply({ embeds: [successEmbed.toJSON()] });
    } catch (err) {
      console.error("Server Registration Fatal Error:", err);
      return processingMessage.edit("❌ **Error:** Failed to connect to backend.");
    }
  }
}
