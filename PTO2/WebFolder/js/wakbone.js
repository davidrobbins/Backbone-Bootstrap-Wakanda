var Wakbone = (function() {
	var wakboneObj = {}; //This is the object we will return to create our module.

	//P R I V A T E   M E T H O D S   (S T A R T).

    //P R I V A T E   M E T H O D S   (E N D).


    wakboneObj.Collection = Backbone.Collection.extend({
    	dataclass: null,
    	top: 10,
    	collectionCount: 0,
    	collectionFirst: 0,
    	collectionSent: 0,
		skip: 0,
		filter: null,
		urlParams: [],

		url: function() {
			var urlString = "/rest/";
			var skipNumber = this.collectionFirst + this.skip;

			urlString += this.dataclass;
			urlString += "/?";
			urlString += "$top=" + this.top;
			urlString += "&";
			urlString += "$skip=" + skipNumber;
			urlString += "&";
			urlString += "$params='%5B%5D'&$method=entityset&$timeout=300&$savedfilter='%24all'";

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

		fetch: function(options) {
            options || (options = {});
            var data = (options.data || {});
            this.skip = data.skip || 0;
            delete options.data; //delete this or Backbone will append it to the end of our url.
            options.reset = true; //Must set this for view to be able to listen when collection has changed.
            return Backbone.Collection.prototype.fetch.call(this, options);
        },

		selectNext: function() {
			this.fetch({data: {skip: 10}});
		}, //end selectNext().

		query: function() {
			
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