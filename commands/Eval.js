const Chariot = require('chariot.js');
const HinoiriHelper = require('../helpers/HinoiriHelper');

/**
 * This example shows how to make a command only accessible to the defined bot owner
 * by setting this.owner = true in the class constructor and using precondition testing.
 */
class Eval extends Chariot.Command {
    constructor() {
        super(); 

        this.name = 'eval';
        this.owner = true;
        this.cooldown = 5;
        this.help = {
            message: 'A simple eval command!',
            usage: 'eval <code>',
            example: ['eval 2+2', 'eval process.exit(0);'],
            inline: false
        }
    }

    /**
     * Precondition testing method. This method will run BEFORE the main command logic.
     * Once ever test passed, next() MUST be called, in order to run the main command logic!
     * @param {object} message An Eris.Message object emitted from Eris
     * @param {string[]} args An array containing all provided arguments
     * @param {object} chariot The main bot client.
     * @param {Function} next Marking testing as done, invoking the main command executor
     */
    async runPreconditions(message, args, chariot, next) {
        if (args.join().length > 2000) {
            return message.channel.createMessage('Too many arguments!');
        }

        next();
    }

    /**
     * Sanitize a text
     * @param {string} text The evaled texted to be sanitized before embedding into a code block 
     */
    sanitize(text) {
        if (typeof(text) === "string") {
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        } else {
            return text;
        }
    }

    /**
     *  This is the main method getting executed by the MessageHandler upon a valid command request
     * 
     * @param {Object} message The emitted message object that triggered this command  
     * @param {String[]} args The arguments fetched from using the command
     * @param {Object} chariot The bot client itself
     */
    async execute(message, args, hinoiri) {
        try {
            let evaled = await eval(args.join(' '));

            if (typeof evaled !== "string") {
                evaled = require('util').inspect(evaled);
            }

            message.channel.createCode(this.sanitize(evaled), "js");
        } catch (evalError) {
            message.channel.createCode(this.sanitize(evalError), "js");
        }
    }
}

module.exports = new Eval();