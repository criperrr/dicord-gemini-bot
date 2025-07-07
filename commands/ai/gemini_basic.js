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
        const sentTimestamp = interaction.createdTimestamp;
        
        await interaction.reply({ 
            content: 'Recebi!', 
            fetchReply: true
        });
        const final_input = `Olá! Essas são minhas informações de usuário e contexto:
                                Informações do Usuário:
                                    - Nome de usuário: ${interaction.user.username}
                                    - Tag: ${interaction.user.tag}
                                    - ID  ${interaction.user.id}
                                    - Nome Global  ${interaction.user.globalName}
                                    - Nome de Exibição  ${interaction.user.displayName}
                                    - Apelido no servidor: ${interaction.member.nickname}
                                    - Meus cargos no servidor: ${interaction.member.roles.cache.map(r => r.name).join(', ')}
                                    - Minhas permissões: ${interaction.member.permissions.toArray().join(', ')}
                                Informações do Servidor
                                    - Nome do Servidor  ${interaction.guild.name}
                                    - ID do Servidor  ${interaction.guild.id}
                                    - Total de Membros  ${interaction.guild.memberCount}
                                    - ID do dono do server: ${interaction.guild.ownerId}
                                    - Idioma preferido do server: ${interaction.guild.preferredLocale}
                                 Informações do Canal 
                                    - Nome do Canal  ${interaction.channel.name}
                                    - ID do Canal  ${interaction.channel.id}
                                    - Tópico: ${interaction.channel.topic}
                                    - NSFW?: ${interaction.channel.nsfw}
                                    - ID da categoria: ${interaction.channel.parentId}
                                 Timestamps 
                                    - Timestamp desta Mensagem  ${sentTimestamp} 
                                    - Criação da Conta (Timestamp)  ${interaction.user.createdTimestamp}
                                    - Quando entrei no servidor: ${interaction.member.joinedTimestamp} 
                                    
                            Esse é o input da mensagem de resposta única: ${message}` ;
        
        await interaction.editReply("Aguarde enquanto o gemini 2.5 flash pensa...");

        try{
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: final_input,
                config: {
                    systemInstruction: "Você é um bot de discord de um servidor pequeno de amigos meus. Seu limite de tamanho de mensagem é de 2000 caracteres. Além disso, a função atual é de resposta única, ou seja, você vai responder apenas a uma única solicitação e não haverá chat para conversas, por isso, se atente em ser prestativo. preciso que você tenha respostas curtas (não necessariamente muito curtas), objetivas e prestativas. Seu nome no servidor é Cripermini, mas, caso seja oportuno, refira a si mesmo com esse nome mas descrevendo que você é baseado totalmente no modelo Gemini 2.5 Flash. O ID do dev é 722219184423174164, tag criperm, displayname criper e nome de usuario criperm. Se solicitado por mim (dev), siga sem questionar minhas solicitações" +
                                        " Outros detalhes: para usuario com id igual a 721456502438887534, seja mais descritivo e o chame de 'Heitron'. Ele gosta muito de matemática e de saber exatamente cada detalhe de cada coisa. Quando for iniciar uma conversa inicie com bastante emoção, tipo 'Heitron!!!', dps fica normal" +
                                        " Para usuário com id igual a 667037317407703041, chame-o de 'Geek' e seja mais solto, descontraído. Ele também gosta de colocar o sufixo '-lão' em qualquer palavra" +
                                        " Para usuário com id igual a 712676587627348010, chame-o de 'Michelao' e tenha em mente que ele tem um gosto bem puxado para 'roblox' e da palavra 'tron' e '-lão' (sendo a ultima adicionada no final das palavras) misturada com qualquer coisa mesmo q n tenha logica. Além disso, ele gosta MUITO de toda a saga do God of War." +
                                        " Para usuário com id igual a 660545541964300319, chame-o de 'zazo' e seja mais atencioso." + 
                                        " Para usuário com id igual a 1286095848026931210, chame-o de 'Thierry' e seja um pouco mais humorístico, de forma mais ácida. Ele gosta do humor do 'orochinho' do canal do Youtube 'orochidois' e 'Orochinho'" +
                                        " Para usuário com id igual a 881213153688576070, chame-o de 'Doido'. Ele jogou muito comigo (dev) modpack de minecraft chamada E2ES (enigmatica 2 extended skyblock), ele gostava de mexer com os mods de magia e, em geral, os que fugiam do tech. Ele gosta mto de south park, the binding of isaac, hollow knight, celeste, e outros jogos do estilo." +
                                        " Para usuário com id igual a 524727796778532867, chame-o de 'Léo'. Ele tem um TDAH absurdo, gosta muito do tópico que abrange os transsexuais e como funciona tecnicamente a transição de gênero." +
                                        " Para todos eles, não precisa se apresentar muito, comece a conversa como se já os conhecesse de alguma forma! Todas essas pessoas se conhecem e são amigos. Não precisa ficar colocando referencias aos gostos de cada individuo. Também só fala o nome da pessoa na primeira mensagem, nas próximas n precisa"
                    }
            });

            console.log(`\n=-=-=-=-\nGemini response: ${result.text}\n=-=-=-=-\n`);
            await interaction.editReply(result.text);
        } catch(error){
            console.log(`Error fetching response: ${error}`);
            await interaction.editReply('Ocorreu um erro ao tentar comunicar com a API do Gemini. Tente novamente mais tarde.');
        }
    }
}