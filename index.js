require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mot de passe admin pour le panneau web
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

// Configuration dynamique
let config = {
  welcomeEnabled: true,
  goodbyeEnabled: true,
  roleEnabled: true,
  welcomeChannel: '1400085345260802208',
  goodbyeChannel: '1400085379016691762',
  roleId: '1399718805650931855',
  pingEnabled: true // toggle pour !ping
};

// ----------- BOT DISCORD -----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log('✅ Bot en ligne !');
});

client.on('messageCreate', message => {
  if (config.pingEnabled && message.content === '!ping') {
    message.channel.send('Pong!');
  }
  if (message.content === '!zd') {
    message.channel.send('ok!');
  }
});

client.on('guildMemberAdd', async member => {
  if (config.welcomeEnabled) {
    const salon = member.guild.channels.cache.get(config.welcomeChannel);
    if (salon) salon.send(`Bienvenue <@${member.id}> 👋`);
  }

  if (config.roleEnabled) {
    const role = member.guild.roles.cache.get(config.roleId);
    if (role) await member.roles.add(role);
  }
});

client.on('guildMemberRemove', member => {
  if (config.goodbyeEnabled) {
    const salon = member.guild.channels.cache.get(config.goodbyeChannel);
    if (salon) salon.send(`<@${member.id}> a quitté le serveur 😢`);
  }
});

client.login(process.env.DISCORD_TOKEN);

// ----------- Panneau web sécurisé -----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.redirect('/panel.html');
  } else {
    res.send('Mot de passe incorrect !');
  }
});

app.get('/panel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'panel.html'));
});

// API pour mettre à jour la config
app.post('/update-config', (req, res) => {
  const { password, ...newConfig } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  config = { ...config, ...newConfig };
  console.log('✅ Configuration mise à jour :', config);
  res.json({ success: true, config });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Panneau web écoute sur le port ${PORT}`));
