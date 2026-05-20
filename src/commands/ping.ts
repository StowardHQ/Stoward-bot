import { type CommandContext, SimpleCommand, Stoat } from "stoatx";

@Stoat()
export class GeneralCommands {
  @SimpleCommand({
    description: "Check bot latency",
    aliases: ["p"],
    cooldown: 3000,
  })
  async ping(ctx: CommandContext) {
    const reply = await ctx.message.reply("Pinging...");

    const latency = reply.createdAt!.getTime() - ctx.message.createdAt!.getTime();

    await reply.edit(`🏓 **Pong!**\nLatency: \`${latency}ms\``);
  }
}
