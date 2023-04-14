
const {ButtonBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder} = require('discord.js');
const ShortUniqueId = require('short-unique-id');
const Keyv = require('keyv');

module.exports = {
    data: {
        name: 'generate new'
    },

     /**
     * 
     * @param {ButtonInteraction} interaction 
     */
     async execute(interaction) {
        buttonId = interaction.component.customId;
        uid = buttonId.split('-')[1]
        const keyv = new Keyv('redis://localhost:6379');
        json = keyv.get(uid);

        const response = await fetch('http://121.41.44.246:8080/sdapi/v1/txt2img', JSON.parse(json));
        const data = await response.json();


        const generateNewBtn = new ButtonBuilder()
            .setCustomId(`generateNew`)    
            .setLabel('Generate New')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔃');
        
        const actionRow = new ActionRowBuilder()
            .addComponents(generateNewBtn)

        console.log(data.parameters);
        const buff = [];
        for (pic of data.images) {
            buff.push(new Buffer.from(pic, 'base64'));
        }
        await interaction.editReply({ content: prompt, files: buff, components: [actionRow] });   
    }
}