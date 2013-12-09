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
			
			//Holidays
			PTO.holidayCollection = new PTO.Collections.HolidayCollection();
			

			//Nav
			PTO.navListView = new PTO.Views.Navlist();

			PTO.navbarlist$ = $('#navbarlist');
			PTO.dayName$ = $('#dayName');
			PTO.collapseContainer$ = $('#collapseContainer');
			PTO.currentUserMsg$ = $('#currentUserMsg');
			//PTO.messageContainer$ = $('#messageContainer');
		}, //end - initialize().

		navigate: function(where) {
			switch(where) {
			
				case "newRequest" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.account').addClass('hidden');
					PTO.appContainerView.$el.find('.pendingRequests').addClass('hidden');
					PTO.appContainerView.$el.find('.employeeRequests').addClass('hidden');

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

							PTO.appContainerView.$el.find('.account').removeClass('hidden');
							PTO.navbarlist$.find('li.accountNav').addClass('active');
							PTO.navbarlist$.find('li.accountNav').siblings().removeClass('active');
							//Try to get nav to collapse
							PTO.collapseContainer$.removeClass('in');
							PTO.collapseContainer$.addClass('collapse');
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
									PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: PTO.requestCollection});
									PTO.requestCollectionView.render();
								}
							}); //end - PTO.userCollection.fetch();

							PTO.appContainerView.$el.find('.newRequest').addClass('hidden');
							PTO.appContainerView.$el.find('.account').addClass('hidden');
							PTO.appContainerView.$el.find('.employeeRequests').addClass('hidden');

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
									PTO.employeeRequestCollectionView = new PTO.Views.EmployeeRequestCollectionView({collection: theCollection});
									PTO.employeeRequestCollectionView.render();
								}
							}); //end - PTO.userCollection.fetch();

							PTO.appContainerView.$el.find('.newRequest').addClass('hidden');
							PTO.appContainerView.$el.find('.account').addClass('hidden');
							PTO.appContainerView.$el.find('.pendingRequests').addClass('hidden');

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
	PTO.Views.Navlist = Backbone.View.extend({
		el: '#navbarlist',

		events: {
			'click .newRequestNav' : 'newRequest',
			'click .accountNav' : 'account',
			'click .pendingRequestsNav' : 'pendingRequests',
			'click .employeeRequestsNav' : 'employeeRequests'
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
		}, //end - currentUserBelongsTo().,

		loginByPassword: function(credentialsObj, successCallBkFn) {
			this.save({}, {
				data: JSON.stringify({email: credentialsObj.email, password: credentialsObj.password}),
				url: "rest/User/login/?$top=40&$method=entityset&$timeout=300",
				
				//success: successCallBkFn

				success: function(model, response) {
					model.fetch({success: function(model) {
						if (model.get('fullName') !== null) {
							//PTO.messageModel.set({title: model.get('fullName') + " successfully signed in.", contextualClass: "alert-info"});
							PTO.navbarlist$.find('li.newRequestNav').addClass('active');
							PTO.currentUserMsg$.text("Signed in as " + model.get('fullName'));

							//Set Calendar Start
							PTO.holidayCollection.fetch({
								success: function(theHolidayCollection) {
									PTO.requestCollection.fetch({
										success: function(theRequestCollection) {
											var holidaysArr = theHolidayCollection.toJSON().map(function(oneDay) {return oneDay.dateString;});
											var requestsArr = theRequestCollection.toJSON().map(function(oneDay) {return oneDay.dateString;});
											
											$( "#requestDate" ).datepicker({
												// beforeShowDay: $.datepicker.noWeekends,
												beforeShowDay: function(date){
											       	var holidayDateString = jQuery.datepicker.formatDate('mm/dd/yy', date);

											        if ((date.getDay() === 6) || (date.getDay() === 0)) {
											        	//Weekends are not selectable.
											        	return [false];

											        } else if (holidaysArr.indexOf(holidayDateString) !== -1) {
											        	//Neither are holidays.
											        	return [false, 'holiday'];	

				 									} else if (requestsArr.indexOf(holidayDateString) !== -1) {
											        	//Neither are holidays.
											        	return [false, 'vacation'];	

											        } else {
											        	return [true];
											        }

									        		//return [holidaysArr.indexOf(holidayDateString) == -1];
											    },

												onSelect: function(dateSelectedStr, datePickerObj) {
													PTO.dayName$.html(moment(dateSelectedStr).format('dddd'));
												}
											}); //end - $( "#requestDate" ).datepicker().


											//Skip holidays, weekends, and current requests.
											var keepLooking = true;
											var currentDayMoment = moment();
											
											while (keepLooking) {
										  		if (holidaysArr.indexOf(currentDayMoment.format("MM/DD/YYYY")) !== -1) {
													currentDayMoment.add('days', 1);

												} else if (requestsArr.indexOf(currentDayMoment.format("MM/DD/YYYY")) !== -1) {
													currentDayMoment.add('days', 1);

												} else if (currentDayMoment.day() == 5) {
													currentDayMoment.add('days', 2);

												} else if (currentDayMoment.day() == 0) {
													currentDayMoment.add('days', 1);

												} else {
													keepLooking = false;
												}
										  	} //end while()

											PTO.newRequestView.$el.find('#requestDate').val(currentDayMoment.format("MM/DD/YYYY"));
											PTO.dayName$.html(currentDayMoment.format('dddd'));

										}
									});
					
								} //end - success().
							}); //end - PTO.userCollection.fetch();
							//Set Calendar End

							//set new request form defaults.//moment().format("MM/DD/YYYY")
							//Need to make this a function. Refactor.
							//set date to next day.
							//var currentDayMoment = moment();
							//Skip Saturday and Sunday.
							//var daysToAdd
							// if (currentDayMoment.day() == 0) {
							// 	daysToAdd = 1;
							// } else if (currentDayMoment.day() == 6) {
							// 	daysToAdd = 2;
							// } else {
							// 	//daysToAdd = 1;
							// }

							//currentDayMoment.add('days', daysToAdd);




							// PTO.newRequestView.$el.find('#requestDate').val(moment().format("MM/DD/YYYY"));
							// PTO.dayName$.html(moment().format('dddd'));

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
	            options.url = "/rest/User/?$method=update";
	            //delete(model.attributes.uri);
             	//options.url = "/rest/Request(" + this.get('id') + ")/?$method=update";
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
	}); //end - PTO.Models.Account().

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
				this.$el.find('#myManager').val(this.model.get('myManager').fullName);

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
			this.$el.find('p.requestHours').html(this.model.get('hours'));

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

					//Need to make this a function. Refactor.
					//set date to next day.
					var requestDateInput$ = that.$el.find('#requestDate'),
						currentDayMoment = moment(requestDateInput$.val()),
						holidaysArr = PTO.holidayCollection.toJSON().map(function(oneDay) {return oneDay.dateString;}),
						requestArr = PTO.requestCollection.toJSON().map(function(oneDay) {return oneDay.dateString;});


					//Skip holidays, weekends, and current requests.
					var keepLooking = true;
					currentDayMoment.add('days', 1);
					while (keepLooking) {
				  		if (holidaysArr.indexOf(currentDayMoment.format("MM/DD/YYYY")) !== -1) {
							currentDayMoment.add('days', 1);

						} else if (requestArr.indexOf(currentDayMoment.format("MM/DD/YYYY")) !== -1) {
							currentDayMoment.add('days', 1);

						} else if (currentDayMoment.day() == 6) {
							currentDayMoment.add('days', 2);

						} else if (currentDayMoment.day() == 0) {
							currentDayMoment.add('days', 1);

						} else {
							keepLooking = false;
						}
				  	} //end while()

					requestDateInput$.val(currentDayMoment.format("MM/DD/YYYY"));
					PTO.dayName$.html(currentDayMoment.format('dddd'));
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
				PTO.employeeRequestCollectionView.render();
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

	//new PTO.Router(); //Create an instance of our router.
	//Backbone.history.start(); //Tell Backbone to start monitoring hash change events in the browser.

}); //end - $( document ).ready(function().

