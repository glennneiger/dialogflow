'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    config = require('./config'),
    serviceNow = require('./serviceNow'),
    fs = require('fs'),
    logger = require('./logger'),
    logPath = __dirname + '/log';

require('dotenv').config();

//const apiaiApp = apiai(process.env.DIALOGFLOW_ID); //Client Access Token in the dialog flow

function writeLog() {
    logger.error('Error Line');
    logger.info('Info Line');
    logger.debug('Debug line');
}

function readLog() {
    console.log("After writing to file2 " + fs.existsSync(`${logPath}/sample.log`));
    var data = fs.readFileSync(`${logPath}/sample.log`, 'utf8');
    console.log(data);
}

writeLog();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

let userData = {};

//To handle the response to bot
app.post('/ai', (req, res) => {
    console.log("Inside the API handle " + JSON.stringify(req.body));
    logger.info('Inside Bot request');
    let source = '';
    if (typeof req.body.originalRequest != "undefined") {
        logger.info("Platform - "+req.body.originalRequest.source);
        console.log(req.body.originalRequest.source);
        source = req.body.originalRequest.source;
    } else {
        logger.info('Platform - No info');
        console.log('Req from other sources');
        source = 'incidents';//By default send the incidents response
    }
    handleRequest(req, res, source);
});

//To handle the request from the Dialogflow
function handleRequest(req, res, platform) {
    console.log("Inside the handleRequest");
    //logger.info("User - " + req.body.result.resolvedQuery);
    let source = require('./' + platform);
    //const assistant = new DialogflowApp({ request: req, response: res });
    logger.info(req.body);
    if (typeof req.body.result === 'undefined' || typeof req.body.result.action === 'undefined') {
        console.log('Inside welcome intent');
        //logger.info("Bot - " + JSON.stringify(sample.welcomeIntent()));
        //return res.json(source.welcomeIntent());
        return res.json(createWelcomeResponse());
    } else if (req.body.result.action === 'reportIncident') {
        console.log('Inside reportIncident intent');
        //logger.info("Bot - " + JSON.stringify(source.incidentCategory()));
        //return res.json(source.incidentCategory());
        serviceNow.saveIncident(res, req.body.result).then((response) => {
            let message = ' Your incident is noted. We will let you know after completing. Please note this Id - ' + response.number + ' for further reference ';
            
            logger.info("Bot - " + JSON.stringify(source.getTextResponse(message)));
            return res.json(source.getTextResponse(message));
            
        }).catch((error) => {
            let message = 'Unable to save the incident. Try again later';
            
            logger.error("Bot - " + JSON.stringify(source.getTextResponse(message)));
            return res.json(source.getTextResponse(message));
            
        });
    } else if (req.body.result.action === 'getIncident') {
        let reg = /[A-Z]{3}\d{7}/i;
        //if (reg.test(req.body.result.parameters["incidentId"]) && req.body.result.parameters["incidentId"].trim().length == 10) {
        if (reg.test(req.body.result.incidentId) && req.body.result.incidentId.trim().length == 10) {
            //console.log("Incident Id " + req.body.result.parameters["incidentId"].trim());
            console.log("Incident Id " + req.body.result.incidentId.trim());
            //serviceNow.getIncidentDetails(res, req.body.result.parameters["incidentId"].trim()).then((response) => {
            //serviceNow.getIncidentDetails(res, req.body.result.incidentId.trim()).then((response) => {
            serviceNow.getIncidentDetails(res, req.body.result.incidentId.trim())
            .then(success => {
                console.log(JSON.stringify(success))
                //return createIncident(state, description, success.result[0].name)
                
                let message = '';
                if (success == '') {
                     message = 'There is no incident found with the given incident Id';
                    
                     logger.info("Bot Failed - " + message);
                     logger.info("Bot Failed - " + JSON.stringify(source.getTextResponse(message)));
                     return res.json(getTextResponse(message));
                    
                } else {
                    message = ' Your incident is noted. We will let you know after completing.';
                    logger.info("Bot Succeeded - " + message);
                    logger.info("Bot Succeeded - " + JSON.stringify((success.body)));
                    return res.json((createGetIncidentResponse(success)));
                }
            }).catch((error) => {
                console.log(error);
                let message = "Cannot get the incident details. Try again later";
                
                logger.error("Bot - " + JSON.stringify(source.getTextResponse(message)));
                return res.json(source.getTextResponse(message));
                
            });
        } else {
            let message = 'Please enter the valid Incident Id';
            let options = {
                "name": "getIncident",
                "data": {}
            };
            logger.info("Bot - " + JSON.stringify(source.triggerEvent(message, options)));
            return res.json(source.triggerEvent(message, options));
        }
    } else {
        let msg = "Can't understand. Please type 'report' to report an incident or 'view' to view the incident";
        
        logger.info("Bot - " + JSON.stringify(source.getTextResponse(msg)));
        return res.json(source.getTextResponse(msg));
        
    }
}

function createWelcomeResponse() {
    return {
                'speech': 'Reqeuest Confirmation',
                'displayText': 'Reqeuest Confirmation',
                'message': 
                    {
                        'platform': 'servicenow',
                        'speech': `Hi. I am your ServiceNow Assistant. I can help you open a ticket or view an existing ticket.  Please either Post a 'view request' or a 'create request'.`
                    }
                ,
                "result": 
                    {
                        "platform": "servicenow",
                        "action": "getIncident"
                    }
                ,
                "result": 
                            {
                                "platform": "servicenow",
                                "action": "reportIncident"
                            }
                ,
                'view request': 
                    {
                        'platform': 'servicenow',
                        'action': 'getIncident',
                        'Number': 'INC0000058'
                    }
                ,
                'create request': 
                    {
                        'platform': 'servicenow',
                        'action': 'reportIncident',
                        'Number': 'INC0000058',
					    'State' : 'Texas',
					    'Short Description': 'Having an issue with my username.',
					    'Assignment Group': 'Tech Support'
                    }
    }
}

function createGetIncidentResponse(incidentResponse) {
    let incidentJson = JSON.parse(incidentResponse.body);
    
    logger.info(incidentJson);

    // let incidentStatus = incidentJson.State == '1' ? 'New' : incidentJson.State == '2' ? 'In Progress' :
    //     incidentJson.State == '3' ? 'On Hold' : incidentJson.State == '4' ? 'Resolved' :
    //         incidentJson.State == '5' ? 'Closed' : 'Cancelled';

    // let reasonForHold = incidentJson.State == '3' ? incidentJson.hold_reason == '1' ? 'Awaiting Caller' :
    //       incidentJson.hold_reason == '2' ? 'Awaiting Evidence' : incidentJson.hold_reason == '3' ? 'Awaiting Problem Resolution' : 'Awaiting Vendor' : '';

    // let incidentDetails = "Please find the incident details below \n1) Incident Id - " + incidentJson.Number +
    //      "\n2) Category - " + incidentJson.category + " \n3) Description - " + incidentJson.short_description +
    //      "\n4) Urgency - " + (incidentJson.urgency == '1' ? 'High' : incidentJson.urgency == '2' ? 'Medium' : 'Low') +
    //      "\n5) Status - " + incidentStatus + (reasonForHold != '' ? "\n6) Reason For Hold - " + reasonForHold : '');

    return {
                'speech': 'Reqeuest Confirmation',
                'displayText': 'Reqeuest Confirmation',
                'message': 
                    {
                        'platform': 'servicenow',
                        'speech': `Hi. I am your ServiceNow Assistant. Responding to your query. `
                    }
                ,
                incidentJson
    }
}