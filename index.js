require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const SALON_ARRIVEE_ID = '1400085345260802208';
const SALON_DEPART_ID = '1400085379016691762';

client.once('ready', () => {
  console.log('Bot est en ligne !');
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.channel.send('Pong!');
  }
});

client.on('messageCreate', message => {
  if (message.content === '!zd') {
    message.channel.send('good!');
  }
});


client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.get(SALON_ARRIVEE_ID);
  if (channel) {
    channel.send(`Bienvenue ${member.user.username} 👋`);
  }
});

client.on('guildMemberRemove', member => {
  const channel = member.guild.channels.cache.get(SALON_DEPART_ID);
  if (channel) {
    channel.send(`${member.user.username} a quitté le serveur 😢`);
  }
});

client.login(process.env.DISCORD_TOKEN);

// Serveur Web
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Bot Discord en ligne');
});
app.listen(PORT, () => {
  console.log(`Serveur HTTP écoute sur le port ${PORT}`);
});
