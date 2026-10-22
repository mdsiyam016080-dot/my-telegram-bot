const { Telegraf, Markup } = require('telegraf');
const fs = require('fs-extra');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
    console.error("❌ config.json ফাইলটি পাওয়া যায়নি!");
    process.exit(1);
}

const config = require('./config.json');
const bot = new Telegraf(config.BOT_TOKEN);

// Database simulation for user credits
const userCredits = {};
const DEFAULT_CREDITS = 10;

// Helper: Get user role
function getUserRole(userId) {
    if (config.ROLES[userId] !== undefined) return config.ROLES[userId];
    if (config.ADMIN_IDS.includes(userId)) return 2;
    return 0; // Role 0: General User
}

// Load Commands Dynamically
bot.context.commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const cmd = require(path.join(commandsPath, file));
        if (cmd.config && cmd.config.name) {
            bot.context.commands.set(cmd.config.name, cmd);
        }
    }
}

// Load Events Dynamically
const events = [];
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        events.push(require(path.join(eventsPath, file)));
    }
}

// Middleware for Events & Commands
bot.use(async (ctx, next) => {
    // Run Event Handlers
    for (const eventHandler of events) {
        try {
            await eventHandler(ctx, bot);
        } catch (e) {
            console.error("Event error:", e.message);
        }
    }

    if (!ctx.message || !ctx.message.text) return next();

    const text = ctx.message.text.trim();
    const prefix = config.PREFIX || "/";

    if (!text.startsWith(prefix)) return next();

    const args = text.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = bot.context.commands.get(commandName);
    if (!command) return next();

    const userId = ctx.from.id;
    const userRole = getUserRole(userId);
    const requiredRole = command.config.role || 0;

    // Role check
    if (userRole < requiredRole) {
        return ctx.reply(`❌ অনলি মাই বস সিয়াম ! (প্রয়োজনীয় রোল: Role ${requiredRole})`);
    }

    // Credit Check for general user features
    if (userRole === 0) {
        if (userCredits[userId] === undefined) userCredits[userId] = DEFAULT_CREDITS;
        if (userCredits[userId] <= 0) {
            return ctx.reply(
                "❌ আপনার ক্রেডিট শেষ! নতুন ক্রেডিট পেতে গ্রুপে ১০ জন মেম্বার এড করুন অথবা অনারের সাথে যোগাযোগ করুন।",
                Markup.inlineKeyboard([
                    [Markup.button.url("👤 Contact Owner", config.ADMIN_LINK)],
                    [Markup.button.url("➕ Add to Group", `https://t.me/${config.BOT_USERNAME}?startgroup=true`)]
                ])
            );
        }
        userCredits[userId] -= 1;
    }

    try {
        await command.onStart({ ctx, args, bot, userCredits, config, getUserRole });
    } catch (err) {
        console.error(`Command Error (${commandName}):`, err);
        ctx.reply("⚠️ কমান্ড এক্সিকিউট করার সময় একটি ত্রুটি ঘটেছে।");
    }

    return next();
});

bot.launch().then(() => console.log("🤖 Bot is successfully running!")).catch(console.error);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
      
