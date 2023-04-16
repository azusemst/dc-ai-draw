const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const ShortUniqueId = require('short-unique-id');
const Keyv = require('keyv');
const deepl = require('deepl'); // 导入deepl模块

async function translate_to_english(text) {
  // 判断字符串是否包含中文字符
  for (let char of text) {
    if ('\u4e00' <= char && char <= '\u9fff') {
      const api_key = 'd4462d35-a54d-0caa-ff7d-097b3812fc92:fx';
      const resp = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
            'Authorization': 'DeepL-Auth-Key d4462d35-a54d-0caa-ff7d-097b3812fc92:fx',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `text=${text}&target_lang=EN-GB`
    });

    const translate = await resp.json();
    console.log(translate);
    return translate.translations[0].text; // 返回翻译后的英文字符串
    }
  }
  return text; // 不包含中文，直接返回原字符串
} 


module.exports = {
    data: new SlashCommandBuilder()
        .setName('draw')
        .setDescription('生成图片')
        .addStringOption(option => option
            .setName('prompt')
            .setDescription('prompt')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('pics')
            .setDescription('batch_size')
            .setMinValue(1)
            .setMaxValue(9))
        .addIntegerOption(option => option
            .setName('steps')
            .setDescription('steps')
            .setMinValue(1)
            .setMaxValue(50))
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
            .setDescription('width')
            .setMinValue(1)
            .setMaxValue(1024))
        .addIntegerOption(option => option
            .setName('height')
            .setDescription('height')
            .setMinValue(1)
            .setMaxValue(1024)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const keyv = new Keyv('redis://localhost:6379');

        const prompt = await translate_to_english(interaction.options.getString('prompt'));
        const batch_size = interaction.options.getInteger('pics') ?? 4; // default = 2
        const steps = interaction.options.getInteger('steps') ?? 20;
        const denoising = interaction.options.getNumber('denoising') ?? 0.7;
        const negative_prompt = interaction.options.getString('negative') ?? "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry";
        const width = interaction.options.getInteger('width') ?? 512;
        const height = interaction.options.getInteger('height') ?? 768;

        console.log("start");

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
        };
        const uid = new ShortUniqueId();
        const uuid = uid();
        keyv.set(uuid, request.body);
        const response = await fetch('http://121.41.44.246:8080/sdapi/v1/txt2img', request);
        const data = await response.json();

        const generateNewBtn = new ButtonBuilder()
            .setCustomId(`generateNew-${uuid}`)    
            .setLabel('Generate New')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔃');
          
        const actionRow = new ActionRowBuilder()
            .addComponents(generateNewBtn);
        console.log(`key:${uuid}`);
        console.log(data.parameters);
        const buff = [];
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
        }
        await interaction.editReply({ content: `${interaction.user.username}'s drawing:`, files: buff, components: [actionRow]});   
    }
}
