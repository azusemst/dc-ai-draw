const { ButtonBuilder } = require('@discordjs/builders')
const {ButtonInteraction} = require('discord.js')

module.exports = {
    data: new ButtonBuilder()
    .setCustomId('generate new')    
    .setLabel('Generate New')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🔃'),

     /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
     async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const batch_size = interaction.options.getInteger('pics') ?? 2; // default = 2
        const steps = interaction.options.getInteger('steps') ?? 10;
        const denoising = interaction.options.getNumber('denoising') ?? 0.7;
        const negative_prompt = interaction.options.getString('negative') ?? "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry";
        const width = interaction.options.getInteger('width') ?? 512;
        const height = interaction.options.getInteger('height') ?? 768;
        await interaction.deferReply();

        const request = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization": process.env.AUTH
            },
            body: JSON.stringify({ // 其它参数暂时没加
                prompt: prompt,
                batch_size: batch_size,
                steps: steps,
                denoising_strength: denoising,
                negative_prompt: negative_prompt,
                restore_faces: true,
                hr_upscaler: "Nearest",
                sampler_name: "DPM++ 2M Karras",
                width: width,
                height: height
            })
        }

        const response = await fetch('http://121.41.44.246:8080/sdapi/v1/txt2img', request);
        const data = await response.json();

        const generateNewBtn = new ButtonBuilder()
            .setCustomId('generate new')    
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