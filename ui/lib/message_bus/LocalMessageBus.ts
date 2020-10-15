import {Message} from "../message/Message";
import {MessageBus} from "./MessageBus";

export class LocalMessageBus implements MessageBus {
    private static buses:any = {};
    
    private subscriptions:any;
    channel:string;

    private constructor(channel:string) {
        this.channel = channel;
        this.subscriptions = [];
    }

    static getInstance(channel:string):LocalMessageBus {
        if (!LocalMessageBus.buses[channel]) {
            LocalMessageBus.buses[channel] = new LocalMessageBus(channel);
        }

        return LocalMessageBus.buses[channel]
    }

    subscribe(callback:Function) {
        let result = false;

        if (this.subscriptions.indexOf(callback) === -1) {
            this.subscriptions.push(callback);
            result = true;
        }

        return result;
    }

    unsubscribe(callback:Function) {
        let result:boolean = false;
        let index = this.subscriptions.indexOf(callback);

        if (index > -1) {
            delete this.subscriptions[index];
            result = true;
        }

        return result;
    }

    
    publish(message:Message) {
        let result = true;

        this.subscriptions.forEach(function(callback) {
            callback(message);
        });

        return true;
    }
}