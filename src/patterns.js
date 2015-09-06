(function(DS){
var t = DS.namespace('patterns');

var c = DS.makeClass({
	name:'DSRegistry',
	namespace:t,
	cnst:function() {
		this._cache = {};
	}
});

p = c.prototype;

p.register = function (key,value) {
	this._cache[key] = value;	
};

p.unregister = function (key) {
	delete this._cache[key];	
};

p.get = function (key) {
	return this._cache[key];
};
	
}(DS));
