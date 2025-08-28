require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Fichiers statiques (CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// Variables de configuration dynamiques
let config = {
  welcomeEnabled: true,
  goodbyeEnabled: true,
  roleEnabled: true,
  welcomeChannel: '1400085345260802208',
  goodbyeChannel: '1400085379016691762',
  roleId: '1399718805650931855'
};

// ----------- DISCORD BOT -----------
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
  if (message.content === '!ping') {
    message.channel.send('Pong!');
  }
  if (message.content === '!zd') {
    message.channel.send('ok!');
  }
});

client.on('guildMemberAdd', async member => {
  if (config.welcomeEnabled) {
    const salonArrivee = member.guild.channels.cache.get(config.welcomeChannel);
    if (salonArrivee) {
      salonArrivee.send(`Bienvenue <@${member.id}> 👋`);
    }
  }

  if (config.roleEnabled) {
    const role = member.guild.roles.cache.get(config.roleId);
    if (role) {
      await member.roles.add(role);
    }
  }
});

client.on('guildMemberRemove', member => {
  if (config.goodbyeEnabled) {
    const salonDepart = member.guild.channels.cache.get(config.goodbyeChannel);
    if (salonDepart) {
      salonDepart.send(`<@${member.id}> a quitté le serveur 😢`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// ----------- INTERFACE WEB -----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/update-config', (req, res) => {
  config = { ...config, ...req.body };
  console.log('✅ Nouvelle configuration :', config);
  res.json({ success: true, config });
});

// ----------- DEMARRAGE SERVEUR -----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur HTTP écoute sur le port ${PORT}`);
});
