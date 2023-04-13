const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

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
            .setMaxValue(100))
        .addNumberOption(option => option
            .setName('denoising')
            .setDescription('denoising_strength')
            .setMinValue(0)
            .setMaxValue(1))
        .addStringOption(option => option
            .setName('negative')
            .setDescription('negative_prompt'))
        .addIntegerOption(option => option
            .setName('width')
            .setDescription('width'))
            .setMinValue(1)
            .setMaxValue(1024)
        .addIntegerOption(option => option
            .setName('height')
            .setDescription('width')
            .setMinValue(1)
            .setMaxValue(1024)
        ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const batch_size = interaction.options.getInteger('batch') ?? 1; // default = 1
        const steps = interaction.options.getInteger('steps') ?? 10;
        const denoising = interaction.options.getNumber('denoising') ?? 0.7;
        const negative_prompt = interaction.options.getString('negative');
        const width = interaction.options.getInteger('width') ?? 512;
        const height = interaction.options.getInteger('heiight') ?? 768;
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
        console.log(data.parameters);
        const buff = new Buffer.from(data.images[0], 'base64');
        await interaction.editReply({ content: prompt, files: [{ attachment: buff }] }); // 现在只会发一张图片

    }
}
