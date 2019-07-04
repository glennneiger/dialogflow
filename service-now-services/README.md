# ServiceNow REST Endpoint to retrieve a ticket incident

login to servicenow

search for scripted rest apis

search for script includes


click new

getIncidentDetails

API ID: getincidentdetails
Application: Global
API Namespace: 377308

Submit

Click on getIncidentDetails

Short Description: To get incident deatils.

update

Resources - click new

Name: IncidentDetails

Http Method: GET

Relative Path: /{number}

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	return new getIncidentDetails().getdetails(request.pathParams.number);

})(request, response);

submit

search script includes and click on new

getIncidentDetails

update / submit / save

search rest api explorer

Namespace: 377308

API Name: getIncidentDetails

API Version: latest

Pass incident number:   (use real incident number by searching for for incident) INC0000058

Base API Path: /api/377308/getincidentdetails