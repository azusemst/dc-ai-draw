const { Events } = require('discord.js');

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
                console.log(`Executing command ${interaction.commandName}...`);
                await command.execute(interaction);
                console.log('Executed command!')
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        } else if (interaction.isButton()) {
            console.log(`button clicked: ${interaction.component.customId}`);
            buttonId = interaction.component.customId;
            buttonName = buttonId.split('-')
            console.log(buttonName)


            const button = interaction.client.buttons.get(buttonName[0]);
            if (!button) {
                console.error(`Error: No button matching "${interaction.component.customId}" was found.`);
                return;
            }

            try {
                console.log(`Executing button ${interaction.component.customId}...`);
                await button.execute(interaction);
                console.log('Executed button!')
            } catch (error) {
                console.error(`Error executing ${interaction.component.customId}`);
                console.error(error);
            }
        }
    },
};