/* This is meant to be an example of how to use the translating chatbox
 * with a remote message bus that makes calls to the service in the server
 * directory. Removing the button for generating a random channel ID or updating
 * that URL to point to the running service should render this runnable.
 */
import {Chatbox} from "./lib/chat/Chatbox";
import {Languages} from "./lib/language/Languages";
import {RemoteMessageBus} from "./lib/message_bus/RemoteMessageBus";
window.onload = function() {
    console.log('running setup');
    let languageInput = document.getElementById('languageSelector');

    for(let key in Languages) {
        let option = document.createElement('option');
        option.setAttribute('value', key);
        option.appendChild(document.createTextNode(Languages[key].name))
        languageInput.appendChild(option);
    }

    document.getElementById('generateChannelId').addEventListener('click', function(){
        getChannelId();
    });

    document.getElementById('createMessageBox').addEventListener('click', function(){
        createMessageBox();
    });
};

function createMessageBox() {
    console.log('creating message box');
    let channel = (<HTMLInputElement>document.getElementById("channelInput")).value;
    let languageInput = <HTMLSelectElement>document.getElementById('languageSelector');
    let language = languageInput.options[languageInput.selectedIndex];
    let box = document.createElement('div');
    console.log('language input', language);
    box.setAttribute('language', language.value);
    box.setAttribute('style', "width:300px;");
    box.setAttribute('class', 'chatbox');
    box.setAttribute('id', language.value+Date.now());
    document.body.appendChild(box);
    new Chatbox(box.id, box.getAttribute('language'), RemoteMessageBus.getInstance(channel));
}

function getChannelId() {
    const request = new Request('http://localhost:8080/generateChannelId');
    fetch(request)
    .then(response => response.json())
    .then(obj => {
        (<HTMLInputElement>document.getElementById("channelInput")).value = obj.channelId;
    });
}