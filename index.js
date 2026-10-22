const { Telegraf, Markup } = require('telegraf');
const fs = require('fs-extra');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
    console.error("❌ config.json file not found!");
    process.exit(1);
}

const config = require('./config.json');
const bot = new Telegraf(config.BOT_TOKEN);

global.GoatBot = {
    commands: new Map(),
    aliases: new Map(),
    onChat: []
};

const userCredits = {};
const DEFAULT_CREDITS = 10;

function getUserRole(userId) {
    if (config.ROLES[userId] !== undefined) return config.ROLES[userId];
    if (config.ADMIN_IDS.includes(userId)) return 2;
    return 0;
}

// Load Commands dynamically
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const filePath = path.join(commandsPath, file);
            delete require.cache[require.resolve(filePath)];
            const cmd = require(filePath);
            
            const cmdName = cmd.config?.name || cmd.name;
            if (cmdName) {
                global.GoatBot.commands.set(cmdName.toLowerCase(), cmd);
                const aliases = cmd.config?.aliases || cmd.aliases;
                if (aliases) {
                    const aliasList = Array.isArray(aliases) ? aliases : [aliases];
                    aliasList.forEach(alias => global.GoatBot.aliases.set(alias.toLowerCase(), cmdName.toLowerCase()));
                }
            }
        } catch (e) {
            console.error(`Error loading command ${file}:`, e.message);
        }
    }
}

// Load Events
const eventsPath = path.join(__dirname, 'events');
const eventHandlers = [];
if (fs.existsSync(eventsPath)) {
    const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            eventHandlers.push(require(path.join(eventsPath, file)));
        } catch (e) {}
    }
}

bot.on('message', async (ctx) => {
    try {
        const message = ctx.message;
        if (!message) return;

        const senderID = String(message.from.id);
        const threadID = String(message.chat.id);
        let text = message.text || message.caption || "";

        // শুধু "/" দিলে অটোমেটিক /help কমান্ড রান হবে
        if (text.trim() === "/") {
            text = "/help";
        }

        const apiMock = {
            sendMessage: async (content, tid, cb) => {
                let res;
                if (typeof content === 'string') {
                    res = await ctx.reply(content);
                } else if (content.attachment) {
                    res = await ctx.replyWithVideo({ source: content.attachment }, { caption: content.body })
                            .catch(() => ctx.replyWithPhoto({ source: content.attachment }, { caption: content.body }));
                } else {
                    res = await ctx.reply(content.body || "");
                }
                if (cb && typeof cb === 'function') cb(null, res);
                return res;
            },
            sendTypingIndicator: async () => {},
            getUserInfo: async () => ({ [senderID]: { name: message.from.first_name || "jan" } }),
            setMessageReaction: async (emoji) => { try { await ctx.react(emoji); } catch(e){} },
            getCurrentUserID: () => bot.botInfo?.id || "bot",
            unsendMessage: async (mid) => { try { await ctx.deleteMessage(mid); } catch(e){} }
        };

        const eventMock = {
            senderID, threadID, messageID: message.message_id, body: text,
            messageReply: message.reply_to_message ? { messageID: message.reply_to_message.message_id, senderID: String(message.reply_to_message.from.id), body: message.reply_to_message.text || message.reply_to_message.caption } : undefined,
            attachments: message.photo ? [{ type: 'photo', url: 'photo_url' }] : []
        };

        const messageMock = {
            reply: async (content) => typeof content === 'string' ? await ctx.reply(content) : await ctx.reply(content.body || ""),
            send: async (content) => ctx.reply(typeof content === 'string' ? content : content.body)
        };

        // Run Event Handlers
        for (const ev of eventHandlers) {
            try { await ev(ctx); } catch (e) {}
        }

        // Run Command System
        const prefix = config.PREFIX || "/";
        if (text.startsWith(prefix)) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const realCmdName = global.GoatBot.commands.has(cmdName) ? cmdName : global.GoatBot.aliases.get(cmdName);

            if (realCmdName) {
                const command = global.GoatBot.commands.get(realCmdName);
                const userRole = getUserRole(Number(senderID));
                const requiredRole = command.config?.role !== undefined ? command.config.role : (command.role || 0);

                if (userRole < requiredRole) {
                    return ctx.reply(`❌ এই কমান্ডটি ব্যবহারের অনুমতি আপনার নেই!`);
                }

                if (userRole === 0) {
                    if (userCredits[senderID] === undefined) userCredits[senderID] = DEFAULT_CREDITS;
                    if (userCredits[senderID] <= 0) {
                        return ctx.reply(
                            "❌ আপনার ক্রেডিট শেষ! নতুন ক্রেডিট পেতে অনারের সাথে যোগাযোগ করুন।",
                            Markup.inlineKeyboard([
                                [Markup.button.url("👤 Contact Owner", config.ADMIN_LINK)],
                                [Markup.button.url("➕ Add to Group", `https://t.me/${config.BOT_USERNAME}?startgroup=true`)]
                            ])
                        );
                    }
                    userCredits[senderID] -= 1;
                }

                if (typeof command.onStart === 'function') {
                    await command.onStart({ api: apiMock, event: eventMock, args, message: messageMock, ctx, userCredits });
                } else if (typeof command.execute === 'function') {
                    await command.execute(bot, message, args);
                }
                return;
            }
        }

        // Run onChat (for Baby / Autolink)
        for (const [_, cmdObj] of global.GoatBot.commands) {
            if (cmdObj.onChat) {
                try { await cmdObj.onChat({ api: apiMock, event: eventMock, message: messageMock }); } catch(e) {}
            }
        }

    } catch (e) {
        console.error("Main message error:", e);
    }
});

bot.on('message_reaction', async (ctx) => {
    try {
        const reaction = ctx.update.message_reaction;
        if (reaction) {
            await ctx.telegram.deleteMessage(reaction.chat.id, reaction.message_id);
        }
    } catch(e){}
});

function launchBot() {
    bot.launch().then(async () => {
        console.log("🤖 Nijhum Bot active 24/7!");
        try {
            await bot.telegram.setMyCommands([
                { command: "help", description: "বটের সাহায্য ও কমান্ডের তালিকা" },
                { command: "baby", description: "নিঝুম চ্যাটবটের সাথে কথা বলুন" },
                { command: "edit", description: "এআই ফটো এডিট করুন" },
                { command: "undress", description: "এআই ফটো প্রসেসিং (Role 2)" },
                { command: "gan", description: "র্যান্ডম গান শুনুন" },
                { command: "balance", description: "আপনার ক্রেডিট চেক করুন" },
                { command: "reset", description: "ক্রেডিট রিসেট করুন (Admin)" },
                { command: "addadmin", description: "এডমিন রোল পরিবর্তন করুন" },
                { command: "cmd", description: "কমান্ড ম্যানেজমেন্ট (Admin)" }
            ]);
        } catch (e) {}
    }).catch((err) => {
        console.error("⚠️ Restarting in 5 seconds...", err);
        setTimeout(launchBot, 5000);
    });
}

launchBot();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
