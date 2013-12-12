
//New Request.
var	currentDayMoment = 	moment(PTO.requestDateInput$.val()),
	holidaysArr = 		PTO.holidayCollection.toJSON().map(function(oneDay) {return oneDay.dateString;}),
	requestArr = 		PTO.requestCollection.toJSON().map(function(oneDay) {return oneDay.dateString;});

//Skip holidays, weekends, and current requests.
var keepLooking = true;
currentDayMoment.add('days', 1);

while (keepLooking) {
		if (holidaysArr.indexOf(currentDayMoment.format("MM/DD/YYYY")) !== -1) {
		currentDayMoment.add('days', 1);

	} else if (requestArr.indexOf(currentDayMoment.format("MM/DD/YYYY")) !== -1) {
		currentDayMoment.add('days', 1);

	} else if (currentDayMoment.day() == 6) { //Sat
		currentDayMoment.add('days', 2);

	} else if (currentDayMoment.day() == 0) { //Sun
		currentDayMoment.add('days', 1);

	} else {
		keepLooking = false;
	}
} //end while()

PTO.requestDateInput$.val(currentDayMoment.format("MM/DD/YYYY"));
PTO.dayName$.html(currentDayMoment.format('dddd'));

//reset our date picker. 
PTO.setCalendar(PTO.requestDateInput$, PTO.dayName$);


//////////////////////////////------------------------////////////////////////////////
////Login.
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




//Need to make this a function. Refactor.
					//set date to next day.
					//var requestDateInput$ = that.$el.find('#requestDate'),

					/*
					var	currentDayMoment = 	moment(PTO.requestDateInput$.val()),
						holidaysArr = 		PTO.holidayCollection.toJSON().map(function(oneDay) {return oneDay.dateString;}),
						requestArr = 		PTO.requestCollection.toJSON().map(function(oneDay) {return oneDay.dateString;});


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

					PTO.requestDateInput$.val(currentDayMoment.format("MM/DD/YYYY"));
					PTO.dayName$.html(currentDayMoment.format('dddd'));
					*/
