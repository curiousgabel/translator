import {Message} from "../message/Message";
import {MessageBus} from "./MessageBus";
import {Config} from "./config/Config";

// TODO: repalce the ../s with a reference to the root directory
const config:Config = require('../../config/message_bus.json');

export class RemoteMessageBus implements MessageBus {
    // TODO: add error handling for not having the config value
    private url:string = config.remoteMessageBus.url ;
    private socket:WebSocket;
    channel:string;

    constructor(channel:string) {
        this.channel = channel;
    }

    static getInstance(channel:string) {
        return new RemoteMessageBus(channel);
    }

    subscribe(callback:Function) {
        this.socket = new WebSocket(this.url+'/'+this.channel);

        // TODO: Maybe get rid of log statements? Nothing compromising is being revealed
        this.socket.onmessage = function(event) {
            console.log('Recieved event:', event);
            let message = JSON.parse(event.data);
            console.log('Parsed message:', message)
            callback(message);
        };

        return true;
    }

    unsubscribe(callback:Function) {
        this.socket.close();

        return true;
    }

    publish(message:Message) {
        this.socket.send(JSON.stringify(message));

        return true;
    }
}