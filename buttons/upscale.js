const {ButtonBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder} = require('discord.js');
const ShortUniqueId = require('short-unique-id');
const Keyv = require('keyv');

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

        var request = require('request');
        request({
        'method': 'POST',
        'url': 'https://techsz.aoscdn.com/api/tasks/visual/scale',
        'headers': {
          'X-API-KEY': 'wxnjcva3it2zn4l8l'
        },
        formData: {
          'sync': '1',
          'image_base64': pic,
          'type': 'face'
        }
        }, async function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        const buff = [];
        buff.push(new Buffer.from(response.body.image, 'base64'));
        await interaction.editReply({ content: "Upscale result", files: buff});   
        });
    }
}