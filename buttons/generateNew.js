const {ButtonBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder} = require('discord.js');
const ShortUniqueId = require('short-unique-id');
const Keyv = require('keyv');

const logger = require('../logger');


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
        const keyv = new Keyv('rediss://clustercfg.nonoko-redis.q7sou3.memorydb.ap-northeast-1.amazonaws.com:6379');
        logger.info(`key:${old_uuid}`);
        const json = await keyv.get(old_uuid);
        logger.info(json);

        logger.info("start generate");

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

        if(!data.hasOwnProperty('images')) {
            await interaction.editReply({ content: `${interaction.user.username}'s drawing failed: ${JSON.stringify(data)}`});
            return;
        }

        const generateNewBtn = new ButtonBuilder()
            .setCustomId(`generateNew-${uuid}`)    
            .setLabel('Generate New')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔃');
        
        let actionRow = new ActionRowBuilder()
            .addComponents(generateNewBtn)

        logger.info(data.parameters);
        const buff = [];
        const actionRows = [];
        let count = 0;
        for (let i = 0; i < data.images.length; i++) {
            const pic = data.images[i];
            keyv.set(`image-${uuid}-${i}`, pic);
            newBtn = new ButtonBuilder()
                .setCustomId(`upscale-${uuid}-${i}`)
                .setLabel(`Upscale ${i}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⬆️');
            buff.push(Buffer.from(pic, 'base64'));
            actionRow.addComponents(newBtn);
            count++;
            if (count === 4 || i === data.images.length - 1) {
                // create new action row and add all buttons to it
                const newActionRow = actionRow.toJSON();
                actionRows.push(newActionRow);
                // reset the count and action row
                count = 0;
                actionRow = new ActionRowBuilder();
            }
        }
        await interaction.editReply({ content: "generated new:", files: buff, components: actionRows });   
        keyv.set(uuid, json);
    }
}