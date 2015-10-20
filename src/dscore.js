(function(exports){
'use strict';
var DS = {};

DS.nop = function (){};


DS.setBase = function (type,base) {
	for (var f in base) {
		if (base.hasOwnProperty(f) && f !== '_name') {
			type[f] = base[f];
		}
	}
	type.prototype = Object.create(base.prototype);
	type.prototype.constructor = type;
};

function funcChain(f1,f2) {
	var res = f1;
	if (f2 !== undefined) {
		if (f1 !== undefined) {
			res = function() {f2.apply(this,arguments); f1.apply(this,arguments);};
		} else {
			res = f2;
		}
	}
	return res;
}

DS.classRegistry = {};

DS.makeClass = function (data) {
	var base = (data.base === undefined ? Object : data.base);
	var cls = data.cnst || DS.nop;
	var baseArgs = data.baseArgs;
	if (base !== Object && data.skipBase === undefined) {
		var cnst = cls;
		if (baseArgs === undefined) {
			cls = function () {
				var res = base.apply(this,arguments) || this;
				res = cnst.apply(res,arguments) || this;
				return res;
			};		
		} else {
			cls = function () {
				var res = base.apply(this,baseArgs.apply(this,arguments)) || this; 
				res = cnst.apply(res,arguments) || this;
				return res;
			};
		}
	} else {
		var cnst_ = cls;
		cls = function () {
			var res = cnst_.apply(this,arguments) || this;
			return res;	
		};	
	}
	DS.setBase(cls,base);
	cls._name = data.name;
	cls._base = base;
	var ns = data.namespace;
	if (ns !== undefined) {
		ns[data.name] = cls;
		cls._namespace = ns;
	}
	if (data.key !== undefined) {
		cls._key = data.key;
		DS.classRegistry[data.key] = cls;
	}
	
	var t = funcChain(data.load,base._load);
	if (t !== undefined) {
		cls._load = t;
		t.call(cls);
	}
	
	t = funcChain(data.init,base._init);
	if (t !== undefined) {
		cls._init = t;
		t.call(cls);
	}
	
	var proto = data.proto || DS.nop;
	proto(cls.prototype);
	
	return cls;
};

DS.getClass = function (key) {
	return DS.classRegistry[key];
};

DS.registerClass = function (key,cls) {
	DS.classRegistry[key] = cls;	
};

DS.unregisterClass = function(key) {
	delete DS.classRegistry[key];	
};

DS.namespace = function (name) {
	var res = DS[name];
	if (res === undefined) {
		res = {};
		res._isNamespace = true;
		DS[name] = res;
	}
	return res;
};

exports.DS = DS;
exports.setBase = DS.setBase;
console.log('DS loaded',DS);

}(window));
