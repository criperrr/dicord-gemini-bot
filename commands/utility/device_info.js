const gsmarena = require('gsmarena-api');
const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('device').setDescription('Get device info from GSMArena')
    .addStringOption(device =>
        device.setName('model')
        .setDescription('The EXACT model of device.')
        .setRequired(true)
    ),
    async execute(interaction){
        await interaction.deferReply();
        const device_input = interaction.options.getString('model');

        try{
            const api_result = await gsmarena.search.search(device_input);
            if(api_result.length === 0){
                 await interaction.reply({
                    content: ('No devices found. Sorry.'),
                });
                return;
            }
            const names = [];
            const actionRows = [];
            let current_row = new ActionRowBuilder();
            let names_string = null;
            let response;
            for(device of api_result) names.push(device.name);

            if(names.length > 1){
                names_string = 'Research result: \n';

                for(let i = 0; i < names.length; i++){
                    names_string += `${names[i].toLowerCase().includes('apple')? '🍎': names[i].toLowerCase().includes('samsung')? '🔵': '📱' } ${i+1}. ${names[i]}\n`;
                    const button = new ButtonBuilder()
                        .setCustomId(`${names[i]}`)
                        .setLabel(`${i+1}`)
                        .setStyle(ButtonStyle.Secondary);
                    
                    current_row.addComponents(button);

                    if(i === 24) break;
                    if((i+1) % 5 === 0){
                        actionRows.push(current_row);
                        current_row = new ActionRowBuilder();
                    }
                }
                actionRows.push(current_row);

                names_string += '\n **Select an option (in 60s)**'
                response = await interaction.editReply({
                    content: names_string,
                    components: actionRows,
                    withResponse: true
                });

            } else{
                 response = await interaction.followUp({
                    content: 'Searching for technical specs...',
                    components: [],
                    withResponse: false
                });
            }
            
            const collectorFilter = i => i.user.id === interaction.user.id;
            try {
                const option = (names.length > 1)? (await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })).customId : names[0];
                
                const device = await gsmarena.search.search(option);
                const deviceId = device.find(device => device.name === option);
                const specs = await gsmarena.catalog.getDevice(deviceId.id);
                const specs_quick = specs.quickSpec;
                let specs_string = `${option} technical specifications: \nDevice img link: ${specs.img}\n`
                for(let i = 0; i < specs_quick.length; i++){
                    specs_string += `${specs_quick[i].name}: ${specs_quick[i].value}\n`
                }
                await interaction.editReply({
                    content: specs_string,
                    components: [],
                    withResponse: false
                })
            } catch (error){
                console.error("[Chat Error]", error);
                await interaction.followUp({ content: 'You havent selected any option in 1 minute delay', components: [] , ephemeral: true});
            }
        } catch (error){
            console.error("[Chat Error]", error);
            await interaction.followUp("Ocorreu um erro ao processar sua mensagem.");
        }
    }
}