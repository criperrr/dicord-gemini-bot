require('dotenv').config()
const gemini_api_key = process.env.GEMINI_API_KEY;

const { GoogleGenAI } =  require('@google/genai');
const ai = new GoogleGenAI({ apiKey: gemini_api_key });
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('romance')
    .setDescription('Faça uma história de romance com dois nomes!')
    .addStringOption(option =>
        option.setName('nome')
        .setDescription('Primeiro nome do romance FICTÍCIO')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('nomedois')
        .setDescription('segundo nome da história FICTÍCIA')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('tags')
        .setDescription('Tags para influenciar a história (ex.: amor, desilusao, gravidez, michelao)')
        .setRequired(false)
    )
    .addStringOption(option =>
        option
        .setName('escrita')
        .setDescription('Forma de escrita da IA (ex: narrativa, poema, canção...)')
        .setRequired(false)
    ),
    async execute(interaction){
        await interaction.deferReply();

        const nome1 = interaction.options.getString('nome');
        const nome2 = interaction.options.getString('nomedois');
        const tags = interaction.options.getString('tags') ?? '';
        const escrita = interaction.options.getString('escrita') ?? '';
        const request = `Você é um bot do discord cujo unico objetivo instancial é gerar uma história de amor unindo um casal formado pelo ${nome1} e pelo ${nome2}. A história deve ser bem curta, não ultrapassando os 1800 caractéres.
                        O usuário é capaz de modificar a história através das tags, nesse caso, as tags que deverão ser temas inclusos na história são: [${tags}]. No caso de estar vazia as tags, não as use.
                        Além disso, você deve incluir uma forma de escrita dada pelo usuário: [${escrita}] (caso vazio, faça em forma de narrativa com narrador personagem (sendo ele um dos amantes) onisciente)
                        A história necessariamente precisa ser um romance e necessariamente precisa ser de amor onde relacione esses dois nomes.
                        Destacando novamente: a história **DEVE** ser **CURTA**! ` 


        try {
            const limiteDeCaracteres = 1980;
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: request,
            });
            const text = result.text;

            if (text.length <= limiteDeCaracteres) {
                await interaction.followUp(text);
                return;
            }

            const partes = [];
            for (let i = 0; i < text.length; i += limiteDeCaracteres) {
                partes.push(text.substring(i, i + limiteDeCaracteres));
            }

            await interaction.followUp(partes[0]);

            for (let i = 1; i < partes.length; i++) {
                await interaction.channel.send(partes[i]);
            }
        } catch(error){
            console.error("[Chat Error]", error);
            await interaction.followUp("Ocorreu um erro ao processar sua mensagem. Tente resetar a conversa com `/chat reset`.");
        }
    }
}