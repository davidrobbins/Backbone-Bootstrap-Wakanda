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
			PTO.editUserView = new PTO.Views.EditUser();

			//Message.
			PTO.messageModel = new PTO.Models.Message();
			PTO.messageXView = new PTO.Views.XMessage({model: PTO.messageModel})

			PTO.appContainerView = new PTO.Views.AppContainer({model: PTO.currentUserModel});
			
			//Nav
			PTO.navListView = new PTO.Views.Navlist();

			//Requests
			PTO.requestModel = new PTO.Models.Request();
			PTO.requestCollection = new PTO.Collections.RequestCollection();

			PTO.navbarlist$ = $('#navbarlist');
			PTO.messageContainer$ = $('#messageContainer');
			PTO.currentUserMsg$ = $('#currentUserMsg');

			PTO.userCollection = new PTO.Collections.UserCollection();
			PTO.userCollection.fetch({
				success: function(theCollection) {
					PTO.userCollectionView = new PTO.Views.UserCollectionView({collection: PTO.userCollection});
					PTO.userCollectionView.render();
				}
			}); //end - PTO.userCollection.fetch();

			
		}, //end - initialize().

		navigate: function(where) {
			switch(where) {
			
				case "holidays" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.requests').addClass('hidden');
					PTO.appContainerView.$el.find('.users').addClass('hidden');
					PTO.appContainerView.$el.find('.holidays').removeClass('hidden');
					PTO.navbarlist$.find('li.holidays').addClass('active');
					PTO.navbarlist$.find('li.holidays').siblings().removeClass('active');
				}
				break;

				case "users" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.requests').addClass('hidden');
					PTO.appContainerView.$el.find('.holidays').addClass('hidden');
					PTO.appContainerView.$el.find('.users').removeClass('hidden');
					PTO.navbarlist$.find('li.users').addClass('active');
					PTO.navbarlist$.find('li.users').siblings().removeClass('active');
				} 
				break;

				case "requests" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.users').addClass('hidden');
					PTO.appContainerView.$el.find('.holidays').addClass('hidden');
					PTO.appContainerView.$el.find('.requests').removeClass('hidden');
					PTO.navbarlist$.find('li.requests').addClass('active');
					PTO.navbarlist$.find('li.requests').siblings().removeClass('active');

					PTO.requestCollection.fetch({
						success: function(theCollection) {
							PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
							PTO.requestCollectionView.render();
						}
					}); //end - PTO.userCollection.fetch();
				}			
				break;

			} //end - switch(where).
		} //end - navigate().
	});//end - PTO.Views.App().


	//Not digging hash navigation.
	PTO.Views.Navlist = Backbone.View.extend({
		el: '#navbarlist',

		events: {
			'click .holidays' : 'holidays',
			'click .users' : 'users',
			'click .requests' : 'requests'
		},

		holidays: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'holidays');
		},

		users: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'users');
		},

		requests: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'requests');
		}
	});


	PTO.Models.Message = Backbone.Model.extend({
		defaults: {
			title: '',
			contextualClass: 'alert-info'
		}
	}); //end - PTO.Models.Message().

	PTO.Views.XMessage = Backbone.View.extend({
		el: '#messageContainer', 

		initialize: function() {
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
		},

		template: PTO.Utility.template('message-template'),

		render: function() {
			this.$el.children().remove();
			this.$el.append(this.template(this.model.toJSON())); 
			this.$el.fadeIn(2000);
			var that$ = this.$el;
			setTimeout(function() {that$.fadeOut(3000);}, 5000);
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
							//PTO.messageModel.set({title: model.get('fullName') + " successfully signed in.", contextualClass: "alert-info"});
							PTO.currentUserMsg$.text("Signed in as " + model.get('fullName'));
							PTO.requestCollection.fetch({
								success: function(theCollection) {
									PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
									PTO.requestCollectionView.render();
								}
							}); //end - PTO.userCollection.fetch();

						} else {
							PTO.messageModel.set({title: "We could not sign you in.", contextualClass: "alert-danger"});
						}
						
						// var messageView = new PTO.Views.Message({model: PTO.messageModel});
						// PTO.messageContainer$.children().remove();
						// PTO.messageContainer$.append(messageView.render().el); 
					}}); 
				}
			}); //end - this.save().
		} //end - loginByPassword().

	}); //end - PTO.Models.Directory().

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
				PTO.navbarlist$.find('li.requests').addClass('active');
			}
			
			return this; //So we can chain our render() method.
		} //end - render().
	}); //end - PTO.Views.CurrentUser().



	//Holiday Model
	PTO.Models.Holiday = Backbone.Model.extend({
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
	            options.url = "/rest/Holiday/?top=1&$filter='id%20%3D%20'" + this.get('id') + "&$params='%5B%5D'";
	            break;

			} //end - switch (method).

			if (options.url) {
				return Backbone.sync.call(model, method, model, options); //first parameter sets the context.
			} //end - if (options.url).
		} //end - sync().
	}); //end - PTO.Models.Holiday().

	// The List of Holidays
	PTO.Collections.HolidayCollection = Backbone.Collection.extend({
		model: PTO.Models.Holiday,

		url: function() {
			return "/rest/Holiday/?$top=40&$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'";
		},

		parse: function(response) {
			if (response.__ENTITIES) {
				return response.__ENTITIES;
			} else {
				return response;
			}
		} //end - parse.
	}); //end - PTO.Collections.HolidayCollection.





	//User Model
	PTO.Models.User = Backbone.Model.extend({
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
	            options.url = "/rest/User/?top=1&$filter='id%20%3D%20'" + this.get('id') + "&$params='%5B%5D'&$expand=myManager";
	            break;

            	case "delete":
                options.url = "/rest/User(" + this.get('id') + ")/?$method=delete";
                break;

	            case "update":
	            options.url = "/rest/User/?$method=update";
	            delete(model.attributes.uri);
                options.url = "/rest/User(" + this.get('id') + ")/?$method=update";
                var wakandaquestPayload = {};
                wakandaquestPayload.__ENTITIES = [];
                wakandaquestPayload.__ENTITIES.push(this.attributes);
                options.data = JSON.stringify(wakandaquestPayload);
                break;

                case "create":
                options.url = "/rest/User/?$method=update";
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
	}); //end - PTO.Models.User().

	PTO.Views.UserView = Backbone.View.extend({
		tagName: 'tr',

		initialize: function() {
			//_bindAll(this, 'editTask', 'render');
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
			this.model.on('destroy', this.remove, this);
		},

		events: {
			"click a.edit"		: "editUser",
			"click a.delete"	: "deleteUser",
			"click" 			: "selected"
		},

		editUser: function() {
			this.model.fetch({
				success: function(model, response) {
					PTO.editUserView.model = model;
					PTO.editUserView.render(); 
				}
			}); 
		}, //end - editUser().

		deleteUser: function() {
			this.model.destroy();
		}, //end - deleteUser().

		selected: function() {
			this.$el.siblings().removeClass('gridSelect');
			this.$el.addClass('gridSelect');
		}, //end - selected().

		template: PTO.Utility.template('user-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this; //this allows us to chain.
		}  //end - render().
	}); //end - PTO.Views.UserView().

	PTO.Views.EditUser = Backbone.View.extend({
		el: '#editUserModalWin',

		events: {
			"click button.save"	: "saveUser",
		}, //end - events.

		saveUser: function() {
			this.model.set({
				fullName: 		this.$el.find('#fullName').val(),
				floatingDays: 	this.$el.find('#floatingDays').val(),
				ptoHours: 		this.$el.find('#ptoHours').val(),
				role: 			this.$el.find('#role').val()

			}, 

			{validate: true}).save({},{
				success: function(ev) {
					PTO.messageModel.set({title: ev.get('fullName') + " updated on the server.", contextualClass: "alert-info"});
					// var messageView = new PTO.Views.Message({model: PTO.messageModel});
					// PTO.messageContainer$.children().remove();
					// PTO.messageContainer$.append(messageView.render().el); 
				} //end - success().
			});
		},

		render: function() {
			this.$el.find('#fullName').val(this.model.get('fullName'));
			this.$el.find('#floatingDays').val(this.model.get('floatingDays'));
			this.$el.find('#ptoHours').val(this.model.get('ptoHours'));
			this.$el.find('#role').val(this.model.get('role'));
			return this; 
		}  //end - render().
	}); //end - PTO.Views.EditUser().

	// The List of Users
	PTO.Collections.UserCollection = Backbone.Collection.extend({
		model: PTO.Models.User,

		url: function() {
			return "/rest/User/?$top=40&$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'&$expand=myManager"; //"&$expand=owner, owner.myManager"
		},

		parse: function(response) {
			if (response.__ENTITIES) {
				return response.__ENTITIES;
			} else {
				return response;
			}
		} //end - parse.
	}); //end - PTO.Collections.UserCollection.

	PTO.Views.UserCollectionView = Backbone.View.extend({
		el: '#userTableBody',

		render: function() {
			//1. filter through all items in a collection.
			this.collection.each(function(user) {
				//2. For each item create a new person view.
				var userView = new PTO.Views.UserView({model: user});
				//3. Append each person view to our collection view.
				this.$el.append(userView.render().el); //chain chain chain...
			}, this); //the second parameter to each is the context.
		}
	}); //end - PTO.Views.UserCollectionView().





	//Requests
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
	            // delete(model.attributes.uri);
             //    options.url = "/rest/Request(" + this.get('id') + ")/?$method=update";
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

	PTO.Views.Request = Backbone.View.extend({
		tagName: 'tr',
		//tagName: 'li',

		// attributes: {
		// 	class: 'list-group-item pendingRequestListItem'
		// },

		template: PTO.Utility.template('requests-table-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this; //this allows us to chain.
		}
	});

	PTO.Collections.RequestCollection = Backbone.Collection.extend({
		model: PTO.Models.Request,

		url: function() {
			// var requestConfigObj = {};
			// requestConfigObj.dataClass = "Request";
			// requestConfigObj.top = 40;
			// requestConfigObj.filter = "dateRequested > :1 && owner.id == :2";
			// requestConfigObj.timeout = 300;

			// return PTO.wakandaQueryURLString(requestConfigObj, new Date(), PTO.currentUserModel.get('ID'));
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

	PTO.Views.RequestCollectionView = Backbone.View.extend({
		//el: '#requestsUL',
		el: '#requestTableBody',

		render: function() {
			this.$el.empty();

			//1. filter through all items in a collection.
			this.collection.each(function(request) {
				//2. For each item create a new person view.
				var requestView = new PTO.Views.Request({model: request});
				//3. Append each person view to our collection view.
				this.$el.append(requestView.render().el); //chain chain chain...
			}, this); //the second parameter to each is the context.
		}
	}); //end - PTO.Views.UserCollectionView().




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
	
	//Don't like Hash navigation.
	//new PTO.Router(); //Create an instance of our router.
	//Backbone.history.start(); //Tell Backbone to start monitoring hash change events in the browser.


}); //end - $( document ).ready(function().

