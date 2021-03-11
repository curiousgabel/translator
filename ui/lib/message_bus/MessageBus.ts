import {Message} from "../message/Message";

// TODO: decouple this from Message; for the purposes of a message bus, the type of the 
// items being passed around is irrelevant
export interface MessageBus<T> {
    channel:string;

    subscribe(callback:any): boolean;

    unsubscribe(callback:any): boolean;

    publish(message:T): boolean;
}