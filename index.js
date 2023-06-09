require('dotenv').config();
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const logger = require('./logger');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

// handle commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        logger.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// handle buttons
client.buttons = new Collection();
const buttonPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const filePath = path.join(buttonPath, file);
    const button = require(filePath);
    if ('data' in button && 'execute' in button) {
        client.buttons.set(button.data.name, button);
    } else {
        logger.warn(`[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// handle events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
logger.info(`${client.commands.size} commands, ${eventFiles.length} events, ${client.buttons.size} buttons added`);

require('./deploy-commands')(client);
client.handleCommands();
client.login(process.env.TOKEN);
