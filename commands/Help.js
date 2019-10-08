const Chariot = require('chariot.js');

class Help extends Chariot.Command {
    constructor() {
        super();

        this.name = 'help';
        this.permissions = ['embedLinks'];
        this.help = {
            message: 'Get either a general Help card or instructions for specified commands! Specifying a command is optional. If a command was specified its help text will show up.',
            usage: 'help [command]',
            example: ['help', 'help command'],
            inline: true
        }
    }

    async execute(message, args, chariot) {
        if (!args[0]) {
            const commandNames = chariot.commands.map((cmnds) => '`' + cmnds.name + '`');

            return message.channel.createEmbed(new Chariot.RichEmbed()
                .setColor(chariot.chariotOptions.chariotConfig.primaryColor || 'RANDOM')
                .setTitle('Command Help')
                .setDescription(`Get detailed command instructions for any command!\n You can specify a certain command by writing \`${chariot.chariotOptions.chariotConfig.prefix}help <commandName>\`!`)
                .addField('Commands', commandNames.join(', '))
            );
        } else {
            const foundCommand = chariot.commands.get(args[0]) || chariot.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(args[0]));

            if (!foundCommand) {
                return message.channel.createEmbed(new Chariot.RichEmbed()
                    .setColor('RED')
                    .setTitle(`Couldn't find command **${args[0]}**!`)
                );
            }

            if (foundCommand.owner && !chariot.chariotOptions.chariotConfig.owner.includes(message.author.id)) {
                return message.channel.createEmbed(new Chariot.RichEmbed()
                    .setColor('RED')
                    .setTitle('Insufficient Permissions!')
                );
            }

            if (foundCommand && !foundCommand.help) {
                return message.channel.createEmbed(new Chariot.RichEmbed()
                    .setColor('RED')
                    .setDescription(`Unfortunately command **${foundCommand.name}** has no integrated help text yet.`)
                );
            }

            const helpEmbed = new Chariot.RichEmbed();

            helpEmbed.setColor(chariot.chariotOptions.chariotConfig.primaryColor || 'RANDOM');
            helpEmbed.setTitle(`🎶 Hinoiri Help | **${foundCommand.name}**`);
            helpEmbed.setDescription(foundCommand.help.message || 'No help description available');
            helpEmbed.addField('Usage', (foundCommand.help.usage) ? `\`${chariot.chariotOptions.chariotConfig.prefix}${foundCommand.help.usage}\`` : 'No usage available', foundCommand.help.inline);

            let helpArray = [];
            let exampleText = '';

            if (Array.isArray(foundCommand.help.example)) {
                helpArray = foundCommand.help.example.map((helpItem) => `\`${chariot.chariotOptions.chariotConfig.prefix}${helpItem}\``);
                exampleText = helpArray.join(', ');
            } else {
                exampleText = `\`${chariot.chariotOptions.chariotConfig.prefix}${foundCommand.help.example}\``;
            }

            helpEmbed.addField(Array.isArray(foundCommand.help.example) ? 'Examples' : 'Example', exampleText, foundCommand.help.inline);

            if (foundCommand.aliases && foundCommand.aliases.length) {
                const commandAliases = foundCommand.aliases.map((alias) => `\`${alias}\``);
                helpEmbed.addField('Aliases', commandAliases.join(', '), false);
            }

            message.channel.createEmbed(helpEmbed);
            Chariot.Logger.success('HELP', `${message.author.username}#${message.author.discriminator} (${message.author.id}) used the help command for command ${foundCommand.name}.`);
        }
    }
}

module.exports = new Help();