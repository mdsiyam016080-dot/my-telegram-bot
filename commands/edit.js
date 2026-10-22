const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    version: "1.0.0",
    role: 0,
    author: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
    description: "AI image editor"
  },

  onStart: async function ({ ctx, args }) {
    const message = ctx.message;
    const replyTo = message.reply_to_message;
    let imageUrl = null;

    if (replyTo && replyTo.photo) {
      const photo = replyTo.photo[replyTo.photo.length - 1];
      const link = await ctx.telegram.getFileLink(photo.file_id);
      imageUrl = link.href;
    } else if (message.photo) {
      const photo = message.photo[message.photo.length - 1];
      const link = await ctx.telegram.getFileLink(photo.file_id);
      imageUrl = link.href;
    }

    if (!imageUrl) {
      return ctx.reply("» ❌ একটি ছবির মেসেজে reply করে অথবা ছবিসহ command দিন।\n» 📝 উদাহরণ: /edit make the sky sunset");
    }

    const prompt = args.join(" ").trim();
    if (!prompt) {
      return ctx.reply("» ❌ Prompt দিন।\n» 📝 উদাহরণ: /edit make the background beautiful");
    }

    const cacheDir = path.join(__dirname, "../cache");
    await fs.ensureDir(cacheDir);
    const inputPath = path.join(cacheDir, `input_${Date.now()}.jpg`);
    const outputPath = path.join(cacheDir, `output_${Date.now()}.jpg`);
    let waitMsg;

    try {
      waitMsg = await ctx.reply("» ⏳ please wait bara...");
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 30000 });
      await fs.writeFile(inputPath, imgRes.data);

      const form = new FormData();
      form.append("image", fs.createReadStream(inputPath), { filename: "image.jpg", contentType: "image/jpeg" });
      form.append("prompt", prompt);
      form.append("resolution", "2K");
      form.append("ratio", "match_input_image");

      const apiRes = await axios.post("https://xrahat-image-edit.vercel.app/api/edit", form, {
        headers: { ...form.getHeaders() },
        timeout: 120000
      });

      if (!apiRes.data?.success || !apiRes.data?.imageUrl) throw new Error(apiRes.data?.error || "Edit failed");

      const outRes = await axios.get(apiRes.data.imageUrl, { responseType: "arraybuffer", timeout: 60000 });
      await fs.writeFile(outputPath, outRes.data);

      if (waitMsg) try { await ctx.deleteMessage(waitMsg.message_id); } catch (e) {}

      return ctx.replyWithPhoto({ source: fs.createReadStream(outputPath) }, {
        caption: `» ✅ Image Edit Complete!\n» 📝 Prompt: ${prompt}`
      });
    } catch (error) {
      if (waitMsg) try { await ctx.deleteMessage(waitMsg.message_id); } catch (e) {}
      return ctx.reply(`» ❌ Image edit failed: ${error.message}`);
    } finally {
      setTimeout(async () => {
        if (await fs.pathExists(inputPath)) await fs.remove(inputPath);
        if (await fs.pathExists(outputPath)) await fs.remove(outputPath);
      }, 5000);
    }
  }
};
