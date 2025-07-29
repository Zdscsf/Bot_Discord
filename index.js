require('dotenv').config(); // Charge les variables .env en local

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log('Bot est en ligne !');
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.channel.send('Pong!');
  }
});

client.login(process.env.DISCORD_TOKEN);

// Petit serveur express pour garder Render content (évite que Render coupe le process)
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Bot Discord en ligne');
});
app.listen(PORT, () => {
  console.log(`Serveur HTTP écoute sur le port ${PORT}`);
});
