import {Language} from "../language/Language";
import {Languages} from "../language/Languages";
import {Message} from "../message/Message";
import {MessageBus} from "../message_bus/MessageBus";
import {ServiceTranslator} from "../translator/ServiceTranslator";

// TODO: Improve almost everything in here. And maybe remove some log statements
export class Chatbox {
	private containerId:string;
	private container:Element;
	private messageList:Node;
	private inputBox:any;

	private bus:MessageBus;
	private language:Language;

    constructor(id:string, language:string, bus:MessageBus) {
        this.containerId = id;
        this.bus = bus;
        this.setLanguage(language);
        this.setup();

        let self = this;
        this.bus.subscribe(function (m) { self.receive(m); });
    }

    setLanguage(name:string) {
        let language = Languages[name];
        if (language) {
            this.language = language;
        }
    }
    
    public receive(message:Message) {
        console.log('Recieved message ', message);
        let text = message.text;
        let language = message.language;
        const hoverText = `${language.name}: ${text}`;
        if (language.name != this.language.name) {
            const self = this;
            const response = ServiceTranslator.translate(language, this.language, text);
            response.then(function (r) {
                console.log('response:', r);
                self.drawMessage(r.text, hoverText);
            });
        }
        else {
            this.drawMessage(text, hoverText);
        }
    }

    public send() {
        let text = this.inputBox.value;
        let message = new Message(this.language, text);
        console.log('Sending message:', message);
        this.bus.publish(message);
        this.inputBox.value = '';
    }

    public destroy() {
        this.bus.unsubscribe(this.receive);
        this.container.remove();
    }

    private setup() {
        this.container = document.getElementById(this.containerId);
        this.container.appendChild(this.createHeader());
        this.container.appendChild(this.createMessageList());
        this.container.appendChild(this.createMessageBox());
    }

    private createHeader():Node {
        let result = this.parseHTML(`<div class="messageBoxHeader">
            <div class="messageBoxHeaderText">
                <span class="messageBoxTitle">Language: ${this.language.name}</span>
                <span class="messageBoxChannel">Channel: ${this.bus.channel}</span>
            </div>
            <input type="button" class="messageBoxCloseButton" value="X">
        </div>`);
        let self = this;
        result.getElementsByClassName('messageBoxCloseButton')[0].addEventListener('click', function () { self.destroy(); });
        
        return result.body.firstChild;
    }

    private createMessageList():Node {
        const messageList = this.parseHTML(`<div class="messageList"></div>`);
        this.messageList = messageList.body.firstChild;
        
        return this.messageList;
    }

    private createMessageBox():Node {
        let result = this.parseHTML(`<div class="messageBox">
            <textarea class="messageInput"></textarea>
            <button class="messageButton" type="Button">Send</button>
        </div>`);
        this.inputBox = result.getElementsByClassName('messageInput')[0] as Element;

        let self = this;
        this.inputBox.addEventListener("keypress", function (event) {
        });
        result.getElementsByClassName('messageButton')[0].addEventListener('click', function () { self.send(); });

        return result.body.firstChild;
    }

    private drawMessage(text:string, hoverText:string) {
        let d = new Date();
        let time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        let date = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

        let message = this.parseHTML(`<div class="message">
            <div class="messageTime" title="${date} ${time}:${d.getSeconds().toString().padStart(2, '0')}">
                ${time}
            </div>
            <div class="messageText" title="${hoverText}">
                ${text}
            </div>
        </div>`);
        
        this.messageList.appendChild(message.body.firstChild);
    }

    private parseHTML(html:string):Document {
        return new DOMParser().parseFromString(html, 'text/html');
    }
}