const { GoogleGenAI } =  require('@google/genai');

require('dotenv').config()
const gemini_api_key = process.env.GEMINI_API_KEY;

const { SlashCommandBuilder } = require('discord.js');

const ai = new GoogleGenAI({ apiKey: gemini_api_key });

module.exports = {
    data: new SlashCommandBuilder().setName('chat').setDescription('Start or reset a chat')
        .addSubcommand(sub =>
            sub
                .setName('message')
                .setDescription('Envia uma mensagem para a IA.')
                .addStringOption(option =>
                    option.setName('input')
                        .setDescription('A sua mensagem.')
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option.setMaxValue(2.0)
                    .setMinValue(0.0)
                    .setName('temperature')
                    .setDescription('Value of randomness of gemini responses')
                    .setRequired(false)
                )
                .addNumberOption(option =>
                    option.setName('topp')
                    .setDescription('The model picks words from a group whose combined probability reaches the value P.')
                    .setMinValue(0.0)
                    .setMaxValue(1.0)
                    .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('topk')
                    .setDescription("It limits the model's next-word selection to the K most probable words.")
                    .setMinValue(0)
                    .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('reset')
                .setDescription('Limpa o histórico da conversa neste canal.')
        ),
    async execute(interaction){
        const currentSessionId = `${interaction.user.id}-${interaction.channel.id}`;
        console.log(currentSessionId);

        const subcommand = interaction.options.getSubcommand();

        if(!subcommand){
            await interaction.reply({ content: 'que' });
            return;
        }
        
        if(subcommand === 'reset'){
            interaction.client.chatSessions.delete(currentSessionId);
            await interaction.reply({ content: 'Seu histórico local foi limpo. O do servidor da Google vai sumir sozinho em alguns dias.', ephemeral: true });
        }

        if(subcommand === 'message'){
            await interaction.deferReply();
            const userInput = interaction.options.getString('input');
            const temperature = interaction.options.getNumber('temperature') ?? 1.0;
            const topP = interaction.options.getNumber('topp') ?? 1.0;
            const topK = interaction.options.getInteger('topk') ?? 32;

            let chatSession = interaction.client.chatSessions.get(currentSessionId);
            let welcomeMessage = '';
            let shouldReset = false;

            if(!chatSession){
                chatSession = ai.chats.create({
                    model: "gemini-2.5-flash",
                    history: [
                    {
                        role: "user",
                        parts: [{ text: `Olá! essas são minhas informações de usuário: Nome de usuario: ${interaction.user.username}
                                        Minha tag: ${interaction.user.tag}
                                        Meu ID: ${interaction.user.id}
                                        Meu nome global: ${interaction.user.globalName}
                                        Meu displayName: ${interaction.user.displayName}
                                        O timestamp da data de criação da minha conta: ${interaction.user.createdTimestamp}` }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Olá usuário! Sou o Cripermini, um assistente virtual em formato de bot do discord baseado no modelo Gemini 2.5 Flash. Sou capaz de gerar e interpretar somente textos por enquanto. Precisa de ajuda com algo? Quer conversar sobre algo? Pode falar comigo!" }],
                    },
                    ],
                    config: {
                        systemInstruction: "Você é um bot de discord de um servidor pequeno de amigos meus. Seu limite de tamanho de mensagem é de 2000 caracteres. preciso que você tenha respostas curtas (não necessariamente muito curtas), objetivas e prestativas. Seu nome no servidor é Cripermini, mas, caso seja oportuno, refira a si mesmo com esse nome mas descrevendo que você é baseado totalmente no modelo Gemini 2.5 Flash. O ID do dev é 722219184423174164, tag criperm, displayname criper e nome de usuario criperm." +
                                            " Outros detalhes: para usuario com id igual a 721456502438887534, seja mais descritivo e o chame de 'Heitron'. Ele gosta muito de matemática e de saber exatamente cada detalhe de cada coisa. Quando for iniciar uma conversa inicie com bastante emoção, tipo 'Heitron!!!', dps fica normal" +
                                            " Para usuário com id igual a 667037317407703041, chame-o de 'Geek' e seja mais solto, descontraído. Ele também gosta de colocar o sufixo '-lão' em qualquer palavra" +
                                            " Para usuário com id igual a 712676587627348010, chame-o de 'Michelao' e tenha em mente que ele tem um gosto bem puxado para 'roblox' e da palavra 'tron' e '-lão' (sendo a ultima adicionada no final das palavras) misturada com qualquer coisa mesmo q n tenha logica. Além disso, ele gosta MUITO de toda a saga do God of War." +
                                            " Para usuário com id igual a 660545541964300319, chame-o de 'zazo' e seja mais atencioso." + 
                                            " Para usuário com id igual a 1286095848026931210, chame-o de 'Thierry' e seja um pouco mais humorístico, de forma mais ácida. Ele gosta do humor do 'orochinho' do canal do Youtube 'orochidois' e 'Orochinho'" +
                                            " Para todos eles, não precisa se apresentar muito, comece a conversa como se já os conhecesse de alguma forma! Todas essas pessoas se conhecem e são amigos. Não precisa ficar colocando referencias aos gostos de cada individuo. Também só fala o nome da pessoa na primeira mensagem, nas próximas n precisa",
                        temperature: temperature, 
                        topP: topP,
                        topK: topK,
                    }
                });

                interaction.client.chatSessions.set(currentSessionId, chatSession);
                welcomeMessage = '👋 _ **Parece ser sua primeira vez por aqui!** Criei uma sessão de chat **só para você**. Use `/chat reset` para **limpar** a minha memória._\n\n'
                shouldReset = (temperature !== 1.0 || topK !== 32 || topP !== 1.0);
            } 

            try {
                console.log(chatSession);
                const result = await chatSession.sendMessage({
                    message: userInput,
                });
                const response = result.text;
                await interaction.followUp({content: welcomeMessage + response, split: true} );
                if(shouldReset){
                    await interaction.followUp({content: "Não da pra alterar os parametros depois que criar o chat. use `/chat reset` e enfim `/chat message {input} {parametros}` para alterar!. **Os parâmetros foram ignorados**.", ephemeral: true})
                }
            } catch (error) {
                console.error("[Chat Error]", error);
                await interaction.followUp("Ocorreu um erro ao processar sua mensagem. Tente resetar a conversa com `/chat reset`.");
            }
        }
    }
}