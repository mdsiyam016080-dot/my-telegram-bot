const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const LOCKED_OWNER_TITLE = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

// Helper: Draw rounded rectangle with custom radiuses
function drawRoundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, radius);
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}

module.exports = {
  config: {
    name: "owner",
    aliases: ["dev", "adminpanel", "siyam"],
    version: "10.0.0",
    author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2,
    category: "owner",
    description: "Exclusive powerful owner control panel card"
  },

  onStart: async function ({ ctx, args }) {
    const userId = ctx.from.id;
    const action = (args[0] || "").toLowerCase();
    const chatId = ctx.chat.id;

    const configPath = path.join(__dirname, "../config.json");
    let config = {};
    try {
      config = fs.readJsonSync(configPath);
    } catch (e) {}

    const adminIds = config.ADMIN_IDS || [];
    if (!adminIds.includes(userId)) {
      return ctx.reply("🚨 **SECURITY ALERT:** এই কমান্ডটি শুধুমাত্র বটের এক্সক্লুসিভ অনারের জন্য সংরক্ষিত! ❌");
    }

    if (action === "clearcache" || action === "clean") {
      try {
        const cacheDir = path.join(__dirname, "../cache");
        if (fs.existsSync(cacheDir)) {
          const files = fs.readdirSync(cacheDir);
          for (const file of files) {
            fs.unlinkSync(path.join(cacheDir, file));
          }
        }
        return ctx.reply("🧹 **SUCCESS:** বটের সমস্ত ক্যাশ এবং জাংক ফাইল পরিষ্কার করা হয়েছে!");
      } catch (err) {
        return ctx.reply(`❌ ক্যাশ পরিষ্কার করতে সমস্যা হয়েছে: ${err.message}`);
      }
    }

    if (action === "restart" || action === "reboot") {
      await ctx.reply("🔄 **SYSTEM REBOOT:** সার্ভার পুনরায় চালু করা হচ্ছে...");
      setTimeout(() => {
        process.exit(1);
      }, 1500);
      return;
    }

    // --- CANVAS CARD GENERATION ---
    const waitMsg = await ctx.reply("⏳ Generating Owner Status Card...", { reply_to_message_id: ctx.message.message_id });

    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const memory = process.memoryUsage();
      const usedRAM = (memory.heapUsed / 1024 / 1024).toFixed(1);
      const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
      const cpuLoad = os.loadavg()[0].toFixed(2);
      const platform = os.platform().toUpperCase();

      const width = 950;
      const height = 550;
      const canvas = createCanvas(width, height);
      const c = canvas.getContext("2d");

      // Background Gradient
      const bg = c.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#05050c");
      bg.addColorStop(0.5, "#0d0f1d");
      bg.addColorStop(1, "#04050a");
      c.fillStyle = bg;
      c.fillRect(0, 0, width, height);

      // Glowing Neon Orbs
      const orb1 = c.createRadialGradient(150, 150, 10, 150, 150, 300);
      orb1.addColorStop(0, "rgba(0, 245, 212, 0.2)");
      orb1.addColorStop(1, "transparent");
      c.fillStyle = orb1;
      c.fillRect(0, 0, width, height);

      const orb2 = c.createRadialGradient(800, 450, 10, 800, 450, 350);
      orb2.addColorStop(0, "rgba(255, 0, 127, 0.18)");
      orb2.addColorStop(1, "transparent");
      c.fillStyle = orb2;
      c.fillRect(0, 0, width, height);

      // Main Outer Card Box with Glowing Cyan/Purple Border
      c.save();
      c.shadowColor = "rgba(0, 245, 212, 0.35)";
      c.shadowBlur = 25;
      drawRoundRect(c, 25, 25, width - 50, height - 50, 24);
      c.fillStyle = "rgba(10, 12, 24, 0.95)";
      c.fill();
      c.restore();

      c.strokeStyle = "#00f5d4";
      c.lineWidth = 2.5;
      drawRoundRect(c, 25, 25, width - 50, height - 50, 24);
      c.stroke();

      // Header Banner (Cyan to Magenta Gradient)
      const headerGrad = c.createLinearGradient(45, 45, width - 45, 45);
      headerGrad.addColorStop(0, "#00f5d4");
      headerGrad.addColorStop(0.5, "#7000ff");
      headerGrad.addColorStop(1, "#ff007f");
      c.fillStyle = headerGrad;
      drawRoundRect(c, 45, 45, width - 90, 65, 14);
      c.fill();

      c.font = "bold 28px sans-serif";
      c.fillStyle = "#ffffff";
      c.textAlign = "center";
      c.fillText("👑 EXCLUSIVE OWNER CONTROL PANEL 👑", width / 2, 87);

      // Function to draw separate styled info boxes with unique colors & borders
      function drawInfoBox(x, y, w, h, title, value, accentColor) {
        c.save();
        // Inner Box Background
        c.fillStyle = "rgba(20, 24, 45, 0.9)";
        drawRoundRect(c, x, y, w, h, 12);
        c.fill();

        // Left Colored Accent Line
        c.shadowColor = accentColor;
        c.shadowBlur = 10;
        c.fillStyle = accentColor;
        drawRoundRect(c, x, y, 6, h, { tl: 12, bl: 12, tr: 0, br: 0 });
        c.fill();
        c.restore();

        // Box Border
        c.strokeStyle = "rgba(255, 255, 255, 0.08)";
        c.lineWidth = 1;
        drawRoundRect(c, x, y, w, h, 12);
        c.stroke();

        // Text Labels (No overlapping, perfectly aligned)
        c.textAlign = "left";
        c.font = "bold 15px sans-serif";
        c.fillStyle = "#94a3b8";
        c.fillText(title, x + 22, y + 28);

        c.font = "bold 22px sans-serif";
        c.fillStyle = "#ffffff";
        c.fillText(value, x + 22, y + 60);
      }

      // Grid Boxes (Each box has unique accent color and clear spacing)
      drawInfoBox(50, 135, 265, 85, "SUPREME OWNER", LOCKED_OWNER_TITLE, "#00f5d4");
      drawInfoBox(342, 135, 265, 85, "SYSTEM UPTIME", `${days}d ${hours}h ${minutes}m`, "#34d399");
      drawInfoBox(635, 135, 265, 85, "MEMORY (RAM)", `${usedRAM} / ${totalRAM} GB`, "#fbbf24");

      drawInfoBox(50, 240, 265, 85, "NODE.JS VERSION", process.version, "#c084fc");
      drawInfoBox(342, 240, 265, 85, "CPU LOAD", `${cpuLoad}`, "#22d3ee");
      drawInfoBox(635, 240, 265, 85, "PLATFORM", `${platform}`, "#ff007f");

      // Bottom Command Guide Box
      c.fillStyle = "rgba(18, 22, 40, 0.95)";
      drawRoundRect(c, 50, 345, 850, 160, 14);
      c.fill();

      c.strokeStyle = "rgba(112, 0, 255, 0.4)";
      c.lineWidth = 2;
      drawRoundRect(c, 50, 345, 850, 160, 14);
      c.stroke();

      c.textAlign = "left";
      c.font = "bold 18px sans-serif";
      c.fillStyle = "#00f5d4";
      c.fillText("⚡ EXCLUSIVE OWNER COMMANDS:", 75, 380);

      c.font = "bold 16px sans-serif";
      c.fillStyle = "#e2e8f0";
      c.fillText("📌 /owner restart  ➔  সার্ভার বা বট ইনস্ট্যান্ট রিস্টার্ট করুন", 75, 420);
      c.fillText("📌 /owner clearcache  ➔  ক্যাশ ফোল্ডারের সমস্ত জাংক ফাইল মুছুন", 75, 455);
      
      c.font = "14px sans-serif";
      c.fillStyle = "#94a3b8";
      c.fillText("🔒 Restricted Secure Zone • NIJHUM CHATBOT SYSTEM", 75, 485);

      // Save image to cache
      const cacheDir = path.join(__dirname, "../cache");
      await fs.ensureDir(cacheDir);
      const imgPath = path.join(cacheDir, `owner_${Date.now()}.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      try {
        await ctx.telegram.deleteMessage(chatId, waitMsg.message_id);
      } catch (e) {}

      const captionText = 
`👑 𝗘𝗫𝗖𝗟𝗨𝗦𝗜𝗩𝗘 𝗢𝗪𝗡𝗘𝗥 𝗣𝗔𝗡𝗘𝗟 👑
━━━━━━━━━━━━━━━━━━━━
👤 𝗢𝘄𝗻𝗲𝗿: ${LOCKED_OWNER_TITLE}
⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${days}d ${hours}h ${minutes}m
🧠 𝗥𝗔𝗠: ${usedRAM} MB / ${totalRAM} GB
⚡ 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗦𝗲𝗰𝘂𝗿𝗲 & 𝗢𝗻𝗹𝗶𝗻𝗲
━━━━━━━━━━━━━━━━━━━━
✨ *This is a private secure zone restricted only to the supreme creator.*`;

      await ctx.replyWithPhoto({ source: imgPath }, {
        caption: captionText,
        reply_to_message_id: ctx.message.message_id
      });

      setTimeout(() => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, 15000);

    } catch (err) {
      console.error("Owner Card Error:", err);
      try {
        await ctx.telegram.deleteMessage(chatId, waitMsg.message_id);
      } catch (e) {}
      return ctx.reply(`❌ অনার কার্ড তৈরি করতে সমস্যা হয়েছে: ${err.message}`);
    }
  }
};
