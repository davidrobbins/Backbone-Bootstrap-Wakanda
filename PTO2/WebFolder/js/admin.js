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
			PTO.requestToolBar = new PTO.Views.RequestToolBar();

			$('#requestStart').datepicker({});
			$('#requestEnd').datepicker({});

			PTO.holidayToolBar = new PTO.Views.HolidayToolbar();

			PTO.editUserView = new PTO.Views.EditUser();
			PTO.editHolidayView = new PTO.Views.EditHoliday();

			PTO.userCollection = new PTO.Collections.UserCollection();
			

			PTO.holidayCollection = new PTO.Collections.HolidayCollection();
			PTO.holidayCollection.fetch({
				success: function(theCollection) {
					$( "#holidayDateString" ).datepicker({});

					PTO.holidayCollectionView = new PTO.Views.HolidayCollectionView({collection: PTO.holidayCollection});
					PTO.holidayCollectionView.render();
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
					PTO.appContainerView.$el.find('.requests').addClass('hidden');
					PTO.appContainerView.$el.find('.users').addClass('hidden');
					PTO.appContainerView.$el.find('.holidays').addClass('hidden');
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
									PTO.appContainerView.$el.find('.requests').removeClass('hidden');
									PTO.currentUserMsg$.text("Signed in as " + model.get('fullName'));
									PTO.requestCollection.fetch({
										success: function(theCollection) {
											PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
											PTO.requestCollectionView.render();
										}
									}); //end - PTO.userCollection.fetch(); 
									PTO.userCollection.fetch({
										success: function(theCollection) {
											PTO.userCollectionView = new PTO.Views.UserCollectionView({collection: PTO.userCollection});
											PTO.userCollectionView.render();
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

	            case "update":
	            options.url = "/rest/Holiday/?$method=update";
	            var wakandaquestPayload = {},
                	updateAttrs = this.changedAttributes();
                wakandaquestPayload.__ENTITIES = [];
                if (model.isNew()) {
                	updateAttrs.__ISNEW = true;
                }
                updateAttrs.__KEY = this.attributes.__KEY;
                updateAttrs.__STAMP = this.attributes.__STAMP;
                wakandaquestPayload.__ENTITIES.push(updateAttrs);
                options.data = JSON.stringify(wakandaquestPayload);

                console.log(options.data);
                break;

                case "create":
                options.url = "/rest/Holiday/?$method=update";
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

	PTO.Views.HolidayView = Backbone.View.extend({
		tagName: 'tr',

		initialize: function() {
			//_bindAll(this, 'editTask', 'render');
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
			this.model.on('destroy', this.remove, this);
		},

		events: {
			"click a.edit"		: "editHoliday",
			"click a.delete"	: "deleteHoliday",
			"click" 			: "selected"
		},

		editHoliday: function() {
			this.model.fetch({
				success: function(model, response) {
					PTO.editHolidayView.model = model;
					PTO.editHolidayView.render(); 
				}
			}); 
		}, //end - editHoliday().

		deleteHoliday: function() {
			this.model.destroy();
		}, //end - deleteHoliday().

		selected: function() {
			this.$el.siblings().removeClass('gridSelect');
			this.$el.addClass('gridSelect');
		}, //end - selected().

		template: PTO.Utility.template('holiday-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this; //this allows us to chain.
		}  //end - render().
	}); //end - PTO.Views.HolidayView().

	PTO.Views.EditHoliday = Backbone.View.extend({
		el: '#editHolidayModalWin',


		events: {
			"click button.save"	: "saveHoliday",
		}, //end - events.

		saveHoliday: function() {
			this.model.save({
				title: 		this.$el.find('#holidayTitle').val(),
				dateString: 	this.$el.find('#holidayDateString').val(),

			}, {
				success: function(model, response) {
					//PTO.messageModel.set({title: model.get('fullName') + " updated on the server.", contextualClass: "alert-info"});
					PTO.holidayCollection.add(model);
					PTO.holidayCollectionView.render();
				}
			});
		},

		render: function() {
			//this.$el.find('#holidayId').val(this.model.get('id'));
			this.$el.find('#holidayTitle').val(this.model.get('title'));
			this.$el.find('#holidayDateString').val(this.model.get('dateString'));
			

			return this; 
		}  //end - render().
	}); //end - PTO.Views.EditUser().



	PTO.Views.HolidayCollectionView = Backbone.View.extend({
		el: '#holidayTableBody',

		// initialize: function() {
		// 	this.collection.bind('add', this.render);
		// },

		render: function() {
			this.$el.children().remove();

			//1. filter through all items in a collection.
			this.collection.each(function(user) {
				//2. For each item create a new person view.
				var userView = new PTO.Views.HolidayView({model: user});
				//3. Append each person view to our collection view.
				this.$el.append(userView.render().el); //chain chain chain...
			}, this); //the second parameter to each is the context.
		}
	}); //end - PTO.Views.HolidayCollectionView().

	PTO.Views.HolidayToolbar = Backbone.View.extend({
		el: '#holidayToolBar',

		events: {
			"click button.newHoliday"	: "newHoliday"
		},

		newHoliday: function() {
			PTO.editHolidayView.model = new PTO.Models.Holiday();
			PTO.editHolidayView.render(); 
		} //end - newHoliday().
	}); //end - PTO.Views.HolidayToolbar().




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
	            var wakandaquestPayload = {},
                	updateAttrs = this.changedAttributes();
                wakandaquestPayload.__ENTITIES = [];
                if (model.isNew()) {
                	updateAttrs.__ISNEW = true;
                }
                updateAttrs.__KEY = this.attributes.__KEY;
                updateAttrs.__STAMP = this.attributes.__STAMP;
                wakandaquestPayload.__ENTITIES.push(updateAttrs);
                options.data = JSON.stringify(wakandaquestPayload);

                console.log(options.data);
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
			//console.log(this.model);

			this.model.fetch({
				success: function(model, response) {
					//PTO.editUserView = new PTO.Views.EditUser();
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
			this.model.save({
				fullName: 		this.$el.find('#fullName').val(),
				floatingDays: 	this.$el.find('#floatingDays').val(),
				ptoHours: 		this.$el.find('#ptoHours').val(),
				compDays: 		this.$el.find('#compDays').val(),
				role: 			this.$el.find('#role').val(),
				email: 			this.$el.find('#email').val(),
				myManagerId:    this.$el.find('#managerSelect').val(),
				password: 		this.$el.find('#password').val(),
				ptoAccrualRate: this.$el.find('#ptoAccrualRate').val(),

			}, {
				success: function(model, response) {
					//PTO.messageModel.set({title: model.get('fullName') + " updated on the server.", contextualClass: "alert-info"});
					PTO.userCollection.add(model);
					PTO.userCollectionView.render();
				}
			});
		},

		render: function() {
			this.$el.find('#fullName').val(this.model.get('fullName'));
			this.$el.find('#floatingDays').val(this.model.get('floatingDays'));
			this.$el.find('#ptoHours').val(this.model.get('ptoHours'));
			this.$el.find('#compDays').val(this.model.get('compDays'));
			this.$el.find('#role').val(this.model.get('role'));
			this.$el.find('#email').val(this.model.get('email'));
			this.$el.find('#password').val(this.model.get('password'));
			this.$el.find('#ptoAccrualRate').val(this.model.get('ptoAccrualRate'));

			var theUser = this.model;

			PTO.managerCollection = new PTO.Collections.ManagerCollection();
			PTO.managerCollection.fetch({
				success: function(theCollection) {
					PTO.managerCollectionView = new PTO.Views.ManagerCollectionView({collection: theCollection});
					PTO.managerCollectionView.render(theUser);
				}
			});

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
			"click button.newUser"	: "newUser"
		},

		newUser: function() {
			PTO.editUserView.model = new PTO.Models.User();
			PTO.editUserView.render(); 
			//PTO.newUserView = new PTO.Views.NewUser({model: new PTO.Models.User(), collection: PTO.userCollection});
			//PTO.newUserView.render();
		} //end - newUser().
	}); //end - PTO.Views.UserToolbar().

	PTO.Views.RequestToolBar = Backbone.View.extend({
		el: '#requestToolBar',

		events: {
			"click button.searchRequests"	: "searchRequests"
		},

		searchRequests: function(ev) {
			ev.preventDefault(); //Don't let this button submit the form.
			//console.log("search Request dataclass.");
			// console.log(this.$el.find('#requestStart').val());
			// console.log(this.$el.find('#requestEnd').val());

			PTO.requestCollection.fetch({
				data: {
					requestStart: this.$el.find('#requestStart').val(),
					requestEnd: this.$el.find('#requestEnd').val(),
				},
				success: function(theCollection) {
					PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
					PTO.requestCollectionView.render();
				}
			}); //end - PTO.userCollection.fetch();
		}
	});//end - PTO.Views.RequestToolBar().

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

		template: PTO.Utility.template('manager-options-template'),

		render: function(theUser) {
			var managerName = theUser.toJSON().myManager ? theUser.toJSON().myManager.fullName : "None";
			this.$el.empty();

			this.$el.append('<option>None</option>');

			//1. filter through all items in a collection.
			this.collection.each(function(manager) {
				this.$el.append(this.template(manager.toJSON())); 
			}, this); //the second parameter to each is the context.

			//this.$el.find("option[value='" + managerName + "']").attr('selected', 'selected');
			if (theUser.toJSON().myManager) {
				this.$el.find("option[value='" + theUser.toJSON().myManager.id + "']").attr('selected', 'selected');
			}
				

			return this;
		} //end - render().
	}); //end - PTO.Views.ManagerCollectionView()



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
					// console.log('error callback');
					// console.log(model);
				}
			});
			
        }, //end - payrollCheck().
		

		template: PTO.Utility.template('requests-table-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			if (this.model.get('payrollChecked')) {
				this.$el.addClass('warning');
			} else {
				this.$el.removeClass('warning');
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
			// console.log(this.model.get('payrollChecked')); 

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

		requestStart: null,
		requestEnd: null,

		fetch: function(options) {
            options || (options = {});
            var data = (options.data || {});
            this.requestStart = (data.requestStart || "04/15/2014"),
            this.requestEnd = (data.requestEnd || null);
            
            console.log("Request Start: " + this.requestStart);
            console.log("Request End: " + this.requestEnd);
            console.log(options);
            delete options.data;
            console.log(options);

            return Backbone.Collection.prototype.fetch.call(this, options);
          },

		url: function() {

			var requestConfigObj = {};
			requestConfigObj.dataClass = "Request";
			requestConfigObj.top = 30;
			//requestConfigObj.filter = "$all";
			requestConfigObj.filter = "dateRequested > :1";
			requestConfigObj.timeout = 300;
			//return PTO.wakandaQueryURLString(requestConfigObj); //2011,10,30)
			return PTO.wakandaQueryURLString(requestConfigObj, moment(this.requestStart).toDate()); //, PTO.currentUserModel.get('ID') //new Date(2014, 05, 01)
			
			//return "/rest/Request/?$top=40&$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'&$expand=owner, owner.myManager";
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

