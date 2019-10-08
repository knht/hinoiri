const Chariot = require('chariot.js');
const HinoiriConfig = require('../config/HinoiriConfig');

class HinoiriReady extends Chariot.Event {
    constructor() {
        super('ready');
    }

    async execute() {
        const { PlayerManager } = require('eris-lavalink');

        if (!(this.voiceConnections instanceof PlayerManager)) {
            this.voiceConnections = new PlayerManager(this.client, HinoiriConfig.lavalink.nodes, {
                numShards: this.client.shards.size,
                userId: this.client.user.id,
                regions: HinoiriConfig.lavalink.regions,
                defaultRegion: 'eu'
            });
        }

        this.client.editStatus('online', { name: 'J-Pop and K-Pop', type: 2 });
    }
}