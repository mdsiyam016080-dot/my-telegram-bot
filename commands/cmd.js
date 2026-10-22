const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "cmd",
        version: "2.1.0",
        author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
        role: 2,
        category: "admin",
        description: "Manage command files directly"
    },

    onStart: async function ({ ctx, args }) {
        const action = (args[0] || "").toLowerCase();
        const commandsDir = __dirname;

        if (action === "load" && args[1]) {
            const fileName = args[1].endsWith(".js") ? args[1] : `${args[1]}.js`;
            const filePath = path.join(commandsDir, fileName);
            if (!fs.existsSync(filePath)) return ctx.reply(`⚠️ | ফাইল পাওয়া যায়নি: ${fileName}`);

            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);
                const cmdName = command.config?.name || command.name;
                if (cmdName) {
                    global.GoatBot.commands.set(cmdName.toLowerCase(), command);
                    return ctx.reply(`✅ | কমান্ড লোড সফল হয়েছে: ${cmdName}`);
                }
                return ctx.reply(`❌ | ফাইলের স্ট্রাকচার সঠিক নয়।`);
            } catch (err) {
                return ctx.reply(`❌ | ত্রুটি: ${err.message}`);
            }
        }

        else if (action === "unload" && args[1]) {
            const cmdName = args[1].toLowerCase();
            if (global.GoatBot.commands.has(cmdName)) {
                global.GoatBot.commands.delete(cmdName);
                return ctx.reply(`✅ | কমান্ড আনলোড সফল হয়েছে: ${cmdName}`);
            }
            return ctx.reply(`⚠️ | কমান্ডটি সক্রিয় নেই।`);
        }

        else {
            return ctx.reply("👑 CMD Manager Active!\n- /cmd load <filename>\n- /cmd unload <filename>");
        }
    }
};
        
