(function(DS){

var oo = DS.namespace('oo');
var c,p;

oo.idCounter = 0;
oo.nextId = function () {return ('$' + oo.idCounter++);};
oo.condSet = function(inst,key,value) {
	if (value !== undefined) {
		inst[key] = value;
	}
};

c = DS.makeClass({
	name:'DSObject',
	namespace:oo,
});
p = c.prototype;
c = p = undefined;


c = DS.makeClass({
	name:'DSKeyedObject',
	base:oo.DSObject,
	namespace:oo,
	cnst: function (data) {
		this.$update(data);
	},
	load: function () {
		this.idField = 'key';
	},
});
p = c.prototype;
p.$setId = function (key,clientKey) {
	this.$id = function () {return key;};	
	this.$clientKey = clientKey;
};
p.$update = function (data) {
	var cls = this.constructor;
	var key = data[cls.idField];
	var clientKey = false;
	if (key === undefined) {
		clientKey = true;
		key = oo.nextId();
	}
	this.$setId(key,clientKey);		
};
c = p = undefined;

DS.makeClass({
	name:'DSCachedObject',
	base:oo.DSKeyedObject,
	namespace:oo,
	cnst: function (data) {
		var cls = this.constructor;
		var cacheKey = cls.cacheKey(this.$id());
		var x = cls.cache[cacheKey];
		if (x !== undefined) {
			return x;
		}
		cls.cache[cacheKey] = this;
	},
	load:function() {
		this.namespace = '';
		this.sharedCache = false;
		this.initCache = function() {return {};};
		this.cacheKey = function (key) {return this.namespace + key;};
		this.clearCache = function () {
			var c = this.cache;
			for (var k in c) {
				if (c.hasOwnProperty(k)) {
					delete c[k];
				}
			}	
		};
		this.$getOrCreate = function (key,data) {
			var c = this.cache;
			var r = c[this.cacheKey(key)];
			if (r === undefined) {
				r = new this(data);
			}
			return r;
		};
		this.$get = function (key) {
			return this.cache[this.cacheKey(key)];	
		};
	},
	init:function() {
		this.cache = this.initCache();
	},
});

console.log('DS.oo loaded',oo);
	
}(DS));