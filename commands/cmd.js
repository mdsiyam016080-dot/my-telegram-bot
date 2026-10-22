const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

function getDomain(url) {
    const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = {
    config: {
        name: "cmd",
        version: "2.0.0",
        author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
        role: 2, // শুধুমাত্র এডমিন ব্যবহার করতে পারবে
        category: "admin",
        description: "Manage, load, unload, install command files directly from Telegram"
    },

    onStart: async function ({ ctx, args, message }) {
        const action = (args[0] || "").toLowerCase();
        const commandsDir = path.join(__dirname);

        // 1. Single Command Load
        if (action === "load" && args[1]) {
            const fileName = args[1].endsWith(".js") ? args[1] : `${args[1]}.js`;
            const filePath = path.join(commandsDir, fileName);

            if (!fs.existsSync(filePath)) {
                return ctx.reply(`⚠️ | "${fileName}" নামের কোনো ফাইল পাওয়া যায়নি!`);
            }

            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);

                if (command.config && command.config.name) {
                    global.GoatBot.commands.set(command.config.name, command);
                    if (command.config.aliases) {
                        const aliases = Array.isArray(command.config.aliases) ? command.config.aliases : [command.config.aliases];
                        aliases.forEach(alias => global.GoatBot.aliases.set(alias, command.config.name));
                    }
                    return ctx.reply(`✅ | "${command.config.name}" কমান্ড সফলভাবে লোড হয়েছে!`);
                } else {
                    return ctx.reply(`❌ | "${fileName}" ফাইলে সঠিক config বা name পাওয়া যায়নি।`);
                }
            } catch (error) {
                return ctx.reply(`❌ | "${fileName}" লোড করতে ব্যর্থ হয়েছে:\n${error.message}`);
            }
        }

        // 2. Load All Commands
        else if (action === "loadall" || action === "load-all") {
            try {
                const files = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));
                let successCount = 0;
                let failCount = 0;

                for (const file of files) {
                    try {
                        const filePath = path.join(commandsDir, file);
                        delete require.cache[require.resolve(filePath)];
                        const command = require(filePath);

                        if (command.config && command.config.name) {
                            global.GoatBot.commands.set(command.config.name, command);
                            if (command.config.aliases) {
                                const aliases = Array.isArray(command.config.aliases) ? command.config.aliases : [command.config.aliases];
                                aliases.forEach(alias => global.GoatBot.aliases.set(alias, command.config.name));
                            }
                            successCount++;
                        }
                    } catch (e) {
                        failCount++;
                    }
                }
                return ctx.reply(`✅ | মোট (${successCount}) টি কমান্ড সফলভাবে লোড করা হয়েছে।${failCount > 0 ? `\n❌ | (${failCount}) টি কমান্ড লোড হতে ব্যর্থ হয়েছে।` : ""}`);
            } catch (err) {
                return ctx.reply(`❌ | Load All ব্যর্থ হয়েছে: ${err.message}`);
            }
        }

        // 3. Single Command Unload
        else if (action === "unload" && args[1]) {
            const cmdName = args[1].toLowerCase();
            const command = global.GoatBot.commands.get(cmdName) || global.GoatBot.commands.get(global.GoatBot.aliases.get(cmdName));

            if (!command) {
                return ctx.reply(`⚠️ | "${cmdName}" নামের কোনো কমান্ড সক্রিয় নেই!`);
            }

            const realName = command.config.name;
            if (command.config.aliases) {
                const aliases = Array.isArray(command.config.aliases) ? command.config.aliases : [command.config.aliases];
                aliases.forEach(alias => global.GoatBot.aliases.delete(alias));
            }

            global.GoatBot.commands.delete(realName);
            const filePath = path.join(commandsDir, `${realName}.js`);
            if (fs.existsSync(filePath)) {
                delete require.cache[require.resolve(filePath)];
            }

            return ctx.reply(`✅ | "${realName}" কমান্ডটি সফলভাবে আনলোড করা হয়েছে।`);
        }

        // 4. Unload All Commands
        else if (action === "unloadall" || action === "unload-all") {
            let count = 0;
            const currentCmd = "cmd";

            for (const [cmdName, cmdObj] of global.GoatBot.commands.entries()) {
                if (cmdName === currentCmd) continue;

                if (cmdObj.config?.aliases) {
                    const aliases = Array.isArray(cmdObj.config.aliases) ? cmdObj.config.aliases : [cmdObj.config.aliases];
                    aliases.forEach(alias => global.GoatBot.aliases.delete(alias));
                }

                global.GoatBot.commands.delete(cmdName);
                const filePath = path.join(commandsDir, `${cmdName}.js`);
                if (fs.existsSync(filePath)) {
                    delete require.cache[require.resolve(filePath)];
                }
                count++;
            }

            return ctx.reply(`✅ | সফলভাবে (${count}) টি কমান্ড আনলোড করা হয়েছে।`);
        }

        // 5. Install Command from Raw Link or Code
        else if (action === "install") {
            let url = args[1];
            let fileName = args[2];
            let rawCode = "";

            if (!url) {
                return ctx.reply("⚠️ | ব্যবহারের সঠিক নিয়ম:\n1. /cmd install <URL> <filename.js>\n2. /cmd install <filename.js> <code>");
            }

            if (url.endsWith(".js") && !isURL(url)) {
                const tmp = fileName;
                fileName = url;
                url = tmp;
            }

            // Link দিয়ে ডাউনলোড
            if (url && url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
                if (!fileName || !fileName.endsWith(".js")) {
                    return ctx.reply("⚠️ | অনুগ্রহ করে ফাইল সেভ করার নাম দিন (যেমন: filename.js)");
                }

                let domain = getDomain(url);
                if (!domain) return ctx.reply("⚠️ | অনুগ্রহ করে সঠিক URL প্রদান করুন।");

                if (domain === "pastebin.com") {
                    const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
                    if (url.match(regex)) url = url.replace(regex, "https://pastebin.com/raw/$1");
                } else if (domain === "github.com") {
                    const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
                    if (url.match(regex)) url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
                }

                try {
                    const response = await axios.get(url);
                    rawCode = response.data;
                    if (domain === "savetext.net") {
                        const $ = cheerio.load(rawCode);
                        rawCode = $("#content").text();
                    }
                } catch (e) {
                    return ctx.reply(`❌ | লিঙ্ক থেকে কোড ডাউনলোড করতে ব্যর্থ হয়েছে: ${e.message}`);
                }
            } 
            // সরাসরি কোড পেস্ট করে ইন্সটল
            else {
                if (args[1] && args[1].endsWith(".js")) {
                    fileName = args[1];
                    rawCode = args.slice(2).join(" ");
                } else if (args[args.length - 1].endsWith(".js")) {
                    fileName = args[args.length - 1];
                    rawCode = args.slice(1, -1).join(" ");
                } else {
                    return ctx.reply("⚠️ | অনুগ্রহ করে সেভ করার ফাইলের নাম নির্ধারণ করুন (যেমন: filename.js)।");
                }
            }

            if (!rawCode || typeof rawCode !== "string") {
                return ctx.reply("⚠️ | কোড পাওয়া যায়নি বা কোড ফাঁকা!");
            }

            const savePath = path.join(commandsDir, fileName);

            try {
                fs.writeFileSync(savePath, rawCode, "utf8");

                // Auto Load Installed File
                delete require.cache[require.resolve(savePath)];
                const command = require(savePath);

                if (command.config && command.config.name) {
                    global.GoatBot.commands.set(command.config.name, command);
                    if (command.config.aliases) {
                        const aliases = Array.isArray(command.config.aliases) ? command.config.aliases : [command.config.aliases];
                        aliases.forEach(alias => global.GoatBot.aliases.set(alias, command.config.name));
                    }
                    return ctx.reply(`✅ | "${command.config.name}" কমান্ডটি ইন্সটল এবং সফলভাবে লোড হয়েছে!\n📁 ফাইল সেভ হয়েছে: commands/${fileName}`);
                } else {
                    return ctx.reply(`⚠️ | ফাইলটি সেভ হয়েছে (${fileName}), কিন্তু লোড হতে ব্যর্থ হয়েছে (config সঠিক নয়)।`);
                }
            } catch (err) {
                return ctx.reply(`❌ | ইন্সটল করতে ত্রুটি দেখা দিয়েছে:\n${err.message}`);
            }
        }

        // Help Message
        else {
            return ctx.reply(
                "👑 ───── [ CMD MANAGER ] ───── 👑\n\n" +
                "📝 ব্যবহারের নিয়মাবলী:\n\n" +
                "1️⃣ একটি কমান্ড লোড করতে:\n/cmd load <filename>\n\n" +
                "2️⃣ সব কমান্ড একসাথে লোড করতে:\n/cmd loadall\n\n" +
                "3️⃣ একটি কমান্ড বন্ধ/আনলোড করতে:\n/cmd unload <cmdName>\n\n" +
                "4️⃣ সব কমান্ড একসাথে আনলোড করতে:\n/cmd unloadall\n\n" +
                "5️⃣ লিঙ্ক দিয়ে ইন্সটল করতে:\n/cmd install <URL> <filename.js>\n\n" +
                "6️⃣ কোড লিখে ইন্সটল করতে:\n/cmd install <filename.js> <code>\n" +
                "───────────────────────────"
            );
        }
    }
};
  
