module.exports = {
  config: {
    name: "reset",
    version: "1.0",
    role: 2,
    description: "Reset user credits"
  },

  onStart: async function ({ ctx, userCredits }) {
    const replyTo = ctx.message.reply_to_message;
    if (!replyTo) return ctx.reply("❌ ক্রেডিট রিসেট করার জন্য ইউজার এর মেসেজে রিপ্লাই দিন।");

    const userId = replyTo.from.id;
    userCredits[userId] = 10;
    return ctx.reply(`✅ User ID ${userId} এর ক্রেডিট সফলভাবে ১০ এ রিসেট করা হলো।`);
  }
};
