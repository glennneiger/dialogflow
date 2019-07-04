(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

  // something is wrong with the way I configured this script include so hardcoding for now..
//return new getIncidentDetails().getdetails(request.pathParams.number);
var inc = [];
var gr = new GlideRecord('incident');
gr.addQuery('number',request.pathParams.number);
gr.query();
if (gr.next())
{
  inc.push({
    'Number' : gr.number + '',
    'State' : gr.state.getDisplayValue() + '',
    'Short Description': gr.short_description + '',
    'Assignment Group': gr.assignment_group.getDisplayValue()
  });
  return inc;
}

//Smoke Test
// 	var pathParamsVar = request.pathParams;
// var firstNameVar = pathParamsVar.number;
// var body = {};
// body.firstName = "ECHO test - " + firstNameVar + " " + firstNameVar + " " + firstNameVar + " " + firstNameVar;
// response.setBody(body);

})(request, response);