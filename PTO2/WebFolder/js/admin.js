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


			//Request Grid Message.
			PTO.requestGridMessage = new PTO.Models.RequestGridMessage();
			PTO.requestGridMessageView = new PTO.Views.RequestGridMessage({model: PTO.requestGridMessage});

			//Log Grid Message.
			PTO.logGridMessage = new PTO.Models.LogGridMessage();
			PTO.logGridMessageView = new PTO.Views.LogGridMessage({model: PTO.logGridMessage});


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

			//Log
			PTO.logCollection = new PTO.Collections.LogCollection();

			PTO.navbarlist$ = $('#navbarlist');
			PTO.messageContainer$ = $('#messageContainer');
			PTO.currentUserMsg$ = $('#currentUserMsg');

			PTO.userToolBar = new PTO.Views.UserToolbar();
			PTO.requestToolBar = new PTO.Views.RequestToolBar();
			PTO.requestToolbarPaging = new PTO.Views.RequestToolbarPaging({collection: PTO.requestCollection});
			PTO.logToolBar = new PTO.Views.LogToolBar();
			PTO.logToolbarPaging = new PTO.Views.LogToolbarPaging({collection: PTO.logCollection});

			$('#requestStart').datepicker({});
			$('#requestEnd').datepicker({});

			$('#logStart').datepicker({});
			$('#logEnd').datepicker({});

			PTO.holidayToolBar = new PTO.Views.HolidayToolbar();

			PTO.editUserView = new PTO.Views.EditUser();
			PTO.editHolidayView = new PTO.Views.EditHoliday();
			PTO.viewDetailLogView = new PTO.Views.ViewLogDetail(); //yes my naming convention broke down here. :-)

			PTO.userCollection = new PTO.Collections.UserCollection();
			
			PTO.logCollection.fetch({
				success: function(theCollection) {
					PTO.logCollectionView = new PTO.Views.LogCollectionView({collection: PTO.logCollection});
					PTO.logCollectionView.render();
				}
			}); //end - PTO.logCollection.fetch();
			

			PTO.holidayCollection = new PTO.Collections.HolidayCollection();
			PTO.holidayCollection.fetch({
				success: function(theCollection) {
					$( "#holidayDateString" ).datepicker({});

					PTO.holidayCollectionView = new PTO.Views.HolidayCollectionView({collection: PTO.holidayCollection});
					PTO.holidayCollectionView.render();
				}
			}); //end - PTO.holidayCollection.fetch();
			
		}, //end - initialize().

		navigate: function(where) {
			switch(where) {

				case "log" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.requests').addClass('hidden');
					PTO.appContainerView.$el.find('.users').addClass('hidden');
					PTO.appContainerView.$el.find('.holidays').addClass('hidden');
					
					PTO.appContainerView.$el.find('.log').removeClass('hidden');
					PTO.navbarlist$.find('li.log').addClass('active');
					PTO.navbarlist$.find('li.log').siblings().removeClass('active');
				}
				break;

			
				case "holidays" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.requests').addClass('hidden');
					PTO.appContainerView.$el.find('.users').addClass('hidden');
					PTO.appContainerView.$el.find('.log').addClass('hidden');

					PTO.appContainerView.$el.find('.holidays').removeClass('hidden');
					PTO.navbarlist$.find('li.holidays').addClass('active');
					PTO.navbarlist$.find('li.holidays').siblings().removeClass('active');
				}
				break;

				case "users" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.requests').addClass('hidden');
					PTO.appContainerView.$el.find('.holidays').addClass('hidden');
					PTO.appContainerView.$el.find('.log').addClass('hidden');

					PTO.appContainerView.$el.find('.users').removeClass('hidden');
					PTO.navbarlist$.find('li.users').addClass('active');
					PTO.navbarlist$.find('li.users').siblings().removeClass('active');
				} 
				break;

				case "requests" :
				if (PTO.currentUserModel.get('userName') !== null) {
					PTO.appContainerView.$el.find('.users').addClass('hidden');
					PTO.appContainerView.$el.find('.holidays').addClass('hidden');
					PTO.appContainerView.$el.find('.log').addClass('hidden');

					PTO.appContainerView.$el.find('.requests').removeClass('hidden');
					PTO.navbarlist$.find('li.requests').addClass('active');
					PTO.navbarlist$.find('li.requests').siblings().removeClass('active');

					PTO.requestCollection.fetch({
						success: function(theCollection) {
							//PTO.pagingButtonSetDisabled(theCollection, $('#requestTable').find('button.prevRequests'), "prev");
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
			'click .requests' : 'requests',
			'click .log' : 'log'
		},

		log: function(e) {
			e.preventDefault();
			PTO.vent.trigger('navigate', 'log');
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




	//Request Grid Message Model.
	PTO.Models.RequestGridMessage = Backbone.Model.extend({
		defaults: {
			title: ''
		}
	}); //end - PTO.Models.RequestGridMessage().

	PTO.Views.RequestGridMessage = Backbone.View.extend({
		el: '#requestGridMessage', 

		initialize: function() {
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
		},

		template: PTO.Utility.template('request-grid-message-template'),

		render: function() {
			this.$el.text(this.template(this.model.toJSON())); 
			return this; //this allows us to chain.
		}  //end - render().
	}); //end - PTO.Views.Message().

	//Log Grid Message Model.
	PTO.Models.LogGridMessage = Backbone.Model.extend({
		defaults: {
			title: ''
		}
	}); //end - PTO.Models.LogGridMessage().

	PTO.Views.LogGridMessage = Backbone.View.extend({
		el: '#logGridMessage', 

		initialize: function() {
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
		},

		template: PTO.Utility.template('log-grid-message-template'),

		render: function() {
			this.$el.text(this.template(this.model.toJSON())); 
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





	//Log
	PTO.Models.Log = Backbone.Model.extend({
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
	            options.url = "/rest/Log/?top=1&$filter='id%20%3D%20'" + this.get('id') + "&$params='%5B%5D'";
	            break;

	            case "update":
	            options.url = "/rest/Log/?$method=update";
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
                options.url = "/rest/Log/?$method=update";
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

	PTO.Collections.LogCollection = Backbone.Collection.extend({
		model: PTO.Models.Log,

		logStart: null,
		logEnd: null,
		skip: null,
		filter: null,
		urlParams: [],

		fetch: function(options) {
            options || (options = {});
            var data = (options.data || {});
            this.logStart = (data.logStart || null),
            this.logEnd = (data.logEnd || null);
            this.skip = data.skip || null;
            delete options.data; //delete this or Backbone will append it to the end of our url.
            options.reset = true; //Must set this for view to be able to listen when collection has changed.
            return Backbone.Collection.prototype.fetch.call(this, options);
        },


		url: function() {
			var logConfigObj = {},
			urlString = "";

			logConfigObj.dataClass = "Log";
			logConfigObj.top = 10;
			logConfigObj.timeout = 300;
			logConfigObj.orderBy = "createDate asc";

			if (this.skip) {
				logConfigObj.skip = this.collectionFirst + this.skip;
				logConfigObj.filter = this.filter;

				if (this.urlParams.length > 0) {
					if (this.urlParams.length > 1) {
						urlString = PTO.wakandaQueryURLString(logConfigObj, this.urlParams[0], this.urlParams[1]);
					} else {
						urlString = PTO.wakandaQueryURLString(logConfigObj, this.urlParams[0]);
					} //end - if (this.requestEnd).

				} else {
					logConfigObj.filter = "$all";
					urlString =  PTO.wakandaQueryURLString(logConfigObj);
					this.params = [];
				} //end - if (this.urlParams.length > 0).

			} else {
				if (this.logStart) {
					logConfigObj.filter = "createDate >= :1";
					if (this.logEnd) {
						logConfigObj.filter += " && createDate <= :2";
						urlString = PTO.wakandaQueryURLString(logConfigObj, moment(this.logStart).toDate(), moment(this.logEnd).toDate());
						this.urlParams = [];
						this.urlParams.push(moment(this.logStart).toDate());
						this.urlParams.push(moment(this.logEnd).toDate());

					} else {
						urlString = PTO.wakandaQueryURLString(logConfigObj, moment(this.logStart).toDate());
						this.urlParams = [];
						this.urlParams.push(moment(this.logStart).toDate());
					}
					
				} else {
					logConfigObj.filter = "$all";
					urlString =  PTO.wakandaQueryURLString(logConfigObj);
					this.params = [];
				} //if (this.requestStart).

				this.filter = logConfigObj.filter;

			} //end - if (this.skip).



			return urlString;
			//return "/rest/Log/?$top=400&$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'";
		},

		parse: function(response) {
			this.collectionCount = response.__COUNT || 0;
			this.collectionSent = response.__SENT || 0;
			this.collectionFirst = response.__FIRST || 0;

			var logGridMessageText = "",
			firstRequest = this.collectionFirst + 1,
			lastRequest = this.collectionFirst + this.collectionSent;
			logGridMessageText += firstRequest + " - " + lastRequest + " of " + this.collectionCount + ".";

			PTO.logGridMessage.set({title: logGridMessageText});

			if (response.__ENTITIES) {
				return response.__ENTITIES;
			} else {
				return response;
			}

			// if (response.__ENTITIES) {
			// 	return response.__ENTITIES;
			// } else {
			// 	return response;
			// }
		} //end - parse.
	}); //end - PTO.Collections.LogCollection.

	PTO.Views.LogView = Backbone.View.extend({
		tagName: 'tr',

		initialize: function() {
			//_bindAll(this, 'editTask', 'render');
			this.model.on('change', this.render, this); //change:title, destroy, add, etc.
			this.model.on('destroy', this.remove, this);
		},

		events: {
			"click a.view"				: "viewLogDetail",
			"click" 					: "selected"
		},

		selected: function() {
			this.$el.siblings().removeClass('gridSelect');
			this.$el.addClass('gridSelect');
		}, //end - selected().

		viewLogDetail: function() {
			this.model.fetch({
				success: function(model, response) {
					PTO.viewDetailLogView.model = model;
					PTO.viewDetailLogView.render(); 
				}
			}); 
		}, //end - editUser().



		template: PTO.Utility.template('log-template'),

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this; //this allows us to chain.
		}  //end - render().
	}); //end - PTO.Views.LogView().
	
	PTO.Views.LogCollectionView = Backbone.View.extend({
		el: '#logTableBody',

		render: function() {
			this.$el.children().remove();

			//1. filter through all items in a collection.
			this.collection.each(function(log) {
				//2. For each item create a new log view.
				var logView = new PTO.Views.LogView({model: log});
				//3. Append each log view to our collection view.
				this.$el.append(logView.render().el); //chain chain chain...
			}, this); //the second parameter to each is the context.
		}
	}); //end - PTO.Views.HolidayCollectionView().

	PTO.Views.LogToolbarPaging = Backbone.View.extend({
		el: '#logToolBarPaging',

		initialize: function(){
			this.collection.on('reset', this.watchCollection, this); //change:selection
		},

		watchCollection: function() {
			var prevButton$ = this.$el.find('button.prevLogs'),
				nextButton$ = this.$el.find('button.nextLogs');

			//set prev button
			if (this.collection.collectionFirst === 0) {
                prevButton$.attr("disabled", "disabled");
            } else {
                prevButton$.removeAttr("disabled");    
            }

            //set the next button.
            if (this.collection.collectionFirst + this.collection.collectionSent >= this.collection.collectionCount) {
                nextButton$.attr("disabled", "disabled");
            } else {
                nextButton$.removeAttr("disabled");    
            }
		},

		events: {
			"click button.nextLogs" : "nextLogs",
			"click button.prevLogs" : "prevLogs"
		},

		prevLogs: function(ev) {
			ev.preventDefault();
			PTO.logCollection.fetch({
				data: {
					skip: -10
				},
				success: function(theCollection) {
					PTO.logCollectionView = new PTO.Views.LogCollectionView({collection: theCollection});
					PTO.logCollectionView.render();
				}
			}); //end - PTO.logCollection.fetch();
		},

		nextLogs: function(ev) {
			ev.preventDefault();
		
			PTO.logCollection.fetch({
				data: {
					skip: 10
				},

				success: function(theCollection) {
					PTO.logCollectionView = new PTO.Views.LogCollectionView({collection: theCollection}); 
					PTO.logCollectionView.render();
				}
			}); //end - PTO.logCollection.fetch();
		}
	}); //end - PTO.Views.RequestToolbarPaging.

	PTO.Views.LogToolBar = Backbone.View.extend({
		el: '#logToolBar',

		events: {
			"click button.searchLogs"	: "searchLogs",
			"click button.allLogs"	: "allLogs"
		},

		allLogs: function(ev) {
			ev.preventDefault();
			PTO.logCollection.fetch({
				success: function(theCollection) {
					PTO.logCollectionView = new PTO.Views.LogCollectionView({collection: theCollection}); 
					PTO.logCollectionView.render();
				}
			}); //end - PTO.logCollection.fetch();
		},

		searchLogs: function(ev) {
			ev.preventDefault(); //Don't let this button submit the form.
			PTO.logCollection.fetch({
				data: {
					logStart: this.$el.find('#logStart').val(),
					logEnd: this.$el.find('#logEnd').val()
				},
				success: function(theCollection) {
					PTO.logCollectionView = new PTO.Views.LogCollectionView({collection: theCollection}); 
					PTO.logCollectionView.render();
				}
			}); //end - PTO.logCollection.fetch();
		}
	});//end - PTO.Views.RequestToolBar().

	PTO.Views.ViewLogDetail = Backbone.View.extend({
		el: '#viewLogModalWin',


		render: function() {
			this.$el.find('#logId').val(this.model.get('id'));
			this.$el.find('#dataClassName').val(this.model.get('dataClassName'));
			return this; 
		}  //end - render().
	}); //end - PTO.Views.EditUser().

	




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

		render: function() {
			this.$el.children().remove();

			//1. filter through all items in a collection.
			this.collection.each(function(holiday) {
				//2. For each item create a new holiday view.
				var holidayView = new PTO.Views.HolidayView({model: holiday});
				//3. Append each holiday view to our collection view.
				this.$el.append(holidayView.render().el); //chain chain chain...
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
		skip: null,
		filter: null,
		urlParams: [],

		fetch: function(options) {
            options || (options = {});
            var data = (options.data || {});
            this.requestStart = (data.requestStart || null),
            this.requestEnd = (data.requestEnd || null);
            this.skip = data.skip || null;
            delete options.data; //delete this or Backbone will append it to the end of our url.
            options.reset = true; //Must set this for view to be able to listen when collection has changed.
            return Backbone.Collection.prototype.fetch.call(this, options);
        },

		url: function() {
			var requestConfigObj = {},
			urlString = "";

			requestConfigObj.dataClass = "Request";
			requestConfigObj.top = 10;
			requestConfigObj.timeout = 300;
			requestConfigObj.orderBy = "dateRequested asc";

			if (this.skip) {
				requestConfigObj.skip = this.collectionFirst + this.skip;
				requestConfigObj.filter = this.filter;

				if (this.urlParams.length > 0) {
					if (this.urlParams.length > 1) {
						urlString = PTO.wakandaQueryURLString(requestConfigObj, this.urlParams[0], this.urlParams[1]);
					} else {
						urlString = PTO.wakandaQueryURLString(requestConfigObj, this.urlParams[0]);
					} //end - if (this.requestEnd).

				} else {
					requestConfigObj.filter = "$all";
					urlString =  PTO.wakandaQueryURLString(requestConfigObj);
					this.params = [];
				} //end - (this.urlParams.length > 0).

			} else {
				if (this.requestStart) {
					requestConfigObj.filter = "dateRequested >= :1";
					if (this.requestEnd) {
						requestConfigObj.filter += " && dateRequested <= :2";
						urlString = PTO.wakandaQueryURLString(requestConfigObj, moment(this.requestStart).toDate(), moment(this.requestEnd).toDate());
						this.urlParams = [];
						this.urlParams.push(moment(this.requestStart).toDate());
						this.urlParams.push(moment(this.requestEnd).toDate());

					} else {
						urlString = PTO.wakandaQueryURLString(requestConfigObj, moment(this.requestStart).toDate());
						this.urlParams = [];
						this.urlParams.push(moment(this.requestStart).toDate());
					}
					
				} else {
					requestConfigObj.filter = "$all";
					urlString =  PTO.wakandaQueryURLString(requestConfigObj);
					this.params = [];
				} //if (this.requestStart).

				this.filter = requestConfigObj.filter;
			} //not - if (this.skip) 

			
			return urlString;
			
		},

		parse: function(response) {
			this.collectionCount = response.__COUNT || 0;
			this.collectionSent = response.__SENT || 0;
			this.collectionFirst = response.__FIRST || 0;

			var requestGridMessageText = "",
			firstRequest = this.collectionFirst + 1,
			lastRequest = this.collectionFirst + this.collectionSent;
			requestGridMessageText += firstRequest + " - " + lastRequest + " of " + this.collectionCount + ".";

			PTO.requestGridMessage.set({title: requestGridMessageText});

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

	PTO.Views.RequestToolBar = Backbone.View.extend({
		el: '#requestToolBar',

		events: {
			"click button.searchRequests"	: "searchRequests",
			"click button.allRequests"	: "allRequests"
		},

		allRequests: function(ev) {
			ev.preventDefault();
			PTO.requestCollection.fetch({
				success: function(theCollection) {
					PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
					PTO.requestCollectionView.render();
				}
			}); //end - PTO.requestCollection.fetch();
		},

		searchRequests: function(ev) {
			ev.preventDefault(); //Don't let this button submit the form.
			PTO.requestCollection.fetch({
				data: {
					requestStart: this.$el.find('#requestStart').val(),
					requestEnd: this.$el.find('#requestEnd').val()
				},
				success: function(theCollection) {
					PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
					PTO.requestCollectionView.render();
				}
			}); //end - PTO.requestCollection.fetch();
		}
	});//end - PTO.Views.RequestToolBar().

	PTO.Views.RequestToolbarPaging = Backbone.View.extend({
		el: '#requestToolBarPaging',



		initialize: function(){
			this.collection.on('reset', this.watchCollection, this); //change:selection
		},

		watchCollection: function() {
			var prevButton$ = this.$el.find('button.prevRequests'),
				nextButton$ = this.$el.find('button.nextRequests');

			//set prev button
			if (this.collection.collectionFirst === 0) {
                prevButton$.attr("disabled", "disabled");
            } else {
                prevButton$.removeAttr("disabled");    
            }

            //set the next button.
            if (this.collection.collectionFirst + this.collection.collectionSent >= this.collection.collectionCount) {
                nextButton$.attr("disabled", "disabled");
            } else {
                nextButton$.removeAttr("disabled");    
            }
		},

		events: {
			"click button.nextRequests" : "nextRequests",
			"click button.prevRequests" : "prevRequests"
		},

		prevRequests: function(ev) {
			ev.preventDefault();
			PTO.requestCollection.fetch({
				data: {
					skip: -10
				},
				success: function(theCollection) {
					//PTO.pagingButtonSetDisabled(theCollection, $(ev.currentTarget), "prev");

					PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
					PTO.requestCollectionView.render();
				}
			}); //end - PTO.userCollection.fetch();
		},

		nextRequests: function(ev) {
			ev.preventDefault();
		
			PTO.requestCollection.fetch({
				data: {
					skip: 10
				},

				success: function(theCollection) {
					//PTO.pagingButtonSetDisabled(theCollection, $(ev.currentTarget), "next");

					PTO.requestCollectionView = new PTO.Views.RequestCollectionView({collection: theCollection}); //PTO.requestCollection
					PTO.requestCollectionView.render();
				}
			}); //end - PTO.userCollection.fetch();
		}
	}); //end - PTO.Views.RequestToolbarPaging.


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

	// var sync = Backbone.sync;
	// Backbone.sync = function (method, model, options) {
	// 	console.log(method);
	// 	console.log(model);
	// 	console.log(options);

	//     var success = options.success;
	//     options.success = function (resp, status, xhr) {
	//         //Your logic goes here
	//         console.log('sync override succeed');
	//         if (success) success(resp, status, xhr);
	//     };

	//     options.error = function (xhr, ajaxOptions, thrownError) {
	//         console.log('failed');
	//     }

	//     sync(method, model, options);
	// };
	
	//Don't like Hash navigation.
	//new PTO.Router(); //Create an instance of our router.
	//Backbone.history.start(); //Tell Backbone to start monitoring hash change events in the browser.


}); //end - $( document ).ready(function().

