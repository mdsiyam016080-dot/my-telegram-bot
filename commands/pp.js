module.exports = {
  config: {
    name: "pp",
    aliases: ["avatar", "dp"],
    version: "1.0.0",
    author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "utility",
    description: "Shows profile picture and details of a user"
  },

  onStart: async function ({ ctx }) {
    try {
      let targetUser = ctx.message.reply_to_message ? ctx.message.reply_to_message.from : ctx.from;
      const userId = targetUser.id;
      const firstName = targetUser.first_name || "User";
      const username = targetUser.username ? `@${targetUser.username}` : "নাই";

      // ইউজারের প্রোফাইল ফটো সংগ্রহ
      const photos = await ctx.telegram.getUserProfilePhotos(userId, 0, 1);

      const caption = `👤 <b>ইউজার প্রোফাইল ইনফো</b>\n━━━━━━━━━━━━━━━\n📛 <b>নাম:</b> ${firstName}\n🆔 <b>ইউআইডি:</b> <code>${userId}</code>\n🔗 <b>ইউজারনেম:</b> ${username}\n━━━━━━━━━━━━━━━`;

      if (photos && photos.total_count > 0) {
        const fileId = photos.photos[0][photos.photos[0].length - 1].file_id;
        return await ctx.replyWithPhoto(fileId, {
          caption: caption,
          parse_mode: "HTML",
          reply_to_message_id: ctx.message.message_id
        });
      } else {
        return await ctx.reply(`${caption}\n⚠️ <i>ইউজারের কোনো প্রোফাইল পিকচার পাওয়া যায়নি!</i>`, {
          parse_mode: "HTML",
          reply_to_message_id: ctx.message.message_id
        });
      }
    } catch (error) {
      return ctx.reply(`❌ প্রোফাইল পিকচার আনতে সমস্যা হয়েছে: ${error.message}`);
    }
  }
};
