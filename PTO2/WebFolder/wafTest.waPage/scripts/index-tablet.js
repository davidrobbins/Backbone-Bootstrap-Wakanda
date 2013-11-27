
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var manager = {};	// @button
	var button2 = {};	// @button
	var button1 = {};	// @button
// @endregion// @endlock

// eventHandlers// @lock

//waf.sources.request.query("dateRequested > :1", new Date());
		//waf.sources.request.query("status == 'Pending'");

	manager.click = function manager_click (event)// @startlock
	{// @endlock
		waf.sources.request.query("dateRequested > :1 && owner.myManager.id == :2", new Date(), waf.directory.currentUser().ID, {autoExpand: "owner"});
		
		//waf.sources.request.query("owner.id = :1", waf.directory.currentUser().ID);
		//waf.sources.request.query("owner.id == :1 && status == :2", waf.directory.currentUser().ID, "Pending");
	};// @lock

	button2.click = function button2_click (event)// @startlock
	{// @endlock
		waf.sources.request.query("owner.id = :1", waf.directory.currentUser().ID);
	};// @lock

	button1.click = function button1_click (event)// @startlock
	{// @endlock
		waf.sources.request.all();
		
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("manager", "click", manager.click, "WAF");
	WAF.addListener("button2", "click", button2.click, "WAF");
	WAF.addListener("button1", "click", button1.click, "WAF");
// @endregion
};// @endlock
