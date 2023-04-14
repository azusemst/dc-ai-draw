const {ButtonBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder} = require('discord.js');
const ShortUniqueId = require('short-unique-id');
const Keyv = require('keyv');

module.exports = {
    data: {
        name: 'generateNew'
    },

     /**
     * 
     * @param {ButtonInteraction} interaction 
     */
     async execute(interaction) {
        buttonId = interaction.component.customId;
        const old_uuid = buttonId.split('-')[1]
        const keyv = new Keyv('redis://localhost:6379');
        console.log(`key:${old_uuid}`);
        const json = await keyv.get(old_uuid);
        console.log(json);

        console.log("start generate");

        await interaction.deferUpdate();


        const request = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization": process.env.AUTH
            },
            body: json
        };

        const response = await fetch('http://121.41.44.246:8080/sdapi/v1/txt2img', request);
        const data = await response.json();
        const uid = new ShortUniqueId();
        const uuid = uid();

        const generateNewBtn = new ButtonBuilder()
            .setCustomId(`generateNew-${uuid}`)    
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
        await interaction.editReply({ content: "generated new:", files: buff, components: [actionRow] });   
        keyv.set(uuid, json);
    }
}