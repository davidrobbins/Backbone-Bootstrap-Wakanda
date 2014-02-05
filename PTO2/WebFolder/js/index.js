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
			PTO.vent.on('accountNavigate', this.accountNavigate, this); //Set hash change event handler.

			PTO.currentUserModel = new PTO.Models.CurrentUser(); //Instantiate our currentUser Model.
			PTO.currentUserView = new PTO.Views.CurrentUser({model: PTO.currentUserModel});
			PTO.currentUserLogoutView = new PTO.Views.CurrentUserLogout({model: PTO.currentUserModel}); 
			
			//Messages
			PTO.messageModel = new PTO.Models.Message();
			//PTO.messageXView = new PTO.Views.XMessage({model: PTO.messageModel});

			PTO.setMessage = function(messageObj) {
				PTO.messageModel.set({title: messageObj.title, contextualClass: messageObj.contextualClass});
				PTO.messageXView = new PTO.Views.XMessage({model: PTO.messageModel});
				PTO.messageXView.render();
			};



			PTO.appContainerView = new PTO.Views.AppContainer({model: PTO.currentUserModel});
			
			//Requests
			PTO.requestModel = new PTO.Models.Request();
			PTO.newRequestView = new PTO.Views.NewRequest({model: PTO.requestModel});
			//PTO.requestView = new PTO.Views.Request({model: PTO.requestModel});
			PTO.requestCollection = new PTO.Collections.RequestCollection();
			PTO.deleteRequestView = new PTO.Views.DeleteRequest();

			//Employee Requests
			PTO.employeeRequestCollection = new PTO.Collections.EmployeeRequestCollection();
			PTO.employeeRequestsToolbar = new PTO.Views.EmployeeRequestsToolbar({collection: PTO.employeeRequestCollection});

			//Accounts
			PTO.accountModel = new PTO.Models.Account();
			PTO.newAccountView = new PTO.Views.Account({model: PTO.accountModel});
			PTO.changePasswordView = new PTO.Views.ChangePassword({model: PTO.accountModel});
			
			//Holidays
			PTO.holidayCollection = new PTO.Collections.HolidayCollection();
			
			//Login 
			PTO.loginEmail$ = $('#loginEmail');
			PTO.loginPassword$ = $('#loginPassword');
			PTO.loginRemember$ = $('#loginRemember');

			//Nav
			//accountNavbarlist
			PTO.accountNavListView = new PTO.Views.AccountNavlist(); 
			PTO.accountNavbarlist$ = $('#accountNavbarlist');
			PTO.accountForm$ = $('#accountForm');
			PTO.securityForm$ = $('#securityForm');

			PTO.clearSecurityInputFields = function(jQueryFormRef) {
				jQueryFormRef.find('input[type=password]').each(function() {
					$(this).val("");
				});
			};

			PTO.navListView = new PTO.Views.Navlist();
			PTO.navbarlist$ = $('#navbarlist');
			PTO.dayName$ = $('#dayName');
			PTO.requestDateInput$ = $('#requestDate');
			PTO.pendingRequestsMessage$ = $('#pendingRequestsMessage');
			PTO.employeeRequestsMessage$ = $('#employeeRequestsMessage');
			PTO.employeeRequestsAcceptAllBtnContainer$ = $('#employeeRequestsAcceptAllBtnContainer');

			PTO.collapseContainer$ = $('#collapseContainer');
			PTO.currentUserMsg$ = $('#currentUserMsg');
			//PTO.messageContainer$ = $('#messageContainer');
		}, //end - initialize().

		accountNavigate: function(where) {

			switch(where) {
				case "personalInfo" :
				PTO.securityForm$.addClass('hidden');
				PTO.accountForm$.removeClass('hidden');
				PTO.accountNavbarlist$.find('li.securityNav').removeClass('active');
				PTO.accountNavbarlist$.find('li.personalInfoNav').addClass('active');
				break;



				case "security" :
				PTO.clearSecurityInputFields(PTO.securityForm$);
				PTO.accountForm$.addClass('hidden');
				PTO.securityForm$.removeClass('hidden');
				PTO.accountNavbarlist$.find('li.personalInfoNav').removeClass('active');
				PTO.accountNavbarlist$.find('li.securityNav').addClass('active');
				break;
			} //end - switch(where).
		},



		navigate: function(where) {
			switch(where) {
				// case "resetPassword" :
				// if (PTO.currentUserModel.get('userName') !== null) {
				// 	PTO.appContainerView.$el.find('.account').addClass('hidden');
				// 	PTO.appContainerView.$el.find('.pendingRequests').addClass('hidden');
				// 	PTO.appContainerView.$el.find('.employeeRequests').addClass('hidden');
				// 	PTO.appContainerView.$el.find('.newRequest').addClass('hidden');

				// 	PTO.appContainerView.$el.find('.resetPassword').removeClass('hidden');
				// 	PTO.navbarlist$.find('li.resetPassword').addClass('active');
				// 	PTO.navbarlist$.find('li.resetPassword').siblings().removeClass('active');
				// 	//Try to get nav to collapse
				// 	PTO.collapseContainer$.removeClass('in');
				// 	PTO.collapseContainer$.addClass('collapse');

				// }
				// break;
			


				case "newRequest" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.account').addClass('hidden');
					PTO.appContainerView.$el.find('.pendingRequests').addClass('hidden');
					PTO.appContainerView.$el.find('.employeeRequests').addClass('hidden');
					PTO.appContainerView.$el.find('.changePassword').addClass('hidden');

					PTO.appContainerView.$el.find('.newRequest').removeClass('hidden');
					PTO.navbarlist$.find('li.newRequestNav').addClass('active');
					PTO.navbarlist$.find('li.newRequestNav').siblings().removeClass('active');
					//Try to get nav to collapse
					PTO.collapseContainer$.removeClass('in');
					PTO.collapseContainer$.addClass('collapse');
				}
				break;



				case "account" :
				if (PTO.currentUserModel.get('userName') !== null) {
					//Get user account info.
					PTO.accountModel.set({id: PTO.currentUserModel.get('ID')}).fetch({
						success: function(model, response) {
							PTO.newAccountView.render();

							PTO.appContainerView.$el.find('.newRequest').addClass('hidden');
							PTO.appContainerView.$el.find('.pendingRequests').addClass('hidden');
							PTO.appContainerView.$el.find('.employeeRequests').addClass('hidden');
							PTO.appContainerView.$el.find('.changePassword').addClass('hidden');

							PTO.appContainerView.$el.find('.account').removeClass('hidden');
							PTO.navbarlist$.find('li.accountNav').addClass('active');
							PTO.navbarlist$.find('li.accountNav').siblings().removeClass('active');
							//Try to get nav to collapse
							PTO.collapseContainer$.removeClass('in');
							PTO.collapseContainer$.addClass('collapse');

							PTO.securityForm$.addClass('hidden');
							PTO.accountForm$.removeClass('hidden');
							PTO.accountNavbarlist$.find('li.securityNav').removeClass('active');
							PTO.accountNavbarlist$.find('li.personalInfoNav').addClass('active');
						}
					});
				} //end - if (PTO.currentUserModel.get('userName') !== null).
				break;



				case "pendingRequests" :
				if (PTO.currentUserModel.get('userName') !== null) {
					//Get user account info.
					PTO.accountModel.set({id: PTO.currentUserModel.get('ID')}).fetch({
						success: function(model, response) {
							PTO.requestCollection.fetch({
								success: function(theCollection) {
									if (theCollection.length == 0) {
										PTO.pendingRequestsMessage$.show();
									} else {
										PTO.pendingRequestsMessage$.hide();
									}
									//PTO.pendingRequestsMessage$
									PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: PTO.requestCollection});
									PTO.requestCollectionView.render();
								}
							}); //end - PTO.userCollection.fetch();

							PTO.appContainerView.$el.find('.newRequest').addClass('hidden');
							PTO.appContainerView.$el.find('.account').addClass('hidden');
							PTO.appContainerView.$el.find('.employeeRequests').addClass('hidden');
							PTO.appContainerView.$el.find('.changePassword').addClass('hidden');

							PTO.appContainerView.$el.find('.pendingRequests').removeClass('hidden');
							PTO.navbarlist$.find('li.pendingRequestsNav').addClass('active');
							PTO.navbarlist$.find('li.pendingRequestsNav').siblings().removeClass('active');
							//Try to get nav to collapse
							PTO.collapseContainer$.removeClass('in');
							PTO.collapseContainer$.addClass('collapse');
						} //end - success().
					});
				} //end - if (PTO.currentUserModel.get('userName') !== null).
				break;



				case "employeeRequests" :
				if (PTO.currentUserModel.get('userName') !== null) {
					//Get user account info.
					PTO.accountModel.set({id: PTO.currentUserModel.get('ID')}).fetch({
						success: function(model, response) {
							PTO.employeeRequestCollection.fetch({
								success: function(theCollection) {
									if (theCollection.length == 0) {
										PTO.employeeRequestsMessage$.show();
										PTO.employeeRequestsAcceptAllBtnContainer$.hide();
									} else {
										PTO.employeeRequestsMessage$.hide();
										PTO.employeeRequestsAcceptAllBtnContainer$.show();
									}
									PTO.employeeRequestCollectionView = new PTO.Views.EmployeeRequestCollectionView({collection: theCollection});
									PTO.employeeRequestCollectionView.render();
								}
							}); //end - PTO.userCollection.fetch();

							PTO.appContainerView.$el.find('.newRequest').addClass('hidden');
							PTO.appContainerView.$el.find('.account').addClass('hidden');
							PTO.appContainerView.$el.find('.pendingRequests').addClass('hidden');
							PTO.appContainerView.$el.find('.changePassword').addClass('hidden');

							PTO.appContainerView.$el.find('.employeeRequests').removeClass('hidden');
							PTO.navbarlist$.find('li.employeeRequestsNav').addClass('active');
							PTO.navbarlist$.find('li.employeeRequestsNav').siblings().removeClass('active');
							//Try to get nav to collapse
							PTO.collapseContainer$.removeClass('in');
							PTO.collapseContainer$.addClass('collapse');
						} //end - success().
					});
				} //end - if (PTO.currentUserModel.get('userName') !== null).
				break;

			} //end - switch(where).
		} //end - navigate().
	});//end - PTO.Views.App().

	//Don't like using hash navigation.
	//#accountNavbarlist
	PTO.Views.AccountNavlist = Backbone.View.extend({
		el: '#accountNavbarlist',

		events: {
			'click .personalInfoNav' : 'personalInfo',
			'click .securityNav' : 'security'
		},

		personalInfo: function(e) {
			e.preventDefault();
			PTO.vent.trigger('accountNavigate', 'personalInfo');
		},

		security: function(e) {
			e.preventDefault();
			PTO.vent.trigger('accountNavigate', 'security');
		}
	});//end - PTO.Views.AccountNavlist.


	PTO.Views.Navlist = Backbone.View.extend({
		el: '#navbarlist',

		events: {
			'click .newRequestNav' : 'newRequest',
			'click .resetPasswordNav' : 'resetPassword',
			'click .accountNav' : 'account',
			'click .pendingRequestsNav' : 'pendingRequests',
			'click .employeeRequestsNav' : 'employeeRequests'
		},

		resetPassword: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'resetPassword');
		},

		newRequest: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'newRequest');
		},

		account: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'account');
		},

		pendingRequests: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'pendingRequests');
		},

		employeeRequests: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'employeeRequests');
		}
	});





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

		currentUserBelongsTo: function(parmObj, successCallBkFn) {
			this.save({}, {
				data: JSON.stringify({groupName: parmObj.groupName}),
				url: "rest/User/currentUserBelongsTo/?$top=40&$method=entityset&$timeout=300",
				success: successCallBkFn
			}); //end this.save();
		}, //end - currentUserBelongsTo().

		loginByPassword: function(credentialsObj, successCallBkFn) {
			this.save({}, {
				data: JSON.stringify({email: credentialsObj.email, password: credentialsObj.password}),
				url: "rest/User/login/?$top=40&$method=entityset&$timeout=300",
				
				//success: successCallBkFn

				success: function(model, response) {
					if (PTO.loginRemember$.prop("checked") ) {
						//console.log('remember me');
						// set cookies to expire in 14 days
						$.cookie('loginEmail', PTO.loginEmail$.val(), { expires: 30 });
						$.cookie('loginPassword', PTO.loginPassword$.val(), { expires: 30 });
						$.cookie('loginRemember', true, { expires: 30 });

					} else {
						//console.log('forget me');
						$.cookie('loginEmail', null);
						$.cookie('loginPassword', null);
						$.cookie('loginRemember', null);
					}

					model.fetch({success: function(model) {
						if (model.get('fullName') !== null) {
							//PTO.messageModel.set({title: model.get('fullName') + " successfully signed in.", contextualClass: "alert-info"});
							PTO.navbarlist$.find('li.newRequestNav').addClass('active');
							PTO.currentUserMsg$.text("Signed in as " + model.get('fullName'));

							PTO.setCalendar(PTO.requestDateInput$, PTO.dayName$, moment());
							PTO.newRequestView.$el.find('#requestHours').val(8);

							PTO.appContainerView.$el.find('.account').addClass('hidden');
							PTO.appContainerView.$el.find('.pendingRequests').addClass('hidden');
							PTO.appContainerView.$el.find('.employeeRequests').addClass('hidden');

							PTO.appContainerView.$el.find('.newRequest').removeClass('hidden');

							PTO.navbarlist$.find('li.newRequestNav').addClass('active');
							PTO.navbarlist$.find('li.newRequestNav').siblings().removeClass('active');

							model.currentUserBelongsTo({groupName: "Manager"}, function(model, response) {
								if (!response.result) {
									//Not a manager.
									PTO.navListView.$el.find('.employeeRequestsNav').hide();
								} else {
									PTO.navListView.$el.find('.employeeRequestsNav').show();
								}
							});

						} else {
							//PTO.messageModel.set({title: "We could not sign you in.", contextualClass: "alert-danger"});
							PTO.setMessage({title: "We could not sign you in.", contextualClass: "alert-danger"});
						}
					}}); 
				}
			}); //end - this.save().
		} //end - loginByPassword().
	}); //end - PTO.Models.CurrentUser().

	PTO.Views.CurrentUserLogout = Backbone.View.extend({
		el: '#logoutContainer',

		initialize: function() {
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
		},

		events: {
			'submit .logout' : 'logoutUser'
		}, //end - events.

		logoutUser: function(e) {
			e.preventDefault();
			//PTO.messageContainer$.children().remove();
			this.model.logout();
			//Try to get nav to collapse
			PTO.collapseContainer$.removeClass('in');
			PTO.collapseContainer$.addClass('collapse');
		}

	});

	PTO.Views.CurrentUser = Backbone.View.extend({
		el: '#loginContainer',

		initialize: function() {
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
		},

		events: {
			'submit .login' : 'loginUser',
			// 'submit .logout' : 'logoutUser'
		}, //end - events.

		loginUser: function(e) {
			e.preventDefault();

			this.model.loginByPassword({email: this.$el.find('#loginEmail').val(), 
				password: this.$el.find('#loginPassword').val()
			});

			// this.model.currentUserBelongsTo({groupName: "Manager"}, function(model, response) {
			// 	console.log(response);
			// });
		},

		render: function() {
			return this; //So we can chain our render() method.
		} //end - render().
	}); //end - PTO.Views.CurrentUser().





	//Account Model.
	PTO.Models.Account = Backbone.Model.extend({
		defaults: {
			id: null,
			fullName: null,
			ptoHours: 0,
			floatingDays: 0,
			compDays: 0,
			role: ''
		},

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
	            if (!options.urlFlag === "changePassword") {
	            	options.url = "/rest/User/?$method=update";
	                var wakandaquestPayload = {};
	                wakandaquestPayload.__ENTITIES = [];
	                wakandaquestPayload.__ENTITIES.push(this.attributes);
	                options.data = JSON.stringify(wakandaquestPayload);
	            }
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
		}, //end - sync().

		changePassword: function(parmObj, successCallBkFn) {
			this.save({}, {
				data: JSON.stringify({currentPassword: parmObj.currentPassword, newPassword: parmObj.newPassword, confirmNewPassword: parmObj.confirmNewPassword}),
				url: "rest/User/changePassword/?$top=40&$method=entityset&$timeout=300",
				success: successCallBkFn,
				urlFlag: "changePassword"
			}); //end this.save();
		} //end - changeUser().
	}); //end - PTO.Models.Account().

	PTO.Views.ChangePassword = Backbone.View.extend({
		el: '#changePasswordContainer',

		events: {
			'submit .changePassword' : 'changePassword'
		}, //end - events.

		changePassword: function(e) {
			e.preventDefault();
			this.model.changePassword(
			{
				currentPassword: this.$el.find('#currentPassword').val(), 
				newPassword: this.$el.find('#newPassword').val(), 
				confirmNewPassword: this.$el.find('#confirmNewPassword').val()
			}, function(model, response) {
				PTO.setMessage({title: response.result.message, contextualClass: "alert-info"});
				if (response.result.error === 900) {
					PTO.clearSecurityInputFields(PTO.securityForm$);
				}
			});
		}

	});

	PTO.Views.Account = Backbone.View.extend({
			el: '#accountForm', 

			// initialize: function() {
			// 	this.model.on('change', this.render, this); //change:title, destroy, add, etc.
			// },

			render: function() {
				this.$el.find('#accountName').val(this.model.get('fullName'));
				this.$el.find('#ptoHours').val(this.model.get('ptoHours'));
				this.$el.find('#floatingDays').val(this.model.get('floatingDays'));
				this.$el.find('#compDays').val(this.model.get('compDays'));
				if (this.model.get('myManager')) {
					this.$el.find('#myManager').val(this.model.get('myManager').fullName);
				}
				

				return this; //this allows us to chain.
			}  //end - render().
	}); //end - PTO.Views.Message().





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
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
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
	            // delete(model.attributes.uri);
             	// options.url = "/rest/Request(" + this.get('id') + ")/?$method=update";
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
		tagName: 'li',

		attributes: {
			class: 'list-group-item pendingRequestListItem' 
		},

		events: {
			"click button.delete"	: "deleteRequest",
		},

		deleteRequest: function() {
			this.model.fetch({
				success: function(model, response) {
					PTO.deleteRequestView.model = model;
					PTO.deleteRequestView.render(); 
				}
			}); 
		}, //end - editUser().

		template: PTO.Utility.template('pending-requests-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this; //this allows us to chain.
		}
	});

	PTO.Views.DeleteRequest = Backbone.View.extend({
		el: '#delRequestModalWin',

		events: {
			"click button.withdraw"	: "withdrawRequest",
		}, //end - events.

		withdrawRequest : function() {
			this.model.destroy({
				success: function(model, response) {
					if (response.ok) {
						PTO.requestCollection.fetch({
							success: function(theCollection) {
								//PTO.messageModel.set({title: "Request " + model.get('id') + " on date " + model.get('dateString') + " was withdrawn.", contextualClass: "alert-info"});
								PTO.setMessage({title: "Request " + model.get('id') + " on date " + model.get('dateString') + " was withdrawn.", contextualClass: "alert-info"});
								PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: PTO.requestCollection});
								PTO.requestCollectionView.render();
							}
						}); //end - PTO.userCollection.fetch();
					}
				}
			});
		}, //end - deleteRequest().

		render: function() {
			this.$el.find('p.requestId').html(this.model.get('id'));
			this.$el.find('p.requestDate').html(this.model.get('dateString'));
			this.$el.find('p.requestStatus').html(this.model.get('status'));
			this.$el.find('p.requestHours').html(this.model.get('hours') + " " + this.model.get('compensation'));

			return this; 
		}  //end - render().
	}); //end - PTO.Views.DeleteRequest().

	PTO.Collections.RequestCollection = Backbone.Collection.extend({
		model: PTO.Models.Request,

		url: function() {
			var requestConfigObj = {};
			requestConfigObj.dataClass = "Request";
			requestConfigObj.top = 40;
			requestConfigObj.filter = "dateRequested > :1 && owner.id == :2";
			requestConfigObj.timeout = 300;

			return PTO.wakandaQueryURLString(requestConfigObj, moment().subtract('days', 1).format(), PTO.currentUserModel.get('ID'));
			//return "/rest/Request/?$top=40&$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'";
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
		el: '#pendingRequestsUL',

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

	PTO.Views.NewRequest = Backbone.View.extend({
		el: '#newRequestForm',

		events: {
			"click button.newRequest"	: "newRequest",
		},

		newRequest: function(ev) {
			ev.preventDefault(); //Don't let this button submit the form.
			var that = this;

			this.model.set({
				compensation: 	this.$el.find('#requestCompensation').val(),
				dateString: 	this.$el.find('#requestDate').val(),
				hours: 			this.$el.find('#requestHours').val(),
				__ISNEW: true
			}, 

			{validate: true}).save({},{
				error: function(model, xhr, options) {
					// console.log(xhr.responseJSON.__ENTITIES[0].__ERROR[0].message);
					// console.log(xhr.responseJSON.__ENTITIES[0].__ERROR[0].errCode);
					/*
					PTO.messageModel.set({
						title: xhr.responseJSON.__ENTITIES[0].__ERROR[0].message,
						contextualClass: "alert-danger"
					});
					*/
					PTO.setMessage({
						title: xhr.responseJSON.__ENTITIES[0].__ERROR[0].message,
						contextualClass: "alert-danger"
					});
				},

				success: function(ev) {
					PTO.setMessage({title: "Request for " + moment(ev.get('dateString')).format('dddd') + " " + ev.get('dateString') + " submitted.", contextualClass: "alert-info"});

					PTO.requestModel = new PTO.Models.Request();
					PTO.newRequestView.model = PTO.requestModel;

					//reset our date picker.
					var	currentDayMoment = 	moment(PTO.requestDateInput$.val());
					currentDayMoment.add('days', 1);
					PTO.setCalendar(PTO.requestDateInput$, PTO.dayName$, currentDayMoment);
				} //end - success().
			});
		}
	}); //end - PTO.Views.NewRequest();



	PTO.Views.EmployeeRequestsToolbar = Backbone.View.extend({
		el: '#employeeRequestsToolBar',

		events: {
			"click button.acceptAllRequests"	: "acceptAllRequests"
		},

		acceptAllRequests: function() {
			this.collection.acceptAllRequests(function(model, response, options) {
				//PTO.employeeRequestCollectionView = new PTO.Views.EmployeeRequestCollectionView({collection: theCollection});
				//PTO.employeeRequestCollectionView.render();
				console.log('accept all requests success.');

				PTO.employeeRequestCollection.fetch({
					success: function(theCollection) {
						PTO.employeeRequestCollection.fetch({
							success: function(theCollection) {
								if (theCollection.length == 0) {
									PTO.employeeRequestsMessage$.show();
									PTO.employeeRequestsAcceptAllBtnContainer$.hide();
								} else {
									PTO.employeeRequestsMessage$.hide();
									PTO.employeeRequestsAcceptAllBtnContainer$.show();
								}
								//PTO.setMessage({title: "All requests have been accepted and the server updated.", contextualClass: "alert-info"});
								PTO.employeeRequestCollectionView = new PTO.Views.EmployeeRequestCollectionView({collection: theCollection});
								PTO.employeeRequestCollectionView.render();
							}
						}); //end - PTO.userCollection.fetch();
						// console.log('fetch the employee request collection.');
						// console.log(theCollection);
						// PTO.employeeRequestCollectionView = new PTO.Views.EmployeeRequestCollectionView({collection: theCollection});
						// PTO.employeeRequestCollectionView.render();
					}
				}); //end - PTO.userCollection.fetch();
			});
		} //end - newUser().
	}); //end - PTO.Views.UserToolbar().


	PTO.Views.EmployeeRequest = Backbone.View.extend({
		tagName: 'li',

		attributes: {
			class: 'list-group-item employeeRequestListItem' //
		},

		events: {
			"click button.accept"	: "acceptRequest",
			"click button.reject"	: "rejectRequest"
		}, //end - events.

		rejectRequest : function() {
			/**/
			this.model.save({status: "Rejected"}, {
				success: function(model, response) {
					PTO.employeeRequestCollection.fetch({
						success: function(theCollection) {
							//PTO.messageModel.set({title: "Request for " + model.get('ownerName') + " on " + model.get('dateString') + " updated on server.", contextualClass: "alert-info"});
							PTO.setMessage({title: "Request for " + model.get('ownerName') + " on " + model.get('dateString') + " updated on server.", contextualClass: "alert-info"});
							PTO.employeeRequestCollectionView = new PTO.Views.EmployeeRequestCollectionView({collection: theCollection});
							PTO.employeeRequestCollectionView.render();
						}
					}); //end - PTO.userCollection.fetch();
				}
			});
			
		},

		acceptRequest : function() {

			/**/
			this.model.save({status: "Accepted"}, {
				success: function(model, response) {
					PTO.employeeRequestCollection.fetch({
						success: function(theCollection) {
							//PTO.messageModel.set({title: "Request for " + model.get('ownerName') + " on " + model.get('dateString') + " updated on server.", contextualClass: "alert-info"});
							PTO.setMessage({title: "Request for " + model.get('ownerName') + " on " + model.get('dateString') + " updated on server.", contextualClass: "alert-info"});
							PTO.employeeRequestCollectionView = new PTO.Views.EmployeeRequestCollectionView({collection: theCollection});
							PTO.employeeRequestCollectionView.render();
						}
					}); //end - PTO.userCollection.fetch();
				}
			});
			
			
		}, //end - acceptRequest().



		template: PTO.Utility.template('employee-requests-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this; //this allows us to chain.
		}
	});

	PTO.Collections.EmployeeRequestCollection = Backbone.Collection.extend({
		model: PTO.Models.Request,

		entitySetId: null,
		
		parse: function(response) {
			//set entity set id
			if (response.__ENTITYSET) {
				var entitySetStr = response.__ENTITYSET,
					tokens = entitySetStr.split("/");

				this.entitySetId = 	tokens[4];
			}

			if (response.__ENTITIES) {
				return response.__ENTITIES;
			} else {
				return response;
			}
		}, //end - parse.

		sync: function(method, model, options) {
			options || (options = {});

			switch (method) {
				case "read":

				if (!options.url) {
					var requestConfigObj = {};
					requestConfigObj.dataClass = "Request";
					requestConfigObj.top = 40;
					requestConfigObj.filter = "dateRequested > :1 && owner.myManager.id == :2  && status == :3";
					requestConfigObj.timeout = 300;

					options.url =  PTO.wakandaQueryURLString(requestConfigObj, moment().subtract('days', 1).format(), PTO.currentUserModel.get('ID'), "pending");
				}
	            break;


			}; //end - switch(method);

			if (options.url) {
				return Backbone.sync.call(model, method, model, options); //first parameter sets the context.
			}; //end - if (options.url).
		}, //end - sync().

		

		acceptAllRequests: function(successCallBkFn) {
			this.fetch({
				url: "rest/Request/$entityset/" + this.entitySetId + "/acceptAllRequests/?$top=40&$method=entityset&$timeout=300",
				success: successCallBkFn()
			}); //end this.save();
		} //end - acceptAllRequests().
	}); //PTO.Collections.RequestCollection().

	PTO.Views.EmployeeRequestCollectionView = Backbone.View.extend({
		el: '#employeeRequestsUL',

		render: function() {
			this.$el.empty();

			//1. filter through all items in a collection.
			this.collection.each(function(request) {
				//2. For each item create a new person view.
				var requestView = new PTO.Views.EmployeeRequest({model: request});
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


	if ($.cookie('loginRemember') === "true") {
		PTO.loginEmail$.val($.cookie('loginEmail'));
		PTO.loginPassword$.val($.cookie('loginPassword'));
		PTO.loginRemember$.prop('checked', true);
	} 

	//new PTO.Router(); //Create an instance of our router.
	//Backbone.history.start(); //Tell Backbone to start monitoring hash change events in the browser.

}); //end - $( document ).ready(function().

