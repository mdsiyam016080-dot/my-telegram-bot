module.exports = async function (ctx) {
  if (ctx.update && ctx.update.message_reaction) {
    const reaction = ctx.update.message_reaction;
    try {
      await ctx.telegram.deleteMessage(reaction.chat.id, reaction.message_id);
    } catch (e) {}
  }
};
