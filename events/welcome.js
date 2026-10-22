const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require("axios");

// Helper: Draw rounded rectangle
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

// Helper: Draw circular avatar with lighting border
async function drawProfileImage(ctx, imageUrl, x, y, size, borderColor) {
    const radius = size / 2;
    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 5000
        });
        const img = await loadImage(Buffer.from(response.data));
        
        // Lighting glow effect
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = borderColor;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border ring
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = "#0f1020";
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, size, size);
        ctx.restore();
        return true;
    } catch (error) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = borderColor;
        ctx.font = `bold ${radius * 0.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('U', x, y);
        return false;
    }
}

async function createWelcomeCard(userImg, userName, threadName, memberCount, adderName) {
    const width = 1200;
    const height = 650;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Premium Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#080915");
    bgGrad.addColorStop(0.5, "#121429");
    bgGrad.addColorStop(1, "#05060d");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Neon Lighting Orbs in Background
    const orb1 = ctx.createRadialGradient(200, 150, 10, 200, 150, 400);
    orb1.addColorStop(0, "rgba(0, 245, 212, 0.2)");
    orb1.addColorStop(1, "transparent");
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, width, height);

    const orb2 = ctx.createRadialGradient(1000, 500, 10, 1000, 500, 450);
    orb2.addColorStop(0, "rgba(255, 0, 127, 0.18)");
    orb2.addColorStop(1, "transparent");
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, width, height);

    // Card Inner Container with Glowing Border
    ctx.save();
    ctx.shadowColor = "rgba(0, 245, 212, 0.3)";
    ctx.shadowBlur = 25;
    drawRoundRect(ctx, 35, 35, width - 70, height - 70, 28);
    ctx.fillStyle = "rgba(15, 18, 38, 0.88)";
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "rgba(0, 245, 212, 0.5)";
    ctx.lineWidth = 2.5;
    drawRoundRect(ctx, 35, 35, width - 70, height - 70, 28);
    ctx.stroke();

    // Draw User Profile Picture (Center-Left)
    await drawProfileImage(ctx, userImg, 260, 290, 200, "#00f5d4");

    // Texts and Typography
    ctx.textAlign = "left";
    
    // Group Name Header
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`✨ GROUP: ${threadName.toUpperCase()}`, 450, 150);

    // WELCOME Title with Gradient
    const textGrad = ctx.createLinearGradient(450, 180, 850, 180);
    textGrad.addColorStop(0, "#00f5d4");
    textGrad.addColorStop(0.5, "#7000ff");
    textGrad.addColorStop(1, "#ff007f");
    ctx.font = "bold 75px sans-serif";
    ctx.fillStyle = textGrad;
    ctx.fillText("WELCOME", 450, 235);

    // User Name
    ctx.font = "bold 42px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(userName, 450, 305);

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(450, 340);
    ctx.lineTo(1050, 340);
    ctx.stroke();

    // Details info boxes
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#34d399";
    ctx.fillText(`👥 Member Number: #${memberCount}`, 450, 395);

    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`👤 Added By: ${adderName}`, 450, 440);

    // Footer Branding
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("NIJHUM CHATBOT • SYSTEM WELCOME CARD", 450, 520);

    return canvas.toBuffer();
}

module.exports = async function (ctx) {
    if (!ctx.message || !ctx.message.new_chat_members) return;

    try {
        const chat = ctx.chat;
        const newMembers = ctx.message.new_chat_members;
        const adder = ctx.message.from;
        const threadName = chat.title || "Group";
        const memberCount = await ctx.telegram.getChatMembersCount(chat.id).catch(() => 1);

        const cacheDir = path.join(__dirname, "..", "cache");
        await fs.ensureDir(cacheDir);

        for (const member of newMembers) {
            if (member.is_bot) continue;

            const userId = member.id;
            const userName = member.first_name || "User";
            const adderName = adder.first_name || "Admin";

            // Get User Avatar
            let userAvatar = null;
            try {
                const photos = await ctx.telegram.getUserProfilePhotos(userId, 0, 1);
                if (photos && photos.total_count > 0) {
                    const fileId = photos.photos[0][0].file_id;
                    const fileLink = await ctx.telegram.getFileLink(fileId);
                    userAvatar = fileLink.href;
                }
            } catch (e) {
                userAvatar = null;
            }

            // Fallback avatar if none found
            if (!userAvatar) {
                userAvatar = "https://i.imgur.com/7Qk8k6c.png";
            }

            // Generate Canvas Image Buffer
            const imageBuffer = await createWelcomeCard(
                userAvatar,
                userName,
                threadName,
                memberCount,
                adderName
            );

            const tempPath = path.join(cacheDir, `welcome_${userId}_${Date.now()}.png`);
            await fs.writeFile(tempPath, imageBuffer);

            // Send Welcome Message with Photo Card
            const captionText = 
`🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 ${threadName} 🌸
━━━━━━━━━━━━━━━━━━━━
🌷 𝐍𝐚𝐦𝐞: ${userName}
🔢 𝐌𝐞𝐦𝐛𝐞𝐫 #${memberCount}
👤 𝐀𝐝𝐝𝐞𝐝 𝐛𝐲: ${adderName}
━━━━━━━━━━━━━━━━━━━━
✨ আমাদের গ্রুপে আপনাকে স্বাগতম! আশা করি আপনার সময় ভালো কাটবে। নিয়ম মেনে চ্যাট করুন! 😊`;

            await ctx.replyWithPhoto({ source: tempPath }, {
                caption: captionText
            });

            // Clean up cache file after sending
            setTimeout(() => {
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            }, 10000);
        }
    } catch (error) {
        console.error("Welcome Card Error:", error);
    }
};
        
