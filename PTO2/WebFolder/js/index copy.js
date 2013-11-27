$(document).ready(function() {
	Backbone.emulateHTTP = true; 
	PTO.vent = _.extend({}, Backbone.Events);

	//Template Helper
	PTO.Utility.template = function(id) {
		return _.template($('#' + id).html());
	}; //end - PTO.Utility.template().

	/* Global PTO Admin App View */
	PTO.Views.App = Backbone.View.extend({
		initialize: function() {
			PTO.vent.on('navigate', this.navigate, this); //Set hash change event handler.
			PTO.currentUserModel = new PTO.Models.CurrentUser(); //Instantiate our currentUser Model.
			PTO.currentUserView = new PTO.Views.CurrentUser({model: PTO.currentUserModel}); //Instantiate our currentUser Model.
			PTO.messageModel = new PTO.Models.Message();
			PTO.appContainerView = new PTO.Views.AppContainer({model: PTO.currentUserModel});
			//Requests
			PTO.requestModel = new PTO.Models.Request();
			PTO.newRequestView = new PTO.Views.NewRequest({model: PTO.requestModel});


			PTO.navbarlist$ = $('#navbarlist');
			PTO.messageContainer$ = $('#messageContainer');
		}, //end - initialize().

		navigate: function(where) {
			switch(where) {
			
				case "newRequest" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.accountHistory').addClass('hidden');
					PTO.appContainerView.$el.find('.newRequest').removeClass('hidden');
					PTO.navbarlist$.find('li.newRequest').addClass('active');
					PTO.navbarlist$.find('li.newRequest').siblings().removeClass('active');
				}
				break;

				case "accountHistory" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.newRequest').addClass('hidden');
					PTO.appContainerView.$el.find('.accountHistory').removeClass('hidden');
					PTO.navbarlist$.find('li.accountHistory').addClass('active');
					PTO.navbarlist$.find('li.accountHistory').siblings().removeClass('active');
				} 
				break;

			} //end - switch(where).
		} //end - navigate().
	});//end - PTO.Views.App().



	PTO.Router = Backbone.Router.extend({
		routes: {
			'': 'index', //empty uri triggers the index method.

			'newRequest': 'newRequest',

			'accountHistory': 'accountHistory'
		}, //end - routes

		newRequest: function() {
			PTO.vent.trigger('navigate', 'newRequest');
		},

		accountHistory: function() {
			PTO.vent.trigger('navigate', 'accountHistory');
		}
	}); //end - PTO.Router().



	PTO.Models.Message = Backbone.Model.extend({
		defaults: {
			title: ''
		}
	}); //end - PTO.Models.Message().

	PTO.Views.Message = Backbone.View.extend({
		tagName: 'div',

		template: PTO.Utility.template('message-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this; //this allows us to chain.
		}  //end - render().

	}); //end - PTO.Views.Message().

	PTO.Models.CurrentUser = Backbone.Model.extend({
		defaults: {
			userName: null,
			fullName: null,
			ID: null
		},

		url: "rest/$directory/currentUser/?$top=40&$method=entityset&$timeout=300",

		parse: function(response) {
			if (response.result === null) {
				//If there is not a session Wakanda won't return this object so we have to create it.
				response.result = {userName: null, fullName: null, ID: null}
			}

			return response.result;
		}, //end - parse.

		logout: function() {
			this.save({}, {
				url: "rest/$directory/logout/?$top=40&$method=entityset&$timeout=300",
				//success: successCallBkFn
				success: function(model, response) {
					model.fetch(); 
				}
			}); //end - this.save().
		}, //end - logout().

		loginByPassword: function(credentialsObj, successCallBkFn) {
			this.save({}, {
				data: JSON.stringify({email: credentialsObj.email, password: credentialsObj.password}),
				url: "rest/User/login/?$top=40&$method=entityset&$timeout=300",
				//success: successCallBkFn
				success: function(model, response) {
					model.fetch({success: function(model) {
						if (model.get('fullName') !== null) {
							PTO.messageModel.set({title: model.get('fullName') + " successfully signed in."});
							PTO.navbarlist$.find('li.newRequest').addClass('active');
						} else {
							PTO.messageModel.set({title: "We could not sign you in."});
						}
						
						var messageView = new PTO.Views.Message({model: PTO.messageModel});
						PTO.messageContainer$.children().remove();
						PTO.messageContainer$.append(messageView.render().el); 
					}}); 
				}
			}); //end - this.save().
		} //end - loginByPassword().

	}); //end - PTO.Models.CurrentUser().

	PTO.Views.CurrentUser = Backbone.View.extend({
		el: '#loginContainer',

		initialize: function() {
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
		},

		events: {
			'submit .login' : 'loginUser',
			'submit .logout' : 'logoutUser'
		}, //end - events.

		loginUser: function(e) {
			e.preventDefault();

			this.model.loginByPassword({email: this.$el.find('#loginEmail').val(), 
				password: this.$el.find('#loginPassword').val()
			});
		},

		logoutUser: function(e) {
			e.preventDefault();
			PTO.messageContainer$.children().remove();
			this.model.logout();
		},


		render: function() {
			if (this.model.get('userName') === null) {
				this.$el.find('.logout').addClass('hidden');
				this.$el.find('.login').removeClass('hidden'); 
				PTO.navbarlist$.find('li').removeClass('active');

			} else {
				this.$el.find('.login').addClass('hidden'); 
				this.$el.find('.logout').removeClass('hidden'); 
				PTO.navbarlist$.find('li.home').addClass('active');
			}
			
			return this; //So we can chain our render() method.
		} //end - render().
	}); //end - PTO.Views.CurrentUser().


	//Request Model
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
	            options.url = "/rest/Request/?top=1&$filter='id%20%3D%20'" + this.get('id') + "&$params='%5B%5D'";
	            break;

            	case "delete":
                options.url = "/rest/Request(" + this.get('id') + ")/?$method=delete";
                break;

	            case "update":
	            options.url = "/rest/Request/?$method=update";
	            delete(model.attributes.uri);
                options.url = "/rest/Request(" + this.get('id') + ")/?$method=update";
                var wakandaquestPayload = {};
                wakandaquestPayload.__ENTITIES = [];
                wakandaquestPayload.__ENTITIES.push(this.attributes);
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

	PTO.Views.NewRequest = Backbone.View.extend({
		el: '#newRequest',

		events: {
			"click button.newRequest"	: "newRequest",
		},

		newRequest: function(ev) {
			ev.preventDefault(); //Don't let this button submit the form.

			this.model.set({
				compensation: 	this.$el.find('#requestCompensation').val(),
				dateString: 	this.$el.find('#requestDate').val(),
				hours: 			this.$el.find('#requestHours').val(),
				__ISNEW: true

			}, 

			{validate: true}).save({},{
				success: function(ev) {
					PTO.messageModel.set({title: "New request submitted."});
					var messageView = new PTO.Views.Message({model: PTO.messageModel});
					PTO.messageContainer$.children().remove();
					PTO.messageContainer$.append(messageView.render().el); 
				} //end - success().
			});
		}

	}); //end - PTO.Views.NewRequest();




	PTO.Views.AppContainer = Backbone.View.extend({
		el: '#appContainer',

		initialize: function() {
			this.model.on('change', this.render, this); 
		},

		render: function() {
			if (this.model.get('userName') === null) {
				this.$el.find('.app').addClass('hidden');
				this.$el.find('.splash').removeClass('hidden'); 
			} else {
				this.$el.find('.splash').addClass('hidden'); 
				this.$el.find('.app').removeClass('hidden'); 
			}
			
			return this; //So we can chain our render() method.

		} //end - render().

	}); //end - PTO.Views.AppContainer().

	new PTO.Views.App(); //Let's instantiate our App view so it can init everything.
	new PTO.Router(); //Create an instance of our router.
	Backbone.history.start(); //Tell Backbone to start monitoring hash change events in the browser.

	$( "#requestDate" ).datepicker({
			inline: true
		});

}); //end - $( document ).ready(function().

