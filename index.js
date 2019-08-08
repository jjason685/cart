const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();

var cooldowns = {};

client.login(config.token);

client.on('ready', () => console.log('ready!'));

client.on('message', async (msg) => {
    try {
        if (msg.embeds[0].fields[0].value.includes('Finish checking out here') && msg.author.username !== client.user.username) {
            const embed = {
                "embed": {
                    "color": 2096896,
                    "footer": {
                        "icon_url": "https://i.imgur.com/u77W5iD.png",
                        "text": "Wrath"
                    },
                    "thumbnail": {
                        "url": msg.embeds[0].thumbnail.url
                    },
                    "author": {
                        "name": "Wrath Webhook",
                        "icon_url": "https://i.imgur.com/u77W5iD.png"
                    },
                    "fields": [
                        {
                            "name": msg.embeds[0].fields[0].name,
                            "value": msg.embeds[0].fields[0].value.split('&')[0] + ')',
                        }
                    ]
                }
            };
            let embedSent = await client.channels.get(config.cartChannel).send({
                "embed": {
                    "color": 2096896,
                    "footer": {
                        "icon_url": "https://i.imgur.com/u77W5iD.png",
                        "text": "Wrath"
                    },
                    "thumbnail": {
                        "url": msg.embeds[0].thumbnail.url
                    },
                    "author": {
                        "name": "Wrath Webhook",
                        "icon_url": "https://i.imgur.com/u77W5iD.png"
                    },
                    "fields": [
                        {
                            "name": msg.embeds[0].fields[0].name,
                            "value": 'React first to be DM\'d a checkout URL.',
                        }
                    ]
                }
            })
            await embedSent.react('🛒');
            const filter = (reaction, user) => reaction.emoji.name === '🛒';
            let claimed = false;
            while (!claimed) {
                let reacts = await embedSent.awaitReactions(filter, { time: 100 });
                let arrayReacts = reacts.array();
                if (arrayReacts.length > 0) {
                    let numReacts = arrayReacts[0].count;
                    if (numReacts > 1) {
                        let users = arrayReacts[0].users.array().filter(x => {
                            if (cooldowns[x.id] && Date.now() - cooldowns[x.id] <= 120000) {
                                x.send(`You are under cooldown and cannot claim more carts for the next ${~~((120000 - Date.now() + cooldowns[x.id]) / 1000)} seconds.`)
                            }
                            return x.username !== client.user.username && (!cooldowns[x.id] || Date.now() - cooldowns[x.id] > 120000)
                        });
                        if (users.length > 0) {
                            claimed = true;
                            user = users[0];
                            embedSent.edit({
                                "embed": {
                                    "color": 16711680,
                                    "footer": {
                                        "icon_url": "https://i.imgur.com/u77W5iD.png",
                                        "text": "Wrath"
                                    },
                                    "thumbnail": {
                                        "url": msg.embeds[0].thumbnail.url
                                    },
                                    "author": {
                                        "name": "Wrath Webhook",
                                        "icon_url": "https://i.imgur.com/u77W5iD.png"
                                    },
                                    "fields": [
                                        {
                                            "name": msg.embeds[0].fields[0].name,
                                            "value": `Checkout link has been claimed by ${user.tag}`,
                                        }
                                    ]
                                }
                            })
                            cooldowns[user.id] = Date.now();
                            user.send(embed);
                        }
                    }
                }
            }
        }
    } catch (e) { }
})