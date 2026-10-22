module.exports = async function (ctx) {
  if (ctx.message && ctx.message.text) {
    if (ctx.message.text.toLowerCase().includes("allre")) {
      try {
        await ctx.deleteMessage();
      } catch (e) {}
    }
  }
};
