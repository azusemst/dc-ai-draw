
const {ButtonBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder} = require('discord.js')

module.exports = {
    data: {
        name: 'generate new'
    },

     /**
     * 
     * @param {ButtonInteraction} interaction 
     */
     async execute(interaction) {
        const optionsData = interaction.message.components[0].components[0].data;
        const options = optionsData.options;
        
        const prompt = options.prompt;
        const batch_size = options.batch_size ?? 2; // default = 2
        const steps = options.steps ?? 10;
        const denoising = options.denoising ?? 0.7;
        const negative_prompt = options.negative_prompt ?? "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry";
        const width = options.width ?? 512;
        const height = options.height ?? 768;
        
        await deferReply();

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