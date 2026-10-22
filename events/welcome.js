module.exports = async function (ctx) {
    if (ctx.message?.new_chat_members) {
        try {
            await ctx.reply(`✨ 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 ✨\n──────────────────\n👋 হ্যালো, 𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧 এ আপনাকে স্বাগতম!\n👑 𝗢𝗪𝗡𝗘𝗥 : 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`);
        } catch (e) {}
    }
};
