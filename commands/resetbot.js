module.exports = {
  config: {
    name: "resetbot",
    aliases: ["restart", "reboot"],
    version: "1.0.0",
    author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2, // শুধুমাত্র এডমিন
    category: "admin",
    description: "Restarts/Resets the bot process"
  },

  onStart: async function ({ ctx }) {
    await ctx.reply("🔄 বটটি পুনরায় রিসেট করা হচ্ছে... অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।");
    setTimeout(() => {
      process.exit(0); // প্রসেস বন্ধ করবে, অটো-রিস্টার্ট লুপ বটকে সাথে সাথে চালু করবে
    }, 1000);
  }
};
