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
			PTO.vent.on('navigate', this.navigate, this); //Set hash change event handler. NO LONGER HASH CHANGE EVENTS

			PTO.currentUserModel = new PTO.Models.CurrentUser(); //Instantiate our currentUser Model.
			PTO.currentUserView = new PTO.Views.CurrentUser({model: PTO.currentUserModel}); //Instantiate our currentUser Model.
			// PTO.editUserView = new PTO.Views.EditUser();

			//Message.
			PTO.messageModel = new PTO.Models.Message();
			//PTO.messageXView = new PTO.Views.XMessage({model: PTO.messageModel});

			PTO.setMessage = function(messageObj) {
				PTO.messageModel.set({title: messageObj.title, contextualClass: messageObj.contextualClass});
				PTO.messageXView = new PTO.Views.XMessage({model: PTO.messageModel});
				PTO.messageXView.render();
			};

			PTO.appContainerView = new PTO.Views.AppContainer({model: PTO.currentUserModel});
			
			//Nav
			PTO.navListView = new PTO.Views.Navlist();

			//Requests
			PTO.requestModel = new PTO.Models.Request();
			PTO.requestCollection = new PTO.Collections.RequestCollection();
			PTO.editRequestView = new PTO.Views.EditRequest();

			PTO.navbarlist$ = $('#navbarlist');
			PTO.messageContainer$ = $('#messageContainer');
			PTO.currentUserMsg$ = $('#currentUserMsg');

			PTO.userToolBar = new PTO.Views.UserToolbar();
			PTO.userCollection = new PTO.Collections.UserCollection();
			PTO.userCollection.fetch({
				success: function(theCollection) {
					PTO.userCollectionView = new PTO.Views.UserCollectionView({collection: PTO.userCollection});
					PTO.userCollectionView.render();
				}
			}); //end - PTO.userCollection.fetch();

			PTO.managerCollection = new PTO.Collections.ManagerCollection();
			PTO.managerCollection.fetch({
				success: function(theCollection) {
					PTO.managerCollectionView = new PTO.Views.ManagerCollectionView({collection: theCollection});
					PTO.managerCollectionView.render();
				}
			});
			
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

	//Message Model.
	PTO.Models.Message = Backbone.Model.extend({
		defaults: {
			title: '',
			contextualClass: 'alert-info'
		}
	}); //end - PTO.Models.Message().


	PTO.Views.XMessage = Backbone.View.extend({
		el: '#messageContainer', 

		initialize: function() {
			// console.log('we are init for xMessage');
			// console.log(this.model);

			//this.model.on('change', this.render, this); //change:title, destroy, add, etc.
		},

		template: PTO.Utility.template('message-template'),

		render: function() {
			this.$el.children().remove();
			this.$el.append(this.template(this.model.toJSON())); 
			this.$el.fadeIn(500);
			var that$ = this.$el;
			setTimeout(function() {that$.fadeOut(1500);}, 4000);
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

		currentUserBelongsTo: function(parmObj, successCallBkFn) {
			this.save({}, {
				data: JSON.stringify({groupName: parmObj.groupName}),
				url: "rest/User/currentUserBelongsTo/?$top=40&$method=entityset&$timeout=300",
				success: successCallBkFn
			}); //end this.save();
		}, //end - currentUserBelongsTo().

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

					model.currentUserBelongsTo({groupName: "Administrator"}, function(model, response) {
						if (!response.result) {
							//No access to Admin group.
							PTO.setMessage({title: "You do not have permission to access PTO Admin.", contextualClass: "alert-danger"});

						} else {
						 	//Yes to admin permission.
							model.fetch({success: function(model) {
								if (model.get('fullName') !== null) {
									PTO.currentUserMsg$.text("Signed in as " + model.get('fullName'));
									PTO.requestCollection.fetch({
										success: function(theCollection) {
											PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
											PTO.requestCollectionView.render();
										}
									}); //end - PTO.userCollection.fetch();

								} else {
									PTO.setMessage({title: "We could not sign you in.", contextualClass: "alert-danger"});
								}
							}}); 
						} //end - if (!response.result).
					}); //end - model.currentUserBelongsTo({groupName: "Manager"}).

					
				} //end - success(). 
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
				//PTO.navbarlist$.find('li.requests').addClass('active');
				PTO.navbarlist$.find('li.users').addClass('active');
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
					PTO.editUserView = new PTO.Views.EditUser();
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
				role: 			this.$el.find('#role').val(),
				email: 			this.$el.find('#email').val()

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
			this.$el.find('#email').val(this.model.get('email'));
			return this; 
		}  //end - render().
	}); //end - PTO.Views.EditUser().

	PTO.Collections.ManagerCollection = Backbone.Collection.extend({
		model: PTO.Models.User,

		url: function() {
			var requestConfigObj = {};
			requestConfigObj.dataClass = "User";
			requestConfigObj.top = 40;
			//requestConfigObj.filter = "dateRequested > :1 && owner.myManagerId == :2  && status == :3";
			requestConfigObj.filter = "role == :1";
			requestConfigObj.timeout = 300;

			return PTO.wakandaQueryURLString(requestConfigObj, "Manager");

			//return "/rest/User/?$top=40&$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'&$expand=myManager";
		},

		parse: function(response) {
			if (response.__ENTITIES) {
				return response.__ENTITIES;
			} else {
				return response;
			}
		} //end - parse.

	}); //end - PTO.Collections.ManagerCollection().

	PTO.Views.ManagerCollectionView = Backbone.View.extend({
		el : '#managerSelect',

		render: function() {
			this.$el.empty();

			//1. filter through all items in a collection.
			this.collection.each(function(manager) {
				//2. For each item create a new person view.
				var managerView = new PTO.Views.ManagerView({model: manager});
				//3. Append each person view to our collection view.
				this.$el.append(managerView.render().el); //chain chain chain...
			}, this); //the second parameter to each is the context.
		}

	}); //end - PTO.Views.ManagerCollectionView()

	PTO.Views.ManagerView = Backbone.View.extend({
		tagName: 'option',

		template: PTO.Utility.template('manager-options-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this; //this allows us to chain.
		}

	}); //end - PTO.Views.EmployeeRequest().

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

		// initialize: function() {
		// 	this.collection.bind('add', this.render);
		// },

		render: function() {
			this.$el.children().remove();

			//1. filter through all items in a collection.
			this.collection.each(function(user) {
				//2. For each item create a new person view.
				var userView = new PTO.Views.UserView({model: user});
				//3. Append each person view to our collection view.
				this.$el.append(userView.render().el); //chain chain chain...
			}, this); //the second parameter to each is the context.
		}
	}); //end - PTO.Views.UserCollectionView().

	PTO.Views.UserToolbar = Backbone.View.extend({
		el: '#userToolBar',

		events: {
			"click button.newUser"		: "newUser"
		},

		newUser: function() {
			PTO.newUserView = new PTO.Views.NewUser({model: new PTO.Models.User(), collection: PTO.userCollection});
			PTO.newUserView.render();
		} //end - newUser().

	}); //end - PTO.Views.UserToolbar().

	PTO.Views.NewUser = Backbone.View.extend({
		el: '#editUserModalWin',

		events: {
			"click button.save"	: "saveUser",
		}, //end - events.

		saveUser: function() {

			/*
			this.collection.create({
				fullName: 		this.$el.find('#fullName').val(),
				floatingDays: 	this.$el.find('#floatingDays').val(),
				ptoHours: 		this.$el.find('#ptoHours').val(),
				role: 			this.$el.find('#role').val(),
				email: 			this.$el.find('#email').val(),
				__ISNEW: true
			}, {
				success: function(ev) {
					//console.log('New user saved on wakanda server.');
					PTO.userCollectionView.render();
				}, //end - success().

				error: function(ev) {

				}
			});
			*/


			/**/
			this.model.save({
				fullName: 		this.$el.find('#fullName').val(),
				floatingDays: 	this.$el.find('#floatingDays').val(),
				ptoHours: 		this.$el.find('#ptoHours').val(),
				role: 			this.$el.find('#role').val(),
				email: 			this.$el.find('#email').val(),
				__ISNEW: true
			}, {
				success: function(model, response) {
					// console.log('New user saved on wakanda server.');
					// console.log(model);
					PTO.userCollection.add(model);
					PTO.userCollectionView.render();
				}, //end - success().

				error: function(model, response) {
					PTO.setMessage({title: response.responseJSON.__ENTITIES[0].__ERROR[0].message, contextualClass: "alert-danger"});
					//console.log(response.responseJSON.__ENTITIES[0].__ERROR[0].message);
				}
			}); //end - this.model.save().
			

		}, //end - saveUser().

		render: function() {
			this.$el.find('#fullName').val("");
			this.$el.find('#floatingDays').val("");
			this.$el.find('#ptoHours').val("");
			this.$el.find('#role').val("Employee");
			this.$el.find('#email').val("");
			return this; 
		}  //end - render().
	}); //end - PTO.Views.NewUser().





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
	            options.url = "/rest/Request/?top=1&$filter='id%20%3D%20'" + this.get('id') + "&$params='%5B%5D'&$expand=owner";
	            break;

            	case "delete":
                options.url = "/rest/Request(" + this.get('id') + ")/?$method=delete";
                break;

	            case "update":
	            options.url = "/rest/Request/?$method=update";
	            console.log('now using changedAttributes()');
	            
                var wakandaquestPayload = {};
                wakandaquestPayload.__ENTITIES = [];
                //var updateAttrs = {};
                var updateAttrs = this.changedAttributes();
                updateAttrs.__KEY = this.attributes.__KEY;
                updateAttrs.__STAMP = this.attributes.__STAMP;
                //updateAttrs.payrollChecked = this.attributes.payrollChecked;
                wakandaquestPayload.__ENTITIES.push(updateAttrs);
                //wakandaquestPayload.__ENTITIES.push(this.attributes);
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

		initialize: function() {
			//_bindAll(this, 'editTask', 'render');
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
			this.model.on('destroy', this.remove, this);
		},

		events: {
			"click button.payrollcheck"	: "payrollCheck",
			"click a.edit"				: "editRequest",
			"click" 					: "selected"
		},

		selected: function() {
			this.$el.siblings().removeClass('gridSelect');
			this.$el.addClass('gridSelect');
		}, //end - selected().

		editRequest: function() {
			this.model.fetch({
				success: function(model, response) {
					PTO.editRequestView.model = model;
					PTO.editRequestView.render(); 
				}
			}); 
		}, //end - editUser().

        payrollCheck: function() {
        	/**/
        	this.model.save({payrollChecked: !(this.model.get('payrollChecked'))}, {
				success: function(model, response, options) {
					
				},
				error: function(model, xhr, options) {
					console.log('error callback');
					console.log(model);
				}
			});
			
        }, //end - payrollCheck().
		

		template: PTO.Utility.template('requests-table-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			if (this.model.get('payrollChecked')) {
				this.$el.addClass('warning');
			}
			return this; //this allows us to chain.
		}
	});

	PTO.Views.EditRequest = Backbone.View.extend({
		el: '#editRequestModalWin',

		events: {
			"click button.save"	: "saveRequest",
		}, //end - events.

		saveRequest: function() {
			this.model.save({payrollChecked: this.$el.find('#payrollChecked').prop('checked')},{
				success: function(ev) {
					//PTO.messageModel.set({title: ev.get('fullName') + " updated on the server.", contextualClass: "alert-info"});
				} //end - success().
			});
		},

		render: function() {
			console.log(this.model.get('payrollChecked')); 

			this.$el.find('#payrollChecked').prop('checked', this.model.get('payrollChecked'));

			// $('.myCheckbox').prop('checked', true);
			// $('.myCheckbox').prop('checked', false);

			// this.$el.find('#fullName').val(this.model.get('fullName'));
			// this.$el.find('#floatingDays').val(this.model.get('floatingDays'));
			// this.$el.find('#ptoHours').val(this.model.get('ptoHours'));
			// this.$el.find('#role').val(this.model.get('role'));
			return this; 
		}  //end - render().
	}); //end - PTO.Views.EditUser().

	PTO.Collections.RequestCollection = Backbone.Collection.extend({
		model: PTO.Models.Request,

		url: function() {
			// var requestConfigObj = {};
			// requestConfigObj.dataClass = "Request";
			// requestConfigObj.top = 40;
			// requestConfigObj.filter = "dateRequested > :1 && owner.id == :2";
			// requestConfigObj.timeout = 300;

			// return PTO.wakandaQueryURLString(requestConfigObj, new Date(), PTO.currentUserModel.get('ID'));
			return "/rest/Request/?$top=40&$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'&$expand=owner, owner.myManager";
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
	}); //end - PTO.Views.RequestCollectionView().




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

