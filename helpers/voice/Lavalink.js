const Chariot = require('chariot.js');
const axios = require('axios');
const HinoiriConfig = require('../../config/HinoiriConfig');

class HinoiriLavalink {
    constructor() {
        this.logger = Chariot.Logger;
    }

    /**
     * Resolve tracks for LavaLink to play
     * @param {String} search A search item. This can be a URL or a Lavaplayer search tag e.g. ytsearch:xyz
     * @returns {Array<Object>} An array containing track objects
     */
    async resolveTracks(search) {
        const result = await axios.get(`http://${HinoiriConfig.lavalink.nodes[0].host}:${HinoiriConfig.lavalink.nodes[0].port}/loadtracks?identifier=${search}`, {
            headers: {
                'Authorization': HinoiriConfig.lavalink.nodes[0].password,
                'Accept': 'application/json'
            }
        });

        if (!result) {
            return Promise.reject('Cannot resolve URL!');
        }

        return result.data;
    }

    /**
     * Get a LavaLink player by either creating one or getting the player of the play manager if it already exists
     * @param {Chariot.Client} hinoiri The main bot client
     * @param {Eris.VoiceChannel} channel An Eris voice channel
     * @param {boolean} allowCreate Whether the player should be created or not
     * @returns {Object} A LavaLink player
     */
    async getPlayer(hinoiri, channel, allowCreate = false) {
        if (!channel || !channel.guild) {
            return Promise.reject('Not a guild channel!');
        }

        const player = hinoiri.voiceConnections.get(channel.guild.id);

        if (player) {
            return Promise.resolve(player);
        }

        if (!allowCreate) {
            return void 0;
        }

        return hinoiri.joinVoiceChannel(channel.id);
    }

    /**
     * Play a resolved track or stream with LavaLink
     * @param {Chariot.Client} hinoiri The main bot client
     * @param {Eris.VoiceChannel} channel An Eris voice channel
     * @param {String} url A media URL resolvable by LavaLink. This can be a URL or a Lavaplayer search tag e.g. ytsearch:xyz
     */
    async play(hinoiri, channel, url) {
        try {
            const isNewConnection = !hinoiri.voiceConnections.has(channel.guild.id);
            const lavaPlayer      = await this.getPlayer(hinoiri, channel, true);
            const lavaTrack       = await this.resolveTracks(url);

            if (isNewConnection) {
                lavaPlayer.setVolume(100);

                lavaPlayer.on('disconnect', (error) => {
                    if (error) {
                        return this.logger.error('LAVALINK ERROR', `Lavalink disconnected with error: ${error}`);
                    }

                    return this.logger.warning('LAVALINK', 'Lavalink disconnected');
                });

                lavaPlayer.on('error', (error) => {
                    this.logger.error('LAVALINK ERROR', `Lavalink threw an error: ${error}`);
                });

                lavaPlayer.on('end', (data) => {
                    if (data.reason && data.reason === 'REPLACED') {
                        return;
                    }

                    lavaPlayer.stop();
                });
            }

            lavaPlayer.play(lavaTrack.tracks[0].track);

        } catch (lavalinkError) {
            this.logger.error('UNKNOWN LAVALINK ERROR', lavalinkError);
        }
    }
}

module.exports = new HinoiriLavalink();