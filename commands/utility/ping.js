const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Get ping in ms and return pong!'),
    async execute(interaction){
        const sentTimestamp = interaction.createdTimestamp;
        const reply = await interaction.reply({ 
            content: 'Calculando ping...', 
            fetchReply: true
        });

        const repliedTimestamp = reply.createdTimestamp;
        const roundtripLatency = repliedTimestamp - sentTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping) < 0? 
                        `A latência da API deu negativo (${Math.round(interaction.client.ws.ping)}). Eu tenho CERTEZA que não dá pra alcançar velocidades negativas, então isso **foi um erro**.`:
                        (Math.round(interaction.client.ws.ping) + 'ms');


        await interaction.editReply(
            `Pong! 🏓\n` +
            `**Latência do Bot (Roundtrip):** ${roundtripLatency}ms\n` +
            `**Latência da API (WebSocket):** ${apiLatency}`
        );
    }
}