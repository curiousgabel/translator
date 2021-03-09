/* This is meant to be an example of how to use the translating chatbox
 * with a remote message bus that makes calls to the service in the server
 * directory. Removing the button for generating a random channel ID or updating
 * that URL to point to the running service should render this runnable.
 */
import {Chatbox} from "./lib/chat/Chatbox";

window.onload = function() {
    console.log('running setup');

    document.getElementById('createMessageBox').addEventListener('click', function(){
        createMessageBox();
    });
};

function createMessageBox() {
    console.log('creating message box');
    let queryParams = new URLSearchParams(window.location.search);
    let channel = queryParams.get('channel') || '';
    let language = queryParams.get('language') || '';
    let box = document.createElement('div');

    box.setAttribute('language', language);
    box.setAttribute('channel', channel);
    box.setAttribute('messageBus', 'RemoteMessageBus');
    box.setAttribute('style', "width:300px; display:inline-block; margin-right:110px");
    box.setAttribute('id', language+Date.now());
    document.body.appendChild(box);

    new Chatbox(box.id);
}