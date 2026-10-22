const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const LOCKED_AUTHOR = "SIYAM-HASAN";

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

module.exports = {
    config: {
        name: "uptime",
        aliases: ["up", "status", "আপ"],
        version: "6.5",
        author: LOCKED_AUTHOR,
        role: 0,
        description: "Advanced real-time status card with detailed system info",
        category: "system"
    },

    onStart: async function ({ ctx }) {
        const chatId = ctx.chat.id;
        const messageId = ctx.message.message_id;
        const start = Date.now();

        const waitMsg = await ctx.reply("⏳ Generating System Uptime Card...", {
            reply_to_message_id: messageId
        });

        try {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const memory = process.memoryUsage();
            const usedRAM = (memory.heapUsed / 1024 / 1024).toFixed(1);
            const totalHeap = (memory.heapTotal / 1024 / 1024).toFixed(1);
            const ping = Date.now() - start;

            const cpuLoad = os.loadavg()[0].toFixed(2);
            const cpuCores = os.cpus().length;
            const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
            const freeMemGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
            const usedMemGB = (totalMemGB - freeMemGB).toFixed(1);
            const memPercent = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1);
            const heapPercent = ((memory.heapUsed / memory.heapTotal) * 100).toFixed(1);

            const platform = os.platform().toUpperCase();
            const arch = os.arch().toUpperCase();
            const hostname = os.hostname();
            const nodeVersion = process.version;
            const pid = process.pid;

            // Canvas Dimensions
            const width = 980;
            const height = 640;
            const canvas = createCanvas(width, height);
            const ctxCanvas = canvas.getContext("2d");

            // Background
            const bg = ctxCanvas.createLinearGradient(0, 0, width, height);
            bg.addColorStop(0, "#05050c");
            bg.addColorStop(0.5, "#0b0b16");
            bg.addColorStop(1, "#070710");
            ctxCanvas.fillStyle = bg;
            ctxCanvas.fillRect(0, 0, width, height);

            // Light Effects
            const light1 = ctxCanvas.createRadialGradient(490, 0, 20, 490, 90, 480);
            light1.addColorStop(0, "rgba(139, 92, 246, 0.2)");
            light1.addColorStop(1, "rgba(139, 92, 246, 0)");
            ctxCanvas.fillStyle = light1;
            ctxCanvas.fillRect(0, 0, width, height);

            const light2 = ctxCanvas.createRadialGradient(900, 600, 30, 850, 500, 280);
            light2.addColorStop(0, "rgba(34, 211, 238, 0.14)");
            light2.addColorStop(1, "rgba(34, 211, 238, 0)");
            ctxCanvas.fillStyle = light2;
            ctxCanvas.fillRect(0, 0, width, height);

            // Main Outer Card
            ctxCanvas.save();
            ctxCanvas.shadowColor = "rgba(139, 92, 246, 0.35)";
            ctxCanvas.shadowBlur = 30;
            roundRect(ctxCanvas, 35, 35, 910, 570, 28);
            ctxCanvas.fillStyle = "rgba(12, 12, 24, 0.96)";
            ctxCanvas.fill();
            ctxCanvas.restore();

            ctxCanvas.strokeStyle = "rgba(167, 139, 250, 0.4)";
            ctxCanvas.lineWidth = 2.5;
            roundRect(ctxCanvas, 35, 35, 910, 570, 28);
            ctxCanvas.stroke();

            // Header Banner
            const headerGrad = ctxCanvas.createLinearGradient(55, 55, 925, 55);
            headerGrad.addColorStop(0, "#7c3aed");
            headerGrad.addColorStop(1, "#06b6d4");
            ctxCanvas.fillStyle = headerGrad;
            roundRect(ctxCanvas, 55, 55, 870, 68, 16);
            ctxCanvas.fill();

            ctxCanvas.font = "bold 30px sans-serif";
            ctxCanvas.fillStyle = "#ffffff";
            ctxCanvas.textAlign = "center";
            ctxCanvas.fillText("SIYAM-HASAN  •  BOT STATUS", 490, 98);

            // Big Uptime Box
            ctxCanvas.fillStyle = "rgba(24, 24, 46, 0.95)";
            roundRect(ctxCanvas, 60, 145, 860, 90, 14);
            ctxCanvas.fill();
            ctxCanvas.fillStyle = "#a78bfa";
            ctxCanvas.fillRect(60, 145, 860, 5);

            ctxCanvas.font = "bold 16px sans-serif";
            ctxCanvas.fillStyle = "#c4b5fd";
            ctxCanvas.fillText("BOT UPTIME", 490, 175);

            ctxCanvas.font = "bold 34px sans-serif";
            ctxCanvas.fillStyle = "#ffffff";
            ctxCanvas.fillText(`${days}d   ${hours}h   ${minutes}m   ${seconds}s`, 490, 215);

            // 4 Grid Info Boxes
            const boxes = [
                { title: "PING", value: `${ping} MS`, x: 60, color: "#34d399" },
                { title: "PROCESS RAM", value: `${usedRAM} MB`, x: 280, color: "#fbbf24" },
                { title: "CPU LOAD", value: cpuLoad, x: 500, color: "#22d3ee" },
                { title: "CPU CORES", value: `${cpuCores}`, x: 720, color: "#a78bfa" }
            ];

            boxes.forEach((box) => {
                const y = 255;
                ctxCanvas.fillStyle = "rgba(24, 24, 46, 0.95)";
                roundRect(ctxCanvas, box.x, y, 200, 85, 12);
                ctxCanvas.fill();

                ctxCanvas.fillStyle = box.color;
                ctxCanvas.shadowColor = box.color;
                ctxCanvas.shadowBlur = 10;
                ctxCanvas.fillRect(box.x, y, 200, 4);
                ctxCanvas.shadowBlur = 0;

                ctxCanvas.font = "bold 14px sans-serif";
                ctxCanvas.fillStyle = "#a5b4fc";
                ctxCanvas.textAlign = "center";
                ctxCanvas.fillText(box.title, box.x + 100, y + 32);

                ctxCanvas.font = "bold 22px sans-serif";
                ctxCanvas.fillStyle = "#ffffff";
                ctxCanvas.fillText(box.value, box.x + 100, y + 62);
            });

            // RAM Usage Progress Bars
            ctxCanvas.fillStyle = "rgba(24, 24, 46, 0.95)";
            roundRect(ctxCanvas, 60, 360, 860, 100, 12);
            ctxCanvas.fill();
            ctxCanvas.fillStyle = "#06b6d4";
            ctxCanvas.fillRect(60, 360, 860, 4);

            // Process RAM Bar
            ctxCanvas.font = "bold 15px sans-serif";
            ctxCanvas.fillStyle = "#a5b4fc";
            ctxCanvas.textAlign = "left";
            ctxCanvas.fillText(`Process RAM  ${heapPercent}%`, 85, 395);

            ctxCanvas.fillStyle = "rgba(50, 50, 80, 1)";
            roundRect(ctxCanvas, 85, 410, 380, 14, 7);
            ctxCanvas.fill();
            ctxCanvas.fillStyle = "#fbbf24";
            roundRect(ctxCanvas, 85, 410, Math.min(380, 380 * (heapPercent / 100)), 14, 7);
            ctxCanvas.fill();

            // System RAM Bar
            ctxCanvas.fillStyle = "#a5b4fc";
            ctxCanvas.fillText(`System RAM  ${memPercent}%`, 500, 395);

            ctxCanvas.fillStyle = "rgba(50, 50, 80, 1)";
            roundRect(ctxCanvas, 500, 410, 380, 14, 7);
            ctxCanvas.fill();
            ctxCanvas.fillStyle = "#22d3ee";
            roundRect(ctxCanvas, 500, 410, Math.min(380, 380 * (memPercent / 100)), 14, 7);
            ctxCanvas.fill();

            ctxCanvas.font = "13px sans-serif";
            ctxCanvas.fillStyle = "#94a3b8";
            ctxCanvas.fillText(`${usedRAM} / ${totalHeap} MB`, 85, 445);
            ctxCanvas.fillText(`${usedMemGB} / ${totalMemGB} GB`, 500, 445);

            // Bottom System Specs Section
            ctxCanvas.fillStyle = "rgba(24, 24, 46, 0.95)";
            roundRect(ctxCanvas, 60, 480, 860, 95, 12);
            ctxCanvas.fill();
            ctxCanvas.fillStyle = "#7c3aed";
            ctxCanvas.fillRect(60, 480, 860, 4);

            ctxCanvas.font = "bold 14px sans-serif";
            ctxCanvas.fillStyle = "#a5b4fc";
            ctxCanvas.textAlign = "left";

            ctxCanvas.fillText("Node.js", 85, 515);
            ctxCanvas.fillText("Platform", 85, 550);
            ctxCanvas.fillText("Architecture", 300, 515);
            ctxCanvas.fillText("Hostname", 300, 550);
            ctxCanvas.fillText("PID", 560, 515);
            ctxCanvas.fillText("Status", 560, 550);

            ctxCanvas.font = "bold 14px sans-serif";
            ctxCanvas.fillStyle = "#ffffff";
            ctxCanvas.fillText(nodeVersion, 170, 515);
            ctxCanvas.fillText(platform, 170, 550);
            ctxCanvas.fillText(arch, 420, 515);
            ctxCanvas.fillText(hostname.substring(0, 14), 400, 550);
            ctxCanvas.fillText(String(pid), 620, 515);
            ctxCanvas.fillText("ONLINE", 640, 550);

            // Right Bottom Owner Stamp
            ctxCanvas.textAlign = "right";
            ctxCanvas.font = "bold 15px sans-serif";
            ctxCanvas.fillStyle = "#c4b5fd";
            ctxCanvas.fillText("NIJHUM CHATBOT", 890, 530);
            ctxCanvas.font = "12px sans-serif";
            ctxCanvas.fillStyle = "#7c3aed";
            ctxCanvas.fillText("Premium Real-time Card", 890, 555);

            // Generate Image Buffer & Save
            const cachePath = path.join(__dirname, "..", "cache");
            await fs.ensureDir(cachePath);
            const filePath = path.join(cachePath, `status_${Date.now()}.png`);
            await fs.writeFile(filePath, canvas.toBuffer("image/png"));

            try {
                await ctx.telegram.deleteMessage(chatId, waitMsg.message_id);
            } catch (e) {}

            // Dynamic Styled Telegram Message Caption
            const captionText = 
`╭❮ 𝗦𝗜𝗬𝗔𝗠•𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 ❯╮
┃
┣ ⏱️ 𝗨𝗣𝗧𝗜𝗠𝗘: ${days}𝗗 ${hours}𝗛 ${minutes}𝗠 ${seconds}𝗦
┣ ⚡ 𝗣𝗜𝗡𝗚: ${ping} 𝗠𝗦
┣ 🧠 𝗣𝗥𝗢𝗖𝗘𝗦𝗦
┣ 🎀 𝗥𝗔𝗠: ${usedRAM} / ${totalHeap} 𝗠𝗕
┣ 💻 𝗖𝗣𝗨 𝗟𝗢𝗔𝗗: ${cpuLoad}
┣ 🔐 (${cpuCores} 𝗖𝗢𝗥𝗘𝗦)
┣ 📊 𝗦𝗬𝗦𝗧𝗘𝗠 𝗥𝗔𝗠:
┣ 😘 ${usedMemGB} / ${totalMemGB} 𝗚𝗕
┃
┣ ⚙️ 𝗡𝗢𝗗𝗘.𝗝𝗦: ${nodeVersion}
┣ 🖥️ 𝗣𝗟𝗔𝗧𝗙𝗢𝗥𝗠: ${platform} (${arch})
┃
┣ 👑 𝗢𝗪𝗡𝗘𝗥: 𝗦𝗜𝗬𝗔𝗠 𝗛𝗔𝗦𝗔𝗡
┣ 🤖 𝗕𝗢𝗧: 𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧
╰━═━═━═━═━═━═━═━═━╯`;

            await ctx.replyWithPhoto({ source: filePath }, {
                caption: captionText,
                reply_to_message_id: messageId
            });

            setTimeout(() => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, 30000);

        } catch (err) {
            console.error("Uptime Error:", err);
            try {
                await ctx.telegram.deleteMessage(chatId, waitMsg.message_id);
            } catch (e) {}
            return ctx.reply("❌ আপটাইম কার্ড তৈরিতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
        }
    }
};
                             
