import {Language} from "../language/Language";
import {Languages} from "../language/Languages";
import {Message} from "../message/Message";
import {MessageBus} from "../message_bus/MessageBus";
import {RemoteMessageBus} from "../message_bus/RemoteMessageBus";
import {ServiceTranslator} from "../translator/ServiceTranslator";

// TODO: Improve almost everything in here. And maybe remove some log statements
export class Chatbox {
	private containerId:string;
	private container:Element;
	private messageList:Node;
	private inputBox:any;

	private bus:MessageBus<any>;
    private channelId:string;
	private language:Language;

    constructor(id:string) {
        this.containerId = id;
        this.setup();
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

    private start() {
        const language = (<HTMLInputElement>this.container.querySelector('#languageSelector')).value;
        const channel = (<HTMLInputElement>this.container.querySelector('#channelInput')).value;

        const bus = RemoteMessageBus.getInstance<Message>(channel);
        this.setLanguage(language);
        this.setBus(bus);

        this.hideSplashScreen();
    }

    private setup() {
        this.container = document.getElementById(this.containerId);
        this.container.appendChild(this.createSplashScreen());
        this.container.appendChild(this.createHeader());
        this.container.appendChild(this.createMessageList());
        this.container.appendChild(this.createMessageBox());
    }

    private createSplashScreen():Node {
        const language = this.getDefaultLanguage();
        console.log('default language: '+language);
        const channel = this.getDefaultChannel();
        let result = this.parseHTML(`<div class="splashScreen">
            <div class='splashScreenContents'>
                <div><label for="languageSelector">Select a Language</label></div>
                <select id="languageSelector">
                    ${Object.keys(Languages).map(function (name) {
                        return "<option value='" + name + "'"+ (name==language ? 'selected' : '') + ">" + Languages[name].name + "</option>"           
                    }).join("")}
                </select><br />
                <div><label for="channelInput">Enter Channel</label></div>
                <input type="text" id="channelInput" value="${channel}"></input>
                <input type="button" id="generateChannelId" value="Random ID" />
                <br />
                <input type="button" id="startChatButton" value="Start"/>
            </div>
        </div>`);
        
        let self = this;
        result.getElementById('generateChannelId').addEventListener('click', function () { 
            self.generateChannelId();
        });

        result.getElementById('startChatButton').addEventListener('click', function () { 
            self.start();
        });


        return result.body.firstChild;
    }

    private createHeader():Node {
        let result = this.parseHTML(`<div class="messageBoxHeader">
            <div class="messageBoxHeaderText">
                <span class="messageBoxTitle">Language: <span id="languageValue"></span></span>
                <span class="messageBoxChannel">Channel: <span id="channelValue"></span></span>
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

    private getDefaultLanguage():string {
        return this.container.attributes['language'].value || '';
    }

    private getDefaultChannel():string {
        return this.container.attributes['channel'].value || '';
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

    private generateChannelId() {
        const request = new Request('http://localhost:8080/generateChannelId');
        let self = this;
        fetch(request)
            .then(response => response.json())
            .then(obj => {
                (<HTMLInputElement>self.container.querySelector("#channelInput")).value = obj.channelId;
            });
    }

    private hideSplashScreen() {
        (<HTMLElement>this.container.querySelector(".splashScreen")).style.visibility = 'hidden';
    }

    private parseHTML(html:string):Document {
        return new DOMParser().parseFromString(html, 'text/html');
    }

    private setLanguage(name:string) {
        let language = Languages[name];
        if (language) {
            this.language = language;
            this.updateLanguageUi();
        }
    }

    private updateLanguageUi() {
        this.container.querySelector('#languageValue').innerHTML = this.language.name;
    }

    private setBus(bus:MessageBus<any>) {
        this.bus = bus;

        let self = this;
        this.bus.subscribe(function (m) { self.receive(m); });

        this.updateChannelUi();
    }

    private updateChannelUi() {
        this.container.querySelector('#channelValue').innerHTML = this.bus.channel;
    }
}