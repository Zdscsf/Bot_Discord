require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const axios = require('axios');
const app = express();

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

let config = fs.existsSync('./config.json') ? require('./config.json') : { guilds: {} };

client.once('ready', () => {
  console.log('Bot est en ligne !');
});

client.on('messageCreate', message => {
  if (message.content === '!ping') message.channel.send('Pong!');
  if (message.content === '!zd') message.channel.send('ok!');
});

client.on('guildMemberAdd', async member => {
  const guildConfig = config.guilds[member.guild.id];
  if (!guildConfig) return;

  if (guildConfig.welcomeEnabled) {
    const channel = member.guild.channels.cache.get(guildConfig.arrivalChannel);
    if (channel) channel.send(`Bienvenue <@${member.id}> 👋`);
  }

  if (guildConfig.autoRoleEnabled) {
    const role = member.guild.roles.cache.get(guildConfig.autoRole);
    if (role) await member.roles.add(role);
  }
});

client.on('guildMemberRemove', member => {
  const guildConfig = config.guilds[member.guild.id];
  if (!guildConfig || !guildConfig.goodbyeEnabled) return;

  const channel = member.guild.channels.cache.get(guildConfig.departureChannel);
  if (channel) channel.send(`<@${member.id}> a quitté le serveur 😢`);
});

client.login(process.env.DISCORD_TOKEN);

// ===== EXPRESS + OAUTH2 =====
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// ===== ROUTES =====
app.get('/', (req, res) => {
  res.send('Bot Discord en ligne');
});

app.get('/login', (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify guilds`;
  res.redirect(redirect);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('Erreur: pas de code');

  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI,
      scope: 'identify guilds',
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = tokenResponse.data;
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    req.session.user = {
      id: userResponse.data.id,
      username: userResponse.data.username,
      guilds: guildsResponse.data,
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err.response?.data || err);
    res.send('Erreur lors de la connexion');
  }
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

app.get('/config/:guildId', isAuthenticated, (req, res) => {
  const guildId = req.params.guildId;
  const guildConfig = config.guilds[guildId] || {};
  res.render('config', { guildId, config: guildConfig });
});

app.post('/config/:guildId', isAuthenticated, (req, res) => {
  const guildId = req.params.guildId;
  config.guilds[guildId] = {
    arrivalChannel: req.body.arrivalChannel,
    departureChannel: req.body.departureChannel,
    autoRole: req.body.autoRole,
    welcomeEnabled: !!req.body.welcomeEnabled,
    goodbyeEnabled: !!req.body.goodbyeEnabled,
    autoRoleEnabled: !!req.body.autoRoleEnabled,
  };
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  res.send('Configuration mise à jour ! <a href="/dashboard">Retour</a>');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur HTTP écoute sur le port ${PORT}`);
});
