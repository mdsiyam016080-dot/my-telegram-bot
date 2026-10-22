const fs = require('fs');
const path = require('path');

function getSortedCommands() {
  const commandsDir = path.join(__dirname);
  let cmdSet = new Set();
  
  if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir).forEach(file => {
      if (file.endsWith('.js')) {
        try {
          const filePath = path.join(commandsDir, file);
          delete require.cache[require.resolve(filePath)];
          const cmd = require(filePath);
          const name = cmd.config?.name || cmd.name;
          if (name) {
            cmdSet.add(name.toLowerCase());
          }
        } catch (e) {}
      }
    });
  }

  return Array.from(cmdSet).sort();
}

module.exports = {
  config: {
    name: "help",
    aliases: ["commands", "menu", "start"],
    version: "3.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝗔𝗦𝗔𝗡",
    role: 0,
    category: "general"
  },

  onStart: async function ({ ctx }) {
    const commands = getSortedCommands();
    const totalCommands = commands.length;

    let text = `━━━━❪👤❫━━━━\n`;
    commands.forEach((cmd, index) => {
      const num = index + 1;
      text += `┣⊸ ${num} ✿ /${cmd}\n`;
    });
    text += `━━━━❪👤❫━━━━\n\n`;
    text += `🌿 ★ 𝗘𝗦𝗕-𝗕𝗢𝗧 ★\n`;
    text += `𝗧𝗢𝗧𝗔𝗟 𝗖𝗠𝗗: [ ${totalCommands} ]\n`;
    text += `𝗗𝗘𝗩: 𝐄𝐒𝐁-𝐓𝐄𝐀𝐌`;

    return ctx.reply(text);
  }
};
        
