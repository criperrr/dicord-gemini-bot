const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('getinfo').setDescription('get user info'),
    async execute(interaction){
        await interaction.reply({ 
            content: `Seu ID: ${interaction.user.id}\n
                      ID do canal atual: ${interaction.channel.id}`, 
        });
    }
}