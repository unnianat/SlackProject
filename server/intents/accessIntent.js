'use strict';

const request = require('superagent');

module.exports.process = function process(intentData, registry, cb) {
    console.log('START INTENT PROCESS');
    if(intentData.entities.intent[0].value !== 'access')
        return cb(new Error(`Expected access intent, got ${intentData.entities.intent[0].value}`));
        console.log('Test');
	console.log(intentData);
    console.log('Test');
    console.log(intentData._text);

    if(!intentData.entities.application) return cb(new Error('Missing application in access intent'));
    
    const application = intentData.entities.application[0].value.replace(/,.?iris/i, '');
    const text = intentData._text;

    console.log('Test');
    console.log(application);
    console.log(text);
    const service = registry.get('access');
    if(!service) return cb(false, 'No service available');

    request.get(`http://${service.ip}:${service.port}/service/${application}/${text}`, (err, res) => {
        if(err || res.statusCode != 200 || !res.body.result) {
            console.log(err);
            return cb(false, `I had a problem getting you help with access to ${application}`);
        }
        
        
        return cb(false, `${res.body.result}`);
    });   
}