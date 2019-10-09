const Chariot = require('chariot.js');
const WebSocket = require('ws');
const cheerio = require('cheerio');
const axios = require('axios');
const HinoiriLavalink = require('./voice/Lavalink');

class HinoiriHelper {
    constructor() {
        this.lavalink = HinoiriLavalink;
        this.logger = Chariot.Logger;
    }

    /**
     * Scrape Bing images for a given search query and NSFW filter
     * @param {string} query A search query 
     * @param {boolean} nsfw Whether the search should include NSFW images or not
     * @returns {Promise<string[]>} An array containing all fetched images
     */
    async scrapeBingImages(query, nsfw) {
        const sanitizedQuery = query.trim();
        const url = `http://www.bing.com/images/search?q=${encodeURIComponent(sanitizedQuery)}&view=detailv2&adlt=${(nsfw) ? 'off' : 'moderate'}`;
        const responseBody = await axios.get(url);
        const $ = cheerio.load(responseBody.data);
        
        let results = [];

        $('.item a[class="thumb"]').each(function(element) {
            const item = $(this).attr('href');
            results.push(item);
        });

        return results;
    }

    /**
     * Execute a websocket heartbeat interval
     * @param {Number} interval An interval at which the heartbeat should be executed 
     * @param {Object} websocket A websocket object
     * @returns {interval} An interval
     */
    websocketHeartbeat(interval, websocket) {
        const heartbeatInterval = setInterval(() => {
            websocket.send(JSON.stringify({ op: 9 }));
        }, interval);

        return heartbeatInterval;
    }

    /**
     * Create and connect to a web radio websocket.
     * @param {String} genre A webradio genre. Must either be jpop or kpop. Defaults to kpop. 
     * @returns {Object} The resulting websocket
     */
    connectToRadioWebsocket(genre) {
        const url = (genre.toLowerCase() === 'jpop') ? 'wss://listen.moe/gateway_v2' : 'wss://listen.moe/kpop/gateway_v2';
        const ws  = new WebSocket(url);

        return ws;
    }

    /**
     * Format seconds into hours:minutes:seconds
     * @param {Number} time An amount of time in seconds  
     * @returns {String} The formatted time
     */
    timeFormat(time) {
        let hrs  = ~~(time / 3600);
        let mins = ~~((time % 3600) / 60);
        let secs = ~~time % 60;
        let ret  = '';

        if (hrs > 0) {
            ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
        }

        ret += '' + mins + ':' + (secs < 10 ? '0' : '');
        ret += '' + secs;

        return ret;
    }
}

module.exports = new HinoiriHelper();