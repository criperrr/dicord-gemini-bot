const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('skibidi').setDescription('toilet'),
    async execute(interaction){
        await interaction.reply({content: "🚽👨🏻"})
    }
}