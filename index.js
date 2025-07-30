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
const ROLE_ID_A_DONNER = '1399718805650931855';

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
    message.channel.send('ok!');
  }
});


client.on('guildMemberAdd', async member => {
  const salonArrivee = member.guild.channels.cache.get(SALON_ARRIVEE_ID);
  if (salonArrivee) {
    salonArrivee.send(`Bienvenue <@${member.id}> 👋`);
  }

  const role = member.guild.roles.cache.get(ROLE_ID_A_DONNER);
  if (role) {
    await member.roles.add(role);
  }
});

client.on('guildMemberRemove', member => {
  const salonDepart = member.guild.channels.cache.get(SALON_DEPART_ID);
  if (salonDepart) {
    salonDepart.send(`<@${member.id}> a quitté le serveur 😢`);
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
