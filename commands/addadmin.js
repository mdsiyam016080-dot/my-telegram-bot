module.exports = {
  config: {
    name: "addadmin",
    version: "1.0",
    role: 2,
    description: "Assign role to a user"
  },

  onStart: async function ({ ctx, args, config }) {
    let targetId = null;
    let targetRole = parseInt(args[0]) || 1;

    if (ctx.message.reply_to_message) {
      targetId = ctx.message.reply_to_message.from.id;
    } else if (args[1]) {
      targetId = parseInt(args[1]);
    }

    if (!targetId) {
      return ctx.reply("❌ কাউকে মেনশন করে/মেসেজে রিপ্লাই দিয়ে অথবা আইডি লিখে কমান্ড দিন।\nউদাহরণ: /addadmin 1 <USER_ID>");
    }

    config.ROLES[targetId] = targetRole;
    return ctx.reply(`✅ সফলভাবে User ID ${targetId} কে Role ${targetRole} দেওয়া হলো।`);
  }
};
    
