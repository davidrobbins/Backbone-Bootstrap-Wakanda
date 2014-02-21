
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var button1 = {};	// @button
// @endregion// @endlock

// eventHandlers// @lock

	button1.click = function button1_click (event)// @startlock
	{// @endlock
		waf.sources.request.query("id > :1", 240);
		//waf.sources.request.all(); //{autoExpand: "owner, owner.myManager", pageSize: 20}
		//waf.sources.request.all({autoExpand: "owner, owner.myManager", pageSize: 20});
		//waf.sources.request.query("owner.myManager.id = :1", waf.directory.currentUser().ID);
		//waf.sources.request.query("dateRequested > :1 && dateRequested < :2", new Date("03/01/2014"), new Date("04/01/2014"), {autoExpand: "owner"});
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("button1", "click", button1.click, "WAF");
// @endregion
};// @endlock
