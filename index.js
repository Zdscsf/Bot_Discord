require('dotenv').config();
if (config.features.goodbye && config.ids.salonDepart && member.guild) {
try {
client.on('guildMemberRemove', async member => {
  const salonDepart = member.guild.channels.cache.get(config.ids.salonDepart)
    || await member.guild.channels.fetch(config.ids.salonDepart).catch(() => null);

  if (salonDepart) {
    salonDepart.send(`<@${member.id}> a quitté le serveur 😢`);
  }
});

if (salonDepart && salonDepart.isTextBased()) {
client.on('guildMemberRemove', async (member) => {
  const salonDepart = member.guild.channels.cache.get(config.ids.salonDepart)
    || await member.guild.channels.fetch(config.ids.salonDepart).catch(() => null);

  if (salonDepart) {
    await salonDepart.send(`<@${member.id}> a quitté le serveur 😢`);
  }
});
}
} catch (err) {
console.error('[GOODBYE] Erreur envoi message départ:', err.message);
}
}
});


// ====== Connexion Discord ======
client.login(process.env.DISCORD_TOKEN).catch((e) => {
console.error('[DISCORD] Échec de connexion :', e.message);
process.exit(1);
});


// ====== API & Panneau de configuration ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- Auth basique par Bearer token sur /api ---
const requireAuth = (req, res, next) => {
const auth = req.headers['authorization'] || '';
const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
if (!process.env.ADMIN_TOKEN) {
return res.status(500).json({ error: 'ADMIN_TOKEN non configuré sur le serveur' });
}
if (token === process.env.ADMIN_TOKEN) return next();
return res.status(401).json({ error: 'Non autorisé' });
};


// Servir l'UI
app.use(express.static(path.join(__dirname, 'public')));


// Healthcheck simple (utile pour Render)
app.get('/health', (_req, res) => res.send('ok'));


// --- Routes API protégées ---
app.get('/api/config', requireAuth, (req, res) => {
res.json(config);
});


app.put('/api/config', requireAuth, (req, res) => {
try {
const incoming = req.body || {};
// Validation/merge simple et sécurisée
const merged = {
features: {
ping: Boolean(incoming?.features?.ping ?? config.features.ping),
zd: Boolean(incoming?.features?.zd ?? config.features.zd),
welcome: Boolean(incoming?.features?.welcome ?? config.features.welcome),
goodbye: Boolean(incoming?.features?.goodbye ?? config.features.goodbye),
},
ids: {
salonArrivee: String(incoming?.ids?.salonArrivee ?? config.ids.salonArrivee),
salonDepart: String(incoming?.ids?.salonDepart ?? config.ids.salonDepart),
roleId: String(incoming?.ids?.roleId ?? config.ids.roleId),
}
};
config = merged;
saveConfig();
res.json({ status: 'ok', config });
} catch (e) {
console.error('[API] Erreur maj config:', e);
res.status(400).json({ error: 'Payload invalide' });
}
});


// Démarrage HTTP
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`[HTTP] Panel sur port ${PORT}`);
});
