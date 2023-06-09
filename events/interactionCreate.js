const { Events } = require('discord.js');
const logger = require('../logger');


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`Error: No command matching "${interaction.commandName}" was found.`);
                return;
            }

            try {
                logger.info(`Executing command ${interaction.commandName}...`);
                await command.execute(interaction);
                logger.info('Executed command!')
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        } else if (interaction.isButton()) {
            logger.info(`button clicked: ${interaction.component.customId}`);
            buttonId = interaction.component.customId;
            buttonName = buttonId.split('-')
            logger.info(buttonName)


            const button = interaction.client.buttons.get(buttonName[0]);
            if (!button) {
                console.error(`Error: No button matching "${interaction.component.customId}" was found.`);
                return;
            }

            try {
                logger.info(`Executing button ${interaction.component.customId}...`);
                await button.execute(interaction);
                logger.info('Executed button!')
            } catch (error) {
                console.error(`Error executing ${interaction.component.customId}`);
                console.error(error);
            }
        }
    },
};