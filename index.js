const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config.json');


const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent
]
});


// Variables pour stocker les options activées
let features = {
welcome: true,
goodbye: true
};


client.once('ready', () => {
console.log(`✅ Connecté en tant que ${client.user.tag}`);
});


// Listener: arrivée d'un membre
client.on('guildMemberAdd', async (member) => {
if (!features.welcome) return;


const salonArrivee = member.guild.channels.cache.get(config.ids.salonArrivee)
|| await member.guild.channels.fetch(config.ids.salonArrivee).catch(() => null);


if (salonArrivee) {
await salonArrivee.send(`Bienvenue <@${member.id}> sur le serveur ! 🎉`);
}
});


// Listener: départ d'un membre
client.on('guildMemberRemove', async (member) => {
if (!features.goodbye) return;


const salonDepart = member.guild.channels.cache.get(config.ids.salonDepart)
|| await member.guild.channels.fetch(config.ids.salonDepart).catch(() => null);


if (salonDepart) {
await salonDepart.send(`<@${member.id}> a quitté le serveur 😢`);
}
});


// === Panneau de configuration ===
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));


// Page principale
app.get('/', (req, res) => {
res.send(`
<h1>Panneau de configuration du Bot</h1>
<form method="POST" action="/update">
<label>
<input type="checkbox" name="welcome" ${features.welcome ? 'checked' : ''}/> Activer messages de bienvenue
</label><br><br>
<label>
<input type="checkbox" name="goodbye" ${features.goodbye ? 'checked' : ''}/> Activer messages de départ
</label><br><br>
<button type="submit">Enregistrer</button>
</form>
`);
});
client.login(process.env.TOKEN);
