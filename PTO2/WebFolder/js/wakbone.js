var Wakbone = (function() {
	var wakboneObj = {}; //This is the object we will return to create our module.

	//P R I V A T E   M E T H O D S   (S T A R T).

    //P R I V A T E   M E T H O D S   (E N D).

    wakboneObj.Model = Backbone.Model.extend({
    	dataclass: null,
    	entitySetId: null,

    	parse: function(response) {
    		if (response.__ENTITYSET) {
				var entitySetStr = response.__ENTITYSET,
					tokens = entitySetStr.split("/");

				this.entitySetId = 	tokens[4];
			}

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
	            options.url = "/rest/";
	            options.url += this.dataclass;
	            options.url += "/?top=1&$filter='id%20%3D%20'" + this.get('id') + "&$params='%5B%5D'";
	            break;

	            case "update":
	            options.url = "/rest/";
	            options.url += this.dataclass;
	            options.url += "/?$method=update";

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
                break;

                case "create":
                options.url = "/rest/";
	            options.url += this.dataclass;
                options.url += "/?$method=update";
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

    });





    wakboneObj.Collection = Backbone.Collection.extend({
    	dataclass: null,
    	top: 10,
    	collectionCount: 0,
    	collectionFirst: 0,
    	collectionSent: 0,
		skip: null,
		filter: null,
		savedfilter: "$all",
		urlParams: null,

		fetch: function(options) {
            options || (options = {});
            var data = (options.data || {});
            this.skip = data.skip || null;

            if (!(this.skip)) {
            	if (data.filter) {
            		this.filter = data.filter;
            		this.savedfilter = data.filter;
            	} else {
            		this.filter = null;
            		this.savedfilter = "$all";
            	}

            	if (data.urlParams) {
            		this.urlParams = data.urlParams;
            	} else {
            		this.urlParams = null;
            	}
            } //end - (!(this.skip)).
            
            delete options.data; //delete this or Backbone will append it to the end of our url.
            options.reset = true; //Must set this for view to be able to listen when collection has changed.

            return Backbone.Collection.prototype.fetch.call(this, options);
        },

		url: function() {
			var urlString = "/rest/";

			urlString += this.dataclass;
			urlString += "/?";
			urlString += "$top=" + this.top;

			if (this.skip) {
				var skipNumber = this.collectionFirst + this.skip;
				urlString += "&";
				urlString += "$skip=" + skipNumber;
			}

			//params.
			urlString += "&";
			urlString += encodeURI("&$params='[");
			if (this.urlParams) {
				var parmsString = "";
				this.urlParams.forEach(function(parm, index, paramsList) {

					if (_.isString(parm)) {
	                    parmsString += "\"" + parm + "\"";

	                } else if (_.isNumber(parm)) {
	                	parmsString += "\"" + parm + "\"";

	                } else if (_.isDate(parm)) {
	                    parmsString += "\"" + moment(parm).format() + "\"";
	                }
					

					//parmsString += "\"" + parm + "\"";

	                if (index < paramsList.length -1) {
	                   parmsString += ","; 
	                }
				});

				urlString += encodeURIComponent(parmsString);
			}
			urlString += encodeURI("]'");  

			urlString += "&";
			urlString += "$method=entityset";
			urlString += "&";
			urlString += "$timeout=300";
			urlString += "&";

			if (this.savedfilter == "$all") {
	            urlString += "$savedfilter='" + encodeURIComponent(this.savedfilter) + "'";
	        } else {
	            urlString += "$savedfilter='" + encodeURIComponent(this.filter) + "'";
	            urlString += "&";
	            urlString += "$filter='" + encodeURIComponent(this.filter) + "'";
	        }

			return urlString;
		},

		parse: function(response) {
			this.collectionCount = response.__COUNT || 0;
			this.collectionSent = response.__SENT || 0;
			this.collectionFirst = response.__FIRST || 0;

			if (response.__ENTITIES) {
				return response.__ENTITIES;
			} else {
				return response;
			}
		}, //end - parse.

		selectNext: function() {
			this.fetch({data: {skip: 10}});
		}, //end selectNext().

		selectPrev: function() {
			this.fetch({data: {skip: -10}});
		}, //end selectPrev().

		query: function(optionsObj) {
			var parms = _.rest(arguments);
			this.fetch({data: {urlParams: parms, filter: optionsObj.filter}});
		}
    }); //end - wakboneObj.Collection().





    wakboneObj.CollectionView = Backbone.View.extend({
    	render: function() {
            this.$el.children().remove();

            this.collection.each(function(model) {
                var rowView = new this.rowView({model: model});
                this.$el.append(rowView.render().el); 
            }, this); 
        }
    }); //end - wakboneObj.CollectionView.

return wakboneObj;   
}()); //end - Wakbone.