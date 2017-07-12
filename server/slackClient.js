'use strict';

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let rtm = null;
let nlp = null;
let registry = null;

function handleOnAuthenticated(rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
}

function handleOnMessage(message) {
    console.log('HANDLE ON MESSAGE');
    console.log(message);

    var regex = /^D+/
    var result = message.channel.match(regex);

    
    if(result === null || result === "null"){

        console.log('Group Chat...');
        if (message.text.toLowerCase().includes('iris')) {
         
                msgHandler(message,nlp);
        }else{
            console.log('It is not talking to Iris on the Chat Group');
        }
    }else{
        console.log('Direct message...');
        msgHandler(message,nlp);
        
    }
   

}

function msgHandler(message,nlp){
    try{
    console.log('MSG HANDLER');
    nlp.ask(message.text, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }

            try {
                console.log('Hi..');
                console.log(res);
                if(!res.entities.intent || !res.entities.intent[0] || !res.entities.intent[0].value) {
                    throw new Error("Could not extract intent.")
                }
                console.log(res);
                const intent = require('./intents/' + res.entities.intent[0].value + 'Intent');
                console.log('PROCESS INTENT');
                intent.process(res, registry, function(error, response) {
                    if(error) {
                        console.log(error.message);
                        return;
                    }
                    console.log('Response:');
                    console.log(response);
                    return rtm.sendMessage(response, message.channel);
                })

            } catch(err) {
                console.log(err);
                console.log(res);
                rtm.sendMessage("Sorry, I don't know what you are talking about!", message.channel);
            }

        });
    } catch(err) {
                console.log(err);
                rtm.sendMessage("Sorry, I don't know what you are talking about!", message.channel);
    }    

}

function addAuthenticatedHandler(rtm, handler) {
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}


module.exports.init = function slackClient(token, logLevel, nlpClient, serviceRegistry) {
    console.log('INIT');
    rtm = new RtmClient(token, { logLevel: logLevel });
    nlp = nlpClient;
    registry = serviceRegistry;
    addAuthenticatedHandler(rtm, handleOnAuthenticated);
    rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
    return rtm;
}

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;