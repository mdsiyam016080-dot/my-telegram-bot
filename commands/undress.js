const axios = require("axios");

const MIDDLEWARE_URL = "https://xrahat-dev-undress.vercel.app/undress";

module.exports = {
  config: {
    name: "undress",
    version: "1.0",
    author: "🔰𝐗ʀᴀʜᴀᴛ-ᴅᴇᴠ🔰",
    role: 2,
    description: "AI image edit using undress"
  },

  onStart: async function ({ ctx }) {
    const message = ctx.message;
    const replyTo = message.reply_to_message;

    if (!replyTo || !replyTo.photo) {
      return ctx.reply("❌ অনুগ্রহ করে একটি ছবির মেসেজে রিप्लाई করে /undress কমান্ডটি দিন।");
    }

    const photoArray = replyTo.photo;
    const highestPhoto = photoArray[photoArray.length - 1];
    const fileId = highestPhoto.file_id;

    const waitMsg = await ctx.reply("💦 Please wait....");

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const imageUrl = fileLink.href;
      const credit = this.config.author;

      const response = await axios.post(
        MIDDLEWARE_URL,
        { imageUrl, credit },
        { headers: { "Content-Type": "application/json" }, timeout: 90000 }
      );

      const data = response.data;
      if (!data.success || !data.resultUrl) throw new Error(data.error || "API Error");

      try { await ctx.deleteMessage(waitMsg.message_id); } catch (e) {}

      await ctx.replyWithPhoto(data.resultUrl, {
        caption: data.captionTemplate || "✅ Success!"
      });
    } catch (error) {
      try { await ctx.deleteMessage(waitMsg.message_id); } catch (e) {}
      const msg = error.response?.data?.error || error.message || "Unknown error";
      return ctx.reply(`⚠️ ${msg}`);
    }
  }
};
        
