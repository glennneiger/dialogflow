# IncidentReport
The Incident Report project is used to integrate the chatbot for servicenow using dialogflow.

Used to create and view incidents in servicenow.

```
npm install

npm start

```

Open Postman.

POST http://localhost:5000/ai

follow the instructions in the response.



Shortcut to test getIncident:

First test against deployed API directly:

GET https://dev71283.service-now.com/api/377308/getincidentdetails/INC0000058

Then test against locally running nodejs server:

POST http://localhost:5000/ai
{
    "result": 
    {
        "platform": "servicenow",
        "action": "getIncident",
        "incidentId":" INC0000050"
    }
}


Shortcgut to test postIncident:

First test against deployed API directly:

POST https://dev71283.service-now.com/api/now/table/incident
--header "Accept:application/json" --user 'admin':'M____3' 
{"short_description":"Test creation of incident", "comments":"These are my Test comments"}

Then test against locally running nodejs server:

POST http://localhost:5000/ai
{
    "result": 
    {
        "platform": "servicenow",
        "action": "reportIncident",
        "short_description": "testing from postman to local nodejs to remote servicenow service now.  hope this works!",
        "comments":" i am filled with anticipation."
    }
}

Query the service-now database to make sure was updated:

https://dev71283.service-now.com/api/377308/getincidentdetails/[IncidentID]
