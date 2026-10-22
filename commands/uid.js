module.exports = {
  config: {
    name: "uid",
    aliases: ["id", "myid"],
    version: "1.0.0",
    author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "utility",
    description: "Get UID of yourself or replied user"
  },

  onStart: async function ({ ctx }) {
    let targetUser = ctx.message.reply_to_message ? ctx.message.reply_to_message.from : ctx.from;
    const userId = targetUser.id;
    const firstName = targetUser.first_name || "User";

    const text = `🆔 <b>ইউজার আইডি (UID):</b>\n\n👤 <b>নাম:</b> ${firstName}\n🔹 <b>UID:</b> <code>${userId}</code>`;

    return ctx.reply(text, {
      parse_mode: "HTML",
      reply_to_message_id: ctx.message.message_id
    });
  }
};
