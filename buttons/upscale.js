const {ButtonBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder} = require('discord.js');
const ShortUniqueId = require('short-unique-id');
const Keyv = require('keyv');
const Replicate = require('replicate');
const logger = require('../logger');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
        const keyv = new Keyv('redis://clustercfg.nonoko-redis.q7sou3.memorydb.ap-northeast-1.amazonaws.com:6379');
        logger.info(`image-${old_uuid}-${idx_pic}`);
        const pic = await keyv.get(`image-${old_uuid}-${idx_pic}`);

        logger.info("generate");

        await interaction.deferUpdate();

        var request = require('request');
        var options = {
          'method': 'POST',
          'url': 'https://api.imgbb.com/1/upload?expiration=600&key=27f31d69b5e2be2ec233ed07b37a33a4',
          'headers': {
          },
          formData: {
            'image': pic
          }
        };
        request(options, async function (error, response) {
          if (error) {
            logger.error(`An error occurred while upload: ${error}`, { stack: error.stack });
            throw new Error(error);
          } 
          logger.info(response.body);

          const responseBody = JSON.parse(response.body);

          const output = await replicate.run(
            "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
            {
              input: {
                image: responseBody.data.url
              }
            }
          );

          logger.info(output); // <-- 在这里打印输出
          await interaction.editReply({ content: "Upscale result", files: [
            {attachment: output, name: "image.jpg"},
            ] });
        });
    },
}