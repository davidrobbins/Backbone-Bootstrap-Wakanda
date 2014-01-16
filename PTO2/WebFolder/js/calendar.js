$(document).ready(function() {
	Backbone.emulateHTTP = true;

	/* Global PTO Admin App View */
	PTO.Views.App = Backbone.View.extend({
		initialize: function() {
			PTO.requestModel = new PTO.Models.Request();
			PTO.requestCollection = new PTO.Collections.RequestCollection();

			PTO.requestCollection.fetch({
				success: function(theCollection) {
					PTO.fullCalendarEventsArr = theCollection.toJSON().map(function(val, index, array) {return {title: val.ownerName, start: val.dateString};});
					
					var date = new Date();
					var d = date.getDate();
					var m = date.getMonth();
					var y = date.getFullYear();
					
					$('#calendar').fullCalendar({
						theme: true,
						header: {
							left: 'prev,next today',
							center: 'title',
							right: 'month,agendaWeek,agendaDay'
						},
						editable: false,
						weekends: false,
						events: PTO.fullCalendarEventsArr
						// events: [
							
						// ]
					});

				}
			}); //end - PTO.userCollection.fetch();
		} //end - initialize();
	});

	PTO.Models.Request = Backbone.Model.extend({
		parse: function(response) {
			if (response.__ENTITIES) {
				return response.__ENTITIES[0]
			} else {
				return response;
			}
		}, //end - parse.

		sync: function(method, model, options) {
			options || (options = {});

			switch (method) {
				case "read":
	            //options.url = "/rest/Request/?top=1&$filter='id%20%3D%20'" + this.get('id') + "&$params='%5B%5D'&$expand=owner";
	            options.url = "rest/Request/calendarAllRequests/?$top=40&$method=entityset&$timeout=300";
	            break;

            	case "delete":
                options.url = "/rest/Request(" + this.get('id') + ")/?$method=delete";
                break;

	            case "update":
	            options.url = "/rest/Request/?$method=update";    
                var wakandaquestPayload = {},
                	updateAttrs = this.changedAttributes();
                wakandaquestPayload.__ENTITIES = [];
                updateAttrs.__KEY = this.attributes.__KEY;
                updateAttrs.__STAMP = this.attributes.__STAMP;
                wakandaquestPayload.__ENTITIES.push(updateAttrs);
                options.data = JSON.stringify(wakandaquestPayload);
                break;

                case "create":
                options.url = "/rest/Request/?$method=update";
                var wakandaquestPayload = {};
                wakandaquestPayload.__ENTITIES = [];
                var currentModelObject = this.attributes;
                if (model.isNew()) {
                	currentModelObject.__ISNEW = true;
                }
                wakandaquestPayload.__ENTITIES.push(currentModelObject);
                options.data = JSON.stringify(wakandaquestPayload);
                break;

			} //end - switch (method).

			if (options.url) {
				return Backbone.sync.call(model, method, model, options); //first parameter sets the context.
			} //end - if (options.url).
		} //end - sync().
	}); //end - PTO.Models.Request().

	PTO.Collections.RequestCollection = Backbone.Collection.extend({
		model: PTO.Models.Request,

		url: function() {
			// var requestConfigObj = {};
			// 	requestConfigObj.dataClass = "Request";
			// 	requestConfigObj.top = 40;
			// 	requestConfigObj.filter = "dateRequested >= :1 && dateRequested <= :2";
			// 	requestConfigObj.timeout = 300;

			// 	return  PTO.wakandaQueryURLString(requestConfigObj, moment().subtract('days', 1).format(), moment().add('days', 10).format());

			// var requestConfigObj = {};
			// requestConfigObj.dataClass = "Request";
			// requestConfigObj.top = 40;
			// requestConfigObj.filter = "dateRequested > :1 && owner.id == :2";
			// requestConfigObj.timeout = 300;

			// return PTO.wakandaQueryURLString(requestConfigObj, new Date(), PTO.currentUserModel.get('ID'));
			return "rest/Request/calendarAllRequests/?$top=40&$method=entityset&$timeout=300";
			return "/rest/Request/?$top=40&$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'";
		},

		parse: function(response) {
			if (response.__ENTITIES) {
				return response.__ENTITIES;
			} else {
				return response;
			}
		} //end - parse.
	}); //PTO.Collections.RequestCollection().

	

	new PTO.Views.App(); //Let's instantiate our App view so it can init everything.

}); //end - $( document ).ready(function().