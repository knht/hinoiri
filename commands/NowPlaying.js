const Chariot = require('chariot.js');

class NowPlaying extends Chariot.Command {
    constructor() {
        super();

        this.name = 'nowplaying';
        this.aliases = ['np', 'playing'];
        this.permissions = ['embedLinks'];
        this.owner = false;
        this.nsfw = false;
        this.cooldown = 1;
        this.help = {
            message: 'Find out what song is currently playing on Hinoiri',
            usage: 'nowplaying',
            example: ['nowplaying'],
            inline: true
        }
    }

    /**
     * Precondition testing method. This method will run BEFORE the main command logic.
     * Once every test passed, next() MUST be called, in order to run the main command logic!
     * @param {object} message An Eris.Message object emitted from Eris
     * @param {string[]} args An array containing all provided arguments
     * @param {object} chariot The main bot client.
     * @param {Function} next Marking testing as done, invoking the main command executor
     */
    async runPreconditions(message, args, chariot, next) {
        const type = chariot._liveConnections.get(message.channel.guild.id);

        if (!type) {
            return message.channel.createMessage(`Currently not playing in guild **${message.channel.guild.name}**!`);
        }

        next();
    }

    /**
     * Main method running after passing preconditions
     * @param {object} message An Eris.Message object emitted from Eris
     * @param {string[]} args An array containing all provided arguments
     * @param {object} chariot The main bot client. 
     */
    async execute(message, args, chariot) {
        const type = chariot._liveConnections.get(message.channel.guild.id);
        
        message.channel.createEmbed(new Chariot.RichEmbed()
            .setColor(0xFF9185)
            .setTitle('🎶 Now Playing')
            .setThumbnail(chariot._currentlyPlaying[type].cover)
            .setTimestamp(chariot._currentlyPlaying[type].started)
            .setFooter('Started playing')
            .setDescription(`**${chariot._currentlyPlaying[type].title}** by **${chariot._currentlyPlaying[type].artist}**`)
            .addField('Duration', chariot._currentlyPlaying[type].duration)
        );
    }
}

module.exports = new NowPlaying();