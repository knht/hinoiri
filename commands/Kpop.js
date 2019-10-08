const Chariot = require('chariot.js');
const HinoiriHelper = require('../helpers/HinoiriHelper');

class Kpop extends Chariot.Command {
    constructor() {
        super();

        this.name = 'kpop';
        this.permissions = ['embedLinks', 'voiceConnect', 'voiceSpeak'];
        this.owner = false;
        this.nsfw = false;
        this.cooldown = 5;
        this.help = {
            message: 'Tell Hinoiri to come join your voice channel and start playing K-Pop music!',
            usage: 'kpop',
            example: ['kpop'],
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
        if (message.member.voiceState.channelID === null) {
            return message.channel.createMessage('You must join a voice channel first!');
        }

        let missingPermissions = [];
        let voiceChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);

        for (let i = 0; i < this.permissions.length; i++) {
            if (!voiceChannel.permissionsOf(chariot.user.id).has(this.permissions[i])) {
                missingPermissions.push(this.permissions[i]);
            }
        }

        if (missingPermissions.length) {
            return message.channel.createMessage(`I'm missing following permissions: **${missingPermissions.join(', ')}**`).catch((messageSendError) => {
                Chariot.Logger.warning('MUTED', 'Cannot send messages');
            });
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
        const voiceChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);

        chariot._liveConnections.set(voiceChannel.guild.id, 'kpop');

        message.channel.createEmbed(new Chariot.RichEmbed()
            .setColor(0xFF9185)
            .setTitle('🎶 Now Playing')
            .setThumbnail(chariot._currentlyPlaying.kpop.cover)
            .setTimestamp(chariot._currentlyPlaying.kpop.started)
            .setFooter('Started playing')
            .setDescription(`**${chariot._currentlyPlaying.kpop.title}** by **${chariot._currentlyPlaying.kpop.artist}**`)
            .addField('Duration', chariot._currentlyPlaying.kpop.duration)
        );

        HinoiriHelper.lavalink.play(chariot, voiceChannel, 'https://listen.moe/kpop/stream');

        Chariot.Logger.command(`${message.author.username}#${message.author.discriminator} (${message.author.id}) started playing J-Pop in channel ${voiceChannel.name} on guild ${voiceChannel.guild.name}!`);
    }
}

module.exports = new Kpop();