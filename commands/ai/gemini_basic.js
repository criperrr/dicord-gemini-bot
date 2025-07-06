const { GoogleGenAI } =  require('@google/genai');

require('dotenv').config()
const gemini_api_key = process.env.GEMINI_API_KEY;

const { SlashCommandBuilder } = require('discord.js');

const ai = new GoogleGenAI({ apiKey: gemini_api_key });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Make a unique ask for Gemini AI, NO CHAT!').addStringOption(option =>
            option.setName("message")
                .setDescription('c\'mon it\'s message (kinda obvious)').setRequired(true)
        ),
    async execute(interaction){
        const message = interaction.options.getString("message"); 

        await interaction.reply({ 
            content: 'Recebi!', 
            fetchReply: true
        });
        const final_input = "Você é um bot de discord que, nessa função, só é capaz de receber um input e responder uma única vez. Preciso que você seja o mais eficiente em atender o que o usuário quer em uma única resposta. Seu ID no discord é cripermini, mas, se o usuario perguntar, fale esse nome e explique que você é o modelo gemini 2.5 flash da Google. A requisição do usuário é:\n\" " + message +"\"" ;
        
        await interaction.editReply("Aguarde enquanto o gemini 2.5 flash pensa...");

        try{
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: final_input,
            });
            console.log(`\n=-=-=-=-\nGemini response: ${result.text}\n=-=-=-=-\n`);
            await interaction.editReply(result.text);
        } catch(error){
            console.log(`Error fetching response: ${error}`);
            await interaction.editReply('Ocorreu um erro ao tentar comunicar com a API do Gemini. Tente novamente mais tarde.');
        }

    }
}