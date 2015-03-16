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

DS.funcChain = function (f1,f2) {
	var res = f1;
	if (f2) {
		if (f1) {
			res = function() {f2.apply(this,arguments); f1.apply(this,arguments);};
		} else {
			res = f2;
		}
	}
	return res;
};

DS.classRegistry = {};

DS.makeClass = function (data) {
	var base = data.base === undefined ? Object : data.base;
	var cls = data.cnst;
	if (base !== Object) {
		var cnst = cls;
		if (cls === undefined) {
			cls = function () {base.apply(this,arguments);};
		}
		cls = function () {base.apply(this,arguments); cnst.apply(this,arguments);};
	}
	DS.setBase(cls,base);
	cls._name = data.name;
	cls._base = base;
	if (data.namespace !== undefined) {
		data.namespace[data.name] = cls;
	}
	if (data.key !== undefined) {
		cls._key = data.key;
		DS.classRegistry[data.key] = cls;
		console.log(DS.classRegistry);
	}
	
	cls._load = DS.funcChain(data.load,base._load);
	cls._init = DS.funcChain(data.init,base._init);
	
	if (cls._load) {
		cls._load.call(cls);
	}
	if (cls._init) {
		cls._init.call(cls);
	}
	return data.namespace[data.name];
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

DS._namespaces = {};
DS.namespace = function (name) {
	var res = DS._namespaces[name];
	if (res === undefined) {
		res = {};
		DS._namespaces[name] = res;
	}
	return res;
};

global.DS = DS;