module.exports = async function (ctx) {
  if (ctx.message && !ctx.message.from.is_bot) {
    try {
      await ctx.react("🗡️");
    } catch (e) {}
  }
};
