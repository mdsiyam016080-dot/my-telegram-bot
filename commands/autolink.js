const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const COMMAND_NAME = "autolink";

module.exports = {
    config: {
        name: COMMAND_NAME,
        version: "1.3",
        author: AUTHOR, 
        countDown: 5,
        role: 0,
        category: "media",
    },

    onStart: async function () {},

    onChat: async function ({ api, event }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const message = event.body || "";

        const linkMatches = message.match(/(https?:\/\/[^\s]+)/g);
        if (!linkMatches || linkMatches.length === 0) return;

        const uniqueLinks = [...new Set(linkMatches)];
        api.setMessageReaction("💋", messageID, () => {}, true);

        for (const url of uniqueLinks) {
            try {
                const { title, filePath } = await downloadVideo(url);
                if (!filePath || !fs.existsSync(filePath)) continue;

                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 45) {
                    fs.unlinkSync(filePath);
                    continue;
                }

                await api.sendMessage(
                    {
                        body: `📥 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃\n━━━━━━━━━━━━━━━\n🎬 𝐓𝐈𝐓𝐋𝐄 : ${title || "Video File"}\n📦 𝐒𝐈𝐙𝐄 : ${fileSizeInMB.toFixed(2)} 𝐌𝐁\n━━━━━━━━━━━━━━━\n🦋 ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`,
                        attachment: fs.createReadStream(filePath)
                    },
                    threadID,
                    () => fs.unlinkSync(filePath)
                );
            } catch (e) {}
        }
    }
};
