const { Markup } = require("telegraf");

module.exports = {
  config: {
    name: "balance",
    version: "1.0",
    role: 0,
    description: "Check user credits"
  },

  onStart: async function ({ ctx, userCredits, config }) {
    const userId = ctx.from.id;
    const credit = userCredits[userId] !== undefined ? userCredits[userId] : 10;

    return ctx.reply(
      `📊 আপনার বর্তমান ক্রেডিট: ${credit} টি।`,
      Markup.inlineKeyboard([
        [Markup.button.url("👑 Contact Owner", config.ADMIN_LINK)],
        [Markup.button.url("🤖 Add to Group", `https://t.me/${config.BOT_USERNAME}?startgroup=true`)]
      ])
    );
  }
};
