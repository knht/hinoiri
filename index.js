const Chariot = require('chariot.js');
const HinoiriHelper = require('./helpers/HinoiriHelper');
const HinoiriConfig = require('./config/HinoiriConfig');

class Hinoiri extends Chariot.Client {
    constructor() {
        super(new Chariot.Config(HinoiriConfig.token, HinoiriConfig.chariotOptions, HinoiriConfig.erisOptions));

        this._currentlyPlaying = {
            jpop: {},
            kpop: {}
        }

        this._logger = Chariot.Logger;
        this._liveConnections = new Chariot.Vial();

        this._initialize();
        this.connect();
    }

    _initialize() {
        this._registerWebsockets();
    }

    _registerWebsockets() {
        this._wsJpop();
        this._wsKpop();
    }

    /**
     * Subscribes to the K-Pop info websocket for the 'Now Playing' feature
     */
    _wsKpop() {
        const ws = HinoiriHelper.connectToRadioWebsocket('kpop');
        let heartbeatInterval = null;

        ws.onopen = () => {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }

        ws.onmessage = async (message) => {
            if (!message.data.length) return;

            let response = null;

            try {
                response = JSON.parse(message.data);
            } catch (jsonParseError) {
                this._logger.error('JSON PARSE ERROR', `Couldn't parse websocket message because of: ${jsonParseError}`);
            }

            switch (response.op) {
                case 0: {
                    ws.send(JSON.stringify({ op: 9 }));
                    heartbeatInterval = HinoiriHelper.websocketHeartbeat(response.d.heartbeat, ws);

                    break;
                }

                case 1: {
                    if (response.t !== 'TRACK_UPDATE' && response.t !== 'TRACK_UPDATE_REQUEST' && response.t !== 'QUEUE_UPDATE' && response.t !== 'NOTIFICATION') {
                        break;
                    }

                    const data = response.d.song;
                    let coverImage = 'https://img.kirameki.one/3OqzABNx.png';

                    if (data.albums[0] && data.albums[0].image) {
                        coverImage = `https://cdn.listen.moe/covers/${data.albums[0].image}`;
                    } else {
                        const scrapedCoverImage = await HinoiriHelper.scrapeBingImages(`${data.title} by ${data.artists[0].name}`);

                        if (scrapedCoverImage.length > 0) {
                            coverImage = scrapedCoverImage[0];
                        } 
                    }

                    this._currentlyPlaying.kpop = {
                        cover: coverImage, 
                        artist: data.artists[0].name,
                        title: data.title,
                        duration: HinoiriHelper.timeFormat(data.duration),
                        started: response.d.startTime
                    }

                    break;
                }

                default: {
                    break;
                }
            }
        }

        ws.onclose = (error) => {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;

            if (ws) {
                ws.close();
                ws = null;
            }

            this._logger.error('WEBSOCKET ERROR', error);
            return this._wsKpop();
        }
    }

    /**
     * Subscribes to the J-Pop info websocket for the 'Now Playing' feature
     */
    _wsJpop() {
        const ws = HinoiriHelper.connectToRadioWebsocket('jpop');
        let heartbeatInterval = null;

        ws.onopen = () => {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }

        ws.onmessage = async (message) => {
            if (!message.data.length) return;

            let response = null;

            try {
                response = JSON.parse(message.data);
            } catch (jsonParseError) {
                this._logger.error('JSON PARSE ERROR', `Couldn't parse websocket message because of: ${jsonParseError}`);
            }

            switch (response.op) {
                case 0: {
                    ws.send(JSON.stringify({ op: 9 }));
                    heartbeatInterval = HinoiriHelper.websocketHeartbeat(response.d.heartbeat, ws);

                    break;
                }

                case 1: {
                    if (response.t !== 'TRACK_UPDATE' && response.t !== 'TRACK_UPDATE_REQUEST' && response.t !== 'QUEUE_UPDATE' && response.t !== 'NOTIFICATION') {
                        break;
                    }

                    const data = response.d.song;
                    let coverImage = 'https://img.kirameki.one/3OqzABNx.png';

                    if (data.albums[0] && data.albums[0].image) {
                        coverImage = `https://cdn.listen.moe/covers/${data.albums[0].image}`;
                    } else {
                        const scrapedCoverImage = await HinoiriHelper.scrapeBingImages(`${data.title} by ${data.artists[0].name}`);

                        if (scrapedCoverImage.length > 0) {
                            coverImage = scrapedCoverImage[0];
                        } 
                    }

                    this._currentlyPlaying.jpop = {
                        cover: coverImage, 
                        artist: data.artists[0].name,
                        title: data.title,
                        duration: HinoiriHelper.timeFormat(data.duration),
                        started: response.d.startTime
                    }

                    break;
                }

                default: {
                    break;
                }
            }
        }

        ws.onclose = (error) => {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;

            if (ws) {
                ws.close();
                ws = null;
            }

            this._logger.error('WEBSOCKET ERROR', error);
            return this._wsJpop();
        }
    }
}

module.exports = new Hinoiri();