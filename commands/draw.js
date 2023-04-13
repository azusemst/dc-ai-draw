const { SlashCommandBuilder, ChatInputCommandInteraction, } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('draw')
        .setDescription('生成图片')
        .addStringOption(option => option
            .setName('prompt')
            .setDescription('prompt')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('batch')
            .setDescription('batch_size')
            .setMinValue(1)
            .setMaxValue(100))
        .addIntegerOption(option => option
            .setName('steps')
            .setDescription('steps')
            .setMinValue(1)
            .setMaxValue(100)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const batch_size = interaction.options.getInteger('batch') ?? 1; // default = 1
        const steps = interaction.options.getInteger('steps') ?? 10;
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
                denoising_strength: 0.7,
                restore_faces: true,
                hr_upscaler: "Nearest"
            })
        }

        const response = await fetch('http://121.41.44.246:8080/sdapi/v1/txt2img', request);
        const data = await response.json();
        console.log(data.parameters);
        const buff = new Buffer.from(data.images[0], 'base64');
        await interaction.editReply({ files: [{ attachment: buff }] }); // 现在只会发一张图片

    }
}
