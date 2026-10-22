const fs = require("fs");
const axios = require("axios");
const path = require("path");

let lastPlayed = -1;

module.exports = {
  config: {
    name: "gan",
    version: "1.0.2",
    role: 0,
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    category: "media"
  },

  onStart: async function({ api, event }) {
    const { threadID, messageID } = event;
    const songLinks = [
      "https://files.catbox.moe/jx9cpq.mp4",
      "https://files.catbox.moe/jzg3j7.mp4",
      "https://files.catbox.moe/m4nggm.mp4",
      "https://files.catbox.moe/dbxfju.mp4",
      "https://files.catbox.moe/xx6d7i.mp4",
      "https://files.catbox.moe/etsdn9.mp3",
      "https://files.catbox.moe/ayepdz.mp3",
      "https://files.catbox.moe/oaecnx.mp3"
    ];

    api.setMessageReaction("🎵", messageID, () => {}, true);

    let index;
    do {
      index = Math.floor(Math.random() * songLinks.length);
    } while (index === lastPlayed && songLinks.length > 1);
    lastPlayed = index;

    const url = songLinks[index];
    const filePath = path.join(__dirname, `../cache/song_${index}.mp3`);

    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      const response = await axios({ url, method: "GET", responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        api.sendMessage({
          body: "🎶 Hᴇʀᴇ's ʏᴏᴜʀ sᴏɴɢ 🎧",
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });
    } catch (err) {
      api.sendMessage("⚠️ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ sᴏɴɢ!", threadID, messageID);
    }
  }
};
