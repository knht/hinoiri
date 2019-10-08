const Chariot = require('chariot.js');
const HinoiriHelper = require('../helpers/HinoiriHelper');

class LeaveVoiceChannel extends Chariot.Command {
    constructor() {
        super();

        this.name = 'leave';
        this.aliases = ['disconnect', 'quit'];
        this.owner = false;
        this.nsfw = false;
        this.cooldown = 3;
        this.help = {
            message: 'Tell Hinoiri to leave the Voice Channel and stop audio playback.',
            usage: 'leave',
            example: ['leave'],
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
            return message.channel.createMessage('You are not in a voice channel!');
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

        HinoiriHelper.lavalink.getPlayer(chariot, voiceChannel).then((player) => {
            player.stop();
            chariot.leaveVoiceChannel(voiceChannel.id);
            chariot._liveConnections.delete(voiceChannel.guild.id);
            message.channel.createMessage('👋🏼 See you later');
        }).catch((error) => {
            message.channel.createMessage('Currently not playing!');
        });
    }
}

module.exports = new LeaveVoiceChannel();