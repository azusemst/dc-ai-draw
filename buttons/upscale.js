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
        pic = keyv.get(`image-${old_uuid}-${idx_pic}`);

        await interaction.deferReply();

        
        const request = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization": process.env.AUTH
            },
            body: JSON.stringify({ // 其它参数暂时没加
                resize_mode: 0,
                show_extras_results: true,
                upscaling_resize: 2,
                upscaler_1: "R-ESRGAN 4x+",
                image: pic
            })
        };

        console.log(JSON.stringify(request));

        const response = await fetch('http://121.41.44.246:8080/sdapi/v1/extra-single-image', request);
        const data = await response.json();
        const buff = [];

        buff.push(new Buffer.from(data.image, 'base64'));
        await interaction.editReply({ content: "Upscale result", files: buff});   
    }
}