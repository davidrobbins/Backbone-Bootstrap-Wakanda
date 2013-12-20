﻿//Creating the Request classmodel.Request = new DataClass("Requests");//Add Task attributes.model.Request.id = new Attribute("storage", "long", "key auto");model.Request.hours = new Attribute("storage", "long", "btree");model.Request.compensation = new Attribute("storage", "string", "btree");model.Request.dateString = new Attribute("storage", "string");model.Request.dateRequested = new Attribute("storage", "date", "btree");model.Request.status = new Attribute("storage", "string", "btree");model.Request.payrollChecked = new Attribute("storage", "bool");model.Request.owner = new Attribute("relatedEntity", "User", "User"); // relation to the User classmodel.Request.ownerName = new Attribute("alias", "string", "owner.fullName");//Eventsmodel.Request.events = {};model.Request.events.onRestrictingQuery = function() {	var myCurrentUser = currentUser(), // we get the user of the current session.		sessionRef = currentSession(), // Get session.		result;		result = ds.Request.createEntityCollection(); //default to empty collection.		if (sessionRef.belongsTo("Administrator") || sessionRef.belongsTo("Manager")) {		result = ds.Request.all();	} else {		result = ds.Request.query("owner.id = :1", myCurrentUser.ID);	}		result = ds.Request.all(); //just for testing.	return result;} //end - onRestrictingQuery();//Collection Methods.model.Request.collectionMethods = {};model.Request.collectionMethods.acceptAllRequests = function() {	var currentRequestsCollection = this; //"this" contains our current Requests collection.	currentRequestsCollection.forEach(function(oneRequest) {		oneRequest.status = "Accepted";        oneRequest.save();	}); //end - currentRequestsCollection.forEach().		return currentRequestsCollection;}; //end - model.Request.collectionMethods.acceptRequests().model.Request.collectionMethods.acceptAllRequests.scope = "public";model.Request.events.onInit = function() {		var myCurrentUser = currentUser(), // we get the user of the current session.		myUser = ds.User.find("id = :1", myCurrentUser.ID);		if ((myCurrentUser !== null) && (myUser !== null)) {//if a user is logged in.				this.owner = myUser;	}		this.status = "Pending";	this.payrollChecked = false;}; //end - onInit().model.Request.events.onValidate = function() {	var err = null,		sessionRef = currentSession(), // Get the session.		myCurrentUser = currentUser(), // Get the current user.		myUser = ds.User.find("id = :1", myCurrentUser.ID);	if (myUser) {		if (this.isNew()) {			switch(this.compensation) {				case ("Floating Day") :					if (myUser.floatingDays < 1) {					err = {error : 3600, errorMessage: "You do not have any floating days left in your account."};				}				break;												case ("PTO") :				if (this.hours > myUser.ptoHours) {					err = {error : 3100, errorMessage: "You do not have enough hours in your account for this request."};				}								if (this.hours < 1) {					err = {error : 3200, errorMessage: "Hours must be greater than zero."};				}								if (this.hours > 8) {					err = {error : 3200, errorMessage: "Hours can not be greater than eight."};				}				break;						} //end - switch().						/*			var tempDate = new Date(this.dateString);			if (tempDate < new Date()) {				err = {error : 3300, errorMessage: "You cannot request PTO for a date in the past."};			}			*/			} //end - if (this.isNew()).	} //end - if (myUser).		return err;}; //end - onValidate().model.Request.events.onRemove = function() {	myCurrentUser = currentUser(), // Get the current user.	myUser = ds.User.find("id = :1", myCurrentUser.ID);		if (myUser) {		switch(this.compensation) {			case ("PTO") :			myUser.ptoHours += this.hours;			myUser.save();			break;						case ("Floating Day") :			myUser.floatingDays += 1;			myUser.save();			break;					}			}};model.Request.events.onSave = function() {	var sessionRef = currentSession(), // Get the session.	myCurrentUser = currentUser(), // Get the current user.	myUser = ds.User.find("id = :1", myCurrentUser.ID),		theClass = this.getDataClass(), //get the dataclass of the entity to save   	theClassName = theClass.getName(), //get the dataclass name    oldEntity = theClass(this.getKey()); //find the same entity on disk		if (this.isNew()) {		this.dateRequested = new Date(this.dateString);				switch(this.compensation) {			case ("PTO") :			myUser.ptoHours -= this.hours;			myUser.save();			break;						case ("Floating Day") :			myUser.floatingDays -= 1;			myUser.save();			break;								} //end - switch.									} else {		//not new		 if (this.status !== oldEntity.status) {		 	if (this.status === "Rejected") {		 		//Manager must have rejected it. Find the owner of the request.		 		theOwner = ds.User.find("id = :1", this.owner.id);		 		theOwner.ptoHours += this.hours;		 		theOwner.save();		 	}		 }	} //end - this.isNew().				}; //end - onSave().