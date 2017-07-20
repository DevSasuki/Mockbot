const Discord = require('discord.js');
const fs = require("fs");
const sql = require("sqlite");
sql.open("./score.sqlite");
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setGame(`Mocking ${client.guilds.size} user(s)... | ;help`)
  client.user.setStatus('idle');
});

var prefix = ";";

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

client.on('message', message => {
  if (message.author.bot) return; // Ignore bots.
  if (message.channel.type === "dm") return; // Ignore DM channels.

  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
  if (!row) {
    sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
  } else {
    let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
    if (curLevel > row.level) {
      row.level = curLevel;
      sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
      message.reply(`You've leveled up to level **${curLevel}**!`);
    }
    sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
  }
}).catch(() => {
  console.error;
  sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
    sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
  });
});

if (!message.content.startsWith(prefix)) return;

if (message.content.startsWith(prefix + "level")) {
  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) return message.channel.send("Your current level is 0");
    message.channel.send(`Your current level is ${row.level}`);
  });
} else

if (message.content.startsWith(prefix + "points")) {
  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) return message.channel.send("sadly you do not have any points yet!");
    message.channel.send(`you currently have ${row.points} points, good going!`);
  });
}

if (message.content.startsWith(prefix + 'ping')) {
  message.channel.send("Readying the troops...").then(sent => {
    sent.edit(`:ping_pong: Pong! | Response Time: ${sent.createdTimestamp - message.createdTimestamp}ms`)
  })
} else {
  if (message.content.startsWith(prefix + 'pong')) {
    message.channel.send("Ping!")
  }
}

if (message.content.startsWith(prefix + 'eval')) {
if(message.author.id !== "229552088525438977") return;
let evall = message.content.split(' ')[0];
let evalstuff = message.content.split(" ").slice(1).join(" ")
try {
    const code = message.content.split(" ").slice(1).join(" ")
    let evaled = eval(code);

    if (typeof evaled !== 'string')
      evaled = require('util').inspect(evaled);

      const embed = new Discord.RichEmbed()
      .setTitle(`Evaluation:`)

      .setColor("0x4f351")
      .setDescription(`:inbox_tray: Input: \n \`\`\`${evalstuff}\`\`\` \n :outbox_tray: Output: \n  \`\`\`${clean(evaled)}\`\`\``)

    message.channel.send({embed});
  } catch (err) {
    const embed = new Discord.RichEmbed()
    .setTitle(`Evaluation:`)

    .setColor("0xff0202")
    .setDescription(`:inbox_tray: Input: \n \`\`\`${evalstuff}\`\`\` \n :outbox_tray: Output: \n  \`\`\`${clean(err)}\`\`\``)

    message.channel.send({embed});
  }
}

if (message.content.startsWith(prefix + 'help')) {
  message.author.send(`__**Mockbot Commands**__\n
\`ping\`: If I respond, I'm connected!
\`pong\`: Opposite of ping
\`level\`: Shows your level!
\`points\`: Shows your points!\n
If there's a bug, contact: void#4938`)
}

if (message.content.startsWith(prefix + 'restart')) {
   if(message.author.id !== '229552088525438977') return;
   message.channel.send('Rebooting...').then(() => {
     client.destroy().then(() => {
       process.exit();
     })
   })
 }
});

client.login('MzM3NTQwNjM0MDYxNzAxMTMx.DFIWxA.YH-JPRtgJBGZPTp7yefMx4nE-dg');
