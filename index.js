require('dotenv').config();

const token = process.env.TOKEN;
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.chatSessions = new Map();
const channel_id = process.env.SERVER_IE_CHANNEL_ID;

client.commands = new Collection(); 
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath); // Read folders in ./commands/

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file); //Read files in ./commands/*/*.js
		const command = require(filePath); // Individual file
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on('ready', async () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
    const guild_debug = client.guilds.cache.get(client);
    const channel_debug = client.channels.cache.get(channel_id);    
    const date = new Date();
    const time = date.toLocaleDateString('pt-BR');
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    await channel_debug.send(`I'm alive :D\nStart time: ${time}, ${hours}:${minutes}:${seconds}:${milliseconds}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    console.log(`Start log for interaction ${interaction}.\n`);

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command){
        console.log(`No command ${command}!\n`);
        return;
    }

    try{
        await command.execute(interaction);
    } catch (error){
        if(interaction.replied || interaction.deferred){
            await interaction.followUp({ content: `There was an error while executing this command!\n debug: ${error}`, flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: `There was an error while executing this command!\n debug: ${error}`, flags: MessageFlags.Ephemeral });
        }
    }
})



client.login(token);



