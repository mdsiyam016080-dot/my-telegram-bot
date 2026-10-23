const { createCanvas, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { Markup } = require("telegraf");

const LOCKED_OWNER_TITLE = "SIYAM HASAN";

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
    version: "12.0.0",
    author: "SIYAM-HASAN",
    role: 2,
    category: "owner",
    description: "Interactive Premium Owner Control Dashboard"
  },

  onStart: async function ({ ctx, args }) {
    const userId = ctx.from.id;
    const action = (args[0] || "").toLowerCase();
    const chatId = ctx.chat.id;

    // Security Check
    const configPath = path.join(__dirname, "../config.json");
    let config = {};
    try { config = fs.readJsonSync(configPath); } catch (e) {}

    const adminIds = config.ADMIN_IDS || [];
    if (!adminIds.includes(userId)) {
      return ctx.reply("🚨 ACCESS DENIED: এই কমান্ডটি শুধুমাত্র বটের মূল অনারের জন্য সংরক্ষিত! ❌");
    }

    // --- Action Handlers ---
    if (action === "clearcache") {
      try {
        const cacheDir = path.join(__dirname, "../cache");
        if (fs.existsSync(cacheDir)) {
          const files = fs.readdirSync(cacheDir);
          for (const file of files) {
            fs.unlinkSync(path.join(cacheDir, file));
          }
        }
        return ctx.reply("🧹 SUCCESS: বটের সমস্ত জাংক ফাইল ও ক্যাশ মেমোরি খালি করা হয়েছে!");
      } catch (err) {
        return ctx.reply(`❌ ক্যাশ ফোল্ডার খালি করতে ব্যর্থ: ${err.message}`);
      }
    }

    if (action === "restart") {
      await ctx.reply("🔄 SYSTEM REBOOTING: বটটি রিসেট দেওয়া হচ্ছে... কয়েক সেকেন্ডের মধ্যে অটো স্টার্ট হবে।");
      setTimeout(() => { process.exit(1); }, 1000);
      return;
    }

    // --- CANVAS DASHBOARD CARD GENERATION ---
    const waitMsg = await ctx.reply("⏳ Loading Owner Interactive Dashboard...", { reply_to_message_id: ctx.message.message_id });

    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const memory = process.memoryUsage();
      const usedRAM = (memory.heapUsed / 1024 / 1024).toFixed(1);
      const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
      const cpuLoad = os.loadavg()[0].toFixed(2);
      const platform = os.platform().toUpperCase();

      const width = 1000;
      const height = 520;
      const canvas = createCanvas(width, height);
      const c = canvas.getContext("2d");

      // Deep Cyberpunk Dark Gradient
      const bg = c.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#080b14");
      bg.addColorStop(0.5, "#0f172a");
      bg.addColorStop(1, "#020617");
      c.fillStyle = bg;
      c.fillRect(0, 0, width, height);

      // Cyber Neon Lighting Background
      const orb1 = c.createRadialGradient(200, 100, 20, 200, 100, 400);
      orb1.addColorStop(0, "rgba(56, 189, 248, 0.25)");
      orb1.addColorStop(1, "transparent");
      c.fillStyle = orb1;
      c.fillRect(0, 0, width, height);

      const orb2 = c.createRadialGradient(800, 400, 20, 800, 400, 450);
      orb2.addColorStop(0, "rgba(236, 72, 153, 0.22)");
      orb2.addColorStop(1, "transparent");
      c.fillStyle = orb2;
      c.fillRect(0, 0, width, height);

      // Card Outer Glow Frame
      c.save();
      c.shadowColor = "#38bdf8";
      c.shadowBlur = 25;
      drawRoundRect(c, 30, 30, width - 60, height - 60, 24);
      c.fillStyle = "rgba(15, 23, 42, 0.94)";
      c.fill();
      c.restore();

      c.strokeStyle = "rgba(56, 189, 248, 0.6)";
      c.lineWidth = 2;
      drawRoundRect(c, 30, 30, width - 60, height - 60, 24);
      c.stroke();

      // Header Banner
      const headerGrad = c.createLinearGradient(50, 50, width - 50, 50);
      headerGrad.addColorStop(0, "#38bdf8");
      headerGrad.addColorStop(0.5, "#818cf8");
      headerGrad.addColorStop(1, "#ec4899");
      c.fillStyle = headerGrad;
      drawRoundRect(c, 50, 50, width - 100, 70, 16);
      c.fill();

      // Clean English Text Only (Prevents Canvas Character Glitches)
      c.font = "bold 32px sans-serif";
      c.fillStyle = "#ffffff";
      c.textAlign = "center";
      c.fillText("OWNER COMMAND & CONTROL DASHBOARD", width / 2, 95);

      // Box Drawer Function
      function drawMetricBox(x, y, w, h, title, value, accentColor) {
        c.save();
        c.fillStyle = "rgba(30, 41, 59, 0.85)";
        drawRoundRect(c, x, y, w, h, 14);
        c.fill();

        c.shadowColor = accentColor;
        c.shadowBlur = 12;
        c.fillStyle = accentColor;
        drawRoundRect(c, x, y, 6, h, { tl: 14, bl: 14, tr: 0, br: 0 });
        c.fill();
        c.restore();

        c.strokeStyle = "rgba(255, 255, 255, 0.1)";
        c.lineWidth = 1;
        drawRoundRect(c, x, y, w, h, 14);
        c.stroke();

        c.textAlign = "left";
        c.font = "bold 15px sans-serif";
        c.fillStyle = "#94a3b8";
        c.fillText(title, x + 24, y + 30);

        c.font = "bold 24px sans-serif";
        c.fillStyle = "#ffffff";
        c.fillText(value, x + 24, y + 65);
      }

      // Metric Grid (3x2)
      drawMetricBox(60, 150, 275, 95, "SYSTEM OWNER", LOCKED_OWNER_TITLE, "#38bdf8");
      drawMetricBox(362, 150, 275, 95, "SYSTEM UPTIME", `${days}d ${hours}h ${minutes}m ${seconds}s`, "#34d399");
      drawMetricBox(665, 150, 275, 95, "HEAP MEMORY", `${usedRAM} MB / ${totalRAM} GB`, "#facc15");

      drawMetricBox(60, 270, 275, 95, "NODE VERSION", process.version, "#c084fc");
      drawMetricBox(362, 270, 275, 95, "CPU LOAD", `${cpuLoad}`, "#22d3ee");
      drawMetricBox(665, 270, 275, 95, "HOST OS", `${platform}`, "#ec4899");

      // Footer Banner
      c.fillStyle = "rgba(30, 41, 59, 0.9)";
      drawRoundRect(c, 60, 390, 880, 70, 14);
      c.fill();

      c.textAlign = "center";
      c.font = "bold 18px sans-serif";
      c.fillStyle = "#38bdf8";
      c.fillText("CONTROL PANEL READY • SELECT AN ACTION BUTTON BELOW", width / 2, 432);

      // Save Image
      const cacheDir = path.join(__dirname, "../cache");
      await fs.ensureDir(cacheDir);
      const imgPath = path.join(cacheDir, `owner_card_${Date.now()}.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      try { await ctx.telegram.deleteMessage(chatId, waitMsg.message_id); } catch (e) {}

      // Interactive Telegram Inline Keyboard (Clickable Buttons)
      const captionText = 
`👑 <b>SYSTEM OWNER CONTROL PANEL</b> 👑
━━━━━━━━━━━━━━━━━━━━
👤 <b>Owner:</b> <code>${LOCKED_OWNER_TITLE}</code>
⏱️ <b>Uptime:</b> <code>${days}d ${hours}h ${minutes}m ${seconds}s</code>
🧠 <b>RAM:</b> <code>${usedRAM} MB / ${totalRAM} GB</code>
⚡ <b>Status:</b> <code>ACTIVE & SECURE</code>
━━━━━━━━━━━━━━━━━━━━
👇 <b>নিচের বাটনগুলোতে ক্লিক করে বটের কাজ সিলেক্ট করুন:</b>`;

      await ctx.replyWithPhoto({ source: imgPath }, {
        caption: captionText,
        parse_mode: "HTML",
        reply_to_message_id: ctx.message.message_id,
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback("🔄 Restart Bot", "owner_action_restart"),
            Markup.button.callback("🧹 Clear Cache", "owner_action_clearcache")
          ],
          [
            Markup.button.callback("📊 Check Uptime", "owner_action_uptime"),
            Markup.button.callback("📜 Command List", "owner_action_cmd")
          ],
          [
            Markup.button.url("👤 Developer Telegram", "https://t.me/ri_siyam")
          ]
        ])
      });

      setTimeout(() => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, 15000);

    } catch (err) {
        console.error("Owner Card Error:", err);
        try { await ctx.telegram.deleteMessage(chatId, waitMsg.message_id); } catch (e) {}
        return ctx.reply(`❌ ড্যাশবোর্ড তৈরি করতে সমস্যা হয়েছে: ${err.message}`);
    }
  }
};
