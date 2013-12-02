
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var button1 = {};	// @button
// @endregion// @endlock

// eventHandlers// @lock

	button1.click = function button1_click (event)// @startlock
	{// @endlock
		//waf.sources.request.all({autoExpand: "owner, owner.myManager"});
		//waf.sources.request.query("owner.myManager.id = :1", waf.directory.currentUser().ID);
		waf.sources.request.query("dateRequested > :1", new Date(), {autoExpand: "owner"});
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("button1", "click", button1.click, "WAF");
// @endregion
};// @endlock
