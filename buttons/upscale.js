const {ButtonBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder} = require('discord.js');
const ShortUniqueId = require('short-unique-id');
const Keyv = require('keyv');
const axios = require('axios');


module.exports = {
    data: {
        name: 'upscale'
    },

    /**
     * 
     * @param {ButtonInteraction} interaction 
     */
    async execute(interaction) {
        buttonId = interaction.component.customId;
        const old_uuid = buttonId.split('-')[1];
        const idx_pic = buttonId.split('-')[2];
        const keyv = new Keyv('redis://localhost:6379');
        console.log(`image-${old_uuid}-${idx_pic}`);
        const pic = await keyv.get(`image-${old_uuid}-${idx_pic}`);

        console.log("generate");

        await interaction.deferUpdate();

        let formData = new FormData();
        formData.append('sync', '1');
        formData.append('type', 'face');
        formData.append('return_type', '2');
        formData.append('image_base64', pic);
          
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://techsz.aoscdn.com/api/tasks/visual/scale',
            headers: { 
              'X-API-KEY': 'wxnjcva3it2zn4l8l'
            },
            data : formData
          };
          
        const { data } = axios.post(config);
        console.log(data);
        const buff = [];

        buff.push(new Buffer.from(data.image, 'base64'));
        await interaction.editReply({ content: "Upscale result", files: buff});   
    }
}