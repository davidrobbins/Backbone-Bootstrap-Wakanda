
model = new DataStoreCatalog();

//Use module pattern for User dataclass definition. I use this dataclass in many projects.
model.User = require('CustomLogin').User;

include("classes/holiday.js");
include("classes/request.js");