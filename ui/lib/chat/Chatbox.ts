import {Language} from "../language/Language";
import {Languages} from "../language/Languages";
import {Message} from "../message/Message";
import {MessageBus} from "../message_bus/MessageBus";
import {LocalMessageBus} from "../message_bus/LocalMessageBus";
import {RemoteMessageBus} from "../message_bus/RemoteMessageBus";
import {ServiceTranslator} from "../translator/ServiceTranslator";

/* TODO:
 * Move relevant IDs/selectors to class-level constants
 * Get the lanaguage list from the google API and/or display languages in their mother tongue
 * Add a name input to the messages?
 * Put the close button over the splash screen?
*/
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

        const bus = this.instantiateBus();
        this.setLanguage(language);
        this.setBus(bus);

        this.hideSplashScreen();
    }

    private setup() {
        this.container = document.getElementById(this.containerId);
        let self = this;
        const language = this.getDefaultLanguage();
        const channel = this.getDefaultChannel();

        const template = `<div class='chatbox'>
            <div class="splashScreen">
                <div class='splashScreenContents'>
                    <table>
                        <tbody>
                            <tr>
                                <td><label for="languageSelector">Select a Language</label></td>
                                <td><select id="languageSelector">
                                    ${Object.keys(Languages).map(function (name) {
                                        return "<option value='" + name + "'"+ (name==language ? 'selected' : '') + ">" + Languages[name].name + "</option>"           
                                    }).join("")}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><label for="channelInput">Enter Channel</label></td>
                                <td>
                                    <input type="text" id="channelInput" value="${channel}"></input>
                                    <input type="button" id="generateChannelId" value="Random ID" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <input type="button" id="startChatButton" value="Start"/>
                </div>
            </div>
            <div class="messageBoxHeader">
                <div class="messageBoxHeaderText">
                    <span class="messageBoxTitle">Language: <span id="languageValue"></span></span>
                    <span class="messageBoxChannel">Channel: <span id="channelValue"></span></span>
                </div>
                <input type="button" class="messageBoxCloseButton" value="X">
            </div>
            <div class="messageList"></div>
            <div class="messageBox">
                <textarea class="messageInput"></textarea>
                <button class="messageButton" type="Button">Send</button>
            </div>
        </div>`;

        const box = this.parseHTML(template);

        // Wire up the splashScreen
        box.getElementById('generateChannelId').addEventListener('click', function () { 
            self.generateChannelId();
        });

        box.getElementById('startChatButton').addEventListener('click', function () { 
            self.start();
        });

        // Wire up the createHeader
        box.getElementsByClassName('messageBoxCloseButton')[0].addEventListener('click', function () { self.destroy(); });

        // Wire up the input components
        this.inputBox = box.getElementsByClassName('messageInput')[0] as Element;

        this.inputBox.addEventListener("keypress", function (event) {
        });
        box.getElementsByClassName('messageButton')[0].addEventListener('click', function () { self.send(); });

        // Add it all to the container
        this.container.appendChild(box.body.firstChild);
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
        
        this.container.querySelector('.messageList').appendChild(message.body.firstChild);
    }

    private updateLanguageUi() {
        this.container.querySelector('#languageValue').innerHTML = this.language.name;
    }

    private updateChannelUi() {
        this.container.querySelector('#channelValue').innerHTML = this.bus.channel;
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

    private getDefaultLanguage():string {
        return this.container.attributes['language'].value || 'english';
    }

    private getDefaultChannel():string {
        return this.container.attributes['channel'].value || '';
    }

    private instantiateBus():MessageBus<Message> {
        const defaultBusType = this.container.attributes['messageBus'];
        const busType:string = defaultBusType ? defaultBusType.value : 'LocalMessageBus';
        const channel = (<HTMLInputElement>this.container.querySelector('#channelInput')).value;
        let bus:MessageBus<Message>;

        // Ideally do this more dynamically but this will work for now
        switch (busType) {
            case 'RemoteMessageBus':
                bus = RemoteMessageBus.getInstance<Message>(channel);
                break;
            case 'LocalMessageBus':
                bus = LocalMessageBus.getInstance<Message>(channel);
                break;
            default:
                throw new Error(`Invalid message bus type: ${busType}`);
        }

        return bus;
    }

    private setLanguage(name:string) {
        let language = Languages[name];
        if (language) {
            this.language = language;
            this.updateLanguageUi();
        }
    }

    private setBus(bus:MessageBus<any>) {
        this.bus = bus;

        let self = this;
        this.bus.subscribe(function (m) { self.receive(m); });

        this.updateChannelUi();
    }
}