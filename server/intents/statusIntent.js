'use strict';

const request = require('superagent');

module.exports.process = function process(intentData, registry, cb) {

 if(intentData.entities.intent[0].value !== 'status')
        return cb(new Error(`Expected status intent, got ${intentData.intent[0].value}`));
	console.log(intentData);

    if(!intentData.entities.location) return cb(new Error('Missing ticket number in status intent'));
    
    const location = intentData.entities.location[0].value.replace(/,.?iris/i, '');
    const text = intentData._text;

    const service = registry.get('status');
    if(!service) return cb(false, 'No service available');

    request.get(`http://${service.ip}:${service.port}/service/${location}/${text}`, (err, res) => {
        if(err || res.statusCode != 200 || !res.body.result) {
            console.log(err);
            return cb(false, `I had a problem getting you status of ticket  ${location}`);
        }
        
        
        return cb(false, `${res.body.result}`);
    });   
}

