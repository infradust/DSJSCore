(function(DS){
	

var d = DS.namespace('data');
var c,p;

/******************************************************************************/
/**
* @description: This will create an accessor function used 
				for getting/setting a value on an object.
 				The 'source' must implement 'get' AND 'set'
				methods. these methods will take as first
				parameter the object that hold the accessor.
* @usage:
	var acc = {
		values: {},
		get: function (inst,key) {return this.values[inst.key][key];},
		set: function (inst,key,value) {var r = this.values[inst.key]; 
										if (r === undefined){
											r = {}; 
											this.values[inst.key] = r;
										} 
										r[key] = value;
									   },
	};
	var obj = {key:144,
			   junk:DS.data.accessor(acc,1)};
	
	obj.junk('a',100);
	console.log(obj.junk('a');
*/
/******************************************************************************/
d.accessor = function (source,pcount) {
	var a = function () {
		var res = this;
		var args = Array.prototype.slice.call(arguments);
		args.unshift(this);
		if (args.length === pcount + 1 ) {
			res = source.get.apply(source,args);
		} else {
			source.set.apply(source,args);
		}
		return res;
	};
	return a;
};
/******************************************************************************/

/******************************************************************************/
c = DS.makeClass({
	name:'DSDataRelation',
	namespace:d,
	cnst:function(data){
		this.inst = data.inst;
		this.prop = data.property;
	},	
});
p = c.prototype;
c = p = undefined;
/******************************************************************************/

/******************************************************************************/
c = DS.makeClass({
	name:'DSDataObject',
	namespace:d,
	cnst:function(data) {
		this.$flags = {};
		this.$values = {};
		this.$changes = {};
		this.$ownProperties = {};
		this.$relations = {};
		this.$isNew = true;
		this.$setByKeys(data,true);		
	},
	load: function () {
		var self = this;
		this.$properties = {};
		this.$store = {};
		this.$getOrCreate = function (data) {
			var k = data.key;
			var s = this.$store;
			var res = s[k];
			if (res === undefined) {
				res = new this(data);
				s[k] = res;
			}
			return res;
		};
		this.$accessors = function (inst) {
			for (var pk in self.$properties) {
				self.$properties[pk].setAccessor(inst);
			}
		};
		this.$removeProperty = function (key) {
			var p = self.$properties[key];
			if(p !== undefined) {
				delete self.$properties[key];	
				p.removeAccessor(self.prototype);			
			}
		};
		this.$addProperty = function (prop) {
			if (self.$properties[prop.key] === undefined) {
				self.$properties[prop.key] = prop;
				prop.setAccessor(self.prototype);
			} else {
				console.log('property with key:',prop.key,'already exists for class:',self._name);
			}
		};
		this.$unsetAccessors = function (inst) {
			for (var k in self.$properties) {
				var p = self.$properties[k];
				p.removeAccessor(inst);
			}	
		};
	},
	init:function(){
		this.$accessors(this.prototype);
	}
});
p = c.prototype;

p.$destroy = function (){
	this.constructor.$unsetAccessors(this);
	var ps = this.$ownProperties;
	for (var pk in ps) {
		var p = ps[pk];
		p.removeAccessor(this);
	}
};

p.$addProperty = function (p) {
	var cls = this.constructor;
	var existing = cls.$properties[p.key];
	if (existing === undefined)	{
		existing = this.$ownProperties[p.key];
		if (existing === undefined) {
			this.$ownProperties[p.key] = p;
			p.setAccessor(this);
		}
	}
};

p.$removeProperty = function (key) {
	var p = this.$ownProperties[key];
	if (p !== undefined)	{
		p.remove(this);
		p.removeAccessor(this);
		delete this.$ownProperties[key];
	}
};

p.$_propForKey = function (key) {
	var res = this.constructor.$properties[key];
	if (res === undefined) {
		res = this.$ownProperties[key];
	}
	if (res === undefined) {
		console.log('property with key:',key,' not found for:',this);
	}
	return res;
};

p.$prop = function(name) {
	return (this.hasOwnProperty(name) ? this[name].prop : undefined);	
};

p.$undo = function () {
	for (var k in this.$changes) {
		var p = this.$_propForKey(k);
		p.undo(this);
	}
};

p.$access = function() {
	var acc = this[arguments[0]];
	if (acc) {
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		acc.apply(this,args);
	} else {
		console.log('no accessor found for:',arguments[0],'on instance:',this);
	}
};

p.$setByKey = function (propKey,value,persistent) {
	var cls = this.constructor;
	var p = cls.$properties[propKey];
	if (p === undefined) {
		p = this.$ownProperties[propKey];
		if (p === undefined) {
			console.log('Could not find property for key:',propKey);
			return;
		}
	}
	if (persistent || this.$isNew) {
		p.setPersistent(this,value);
	} else {
		p.set(this,value);		
	}
};

p.$setByKeys = function(data,persistent) {
	for (var k in data) {
		this.$setByKey(k,data[k],persistent);
	}	
};

p.$hasChanges = function () {
	return this.$changes.length > 0;	
};

c = p = undefined;

/******************************************************************************/
c = DS.makeClass({
	name:'DSBasicProperty',
	namespace:d,
	cnst:function (data) {
		this.name = data.name ? data.name : data.key;
		this.key = data.key ? data.key : this.name;
		this.description = data.description;
		if (data.default) {
			this.default = data.default;
		}
	},
});
p = c.prototype;

p._set = function (inst,value) {
		inst.$values[this.key] = value;		
};

p.setupAccessor = function (a) {
	a.prop = this;
};

p.setAccessor = function (inst) {
	if (inst.hasOwnProperty(this.name)) {
		console.log('property: ',p,'will override accessor named:',p.name,'instance:',inst);
	}
	if (this.hasOwnProperty('default')) {
		this._set(inst,this.default);
	}
	
	var a = d.accessor(this,0);
	this.setupAccessor(a);
	inst[this.name] = a;
};

p.removeAccessor = function (inst) {
	delete inst[this.name];	
};

p._willChange = function (inst,old,value) {
	if (inst.$changes.hasOwnProperty(this.key)) {
		if (inst.$changes[this.key] === value) {
			delete inst.$changes[this.key];
		}	
	} else {
		inst.$changes[this.key] = old;
	}
};

p.setPersistent = function(inst,value){
	if (inst.$changes.hasOwnProperty(this.key)) {
		if (inst.$changes[this.key] === value) {
			return;
		} else if (inst.$values[this.key] !== value){
			this.$changes[this.key] = value;
		} else {
			delete this.$changes[this.key];
		}
	} else {
		this._set(inst,value);
	}
};

p.set = function (inst,value) {
	var old = inst.$values[this.key];
	if (old === value) {
		return;
	}
	this._willChange(inst,old,value);
	if (value === undefined) {
		delete inst.$values[this.key];
	} else {
		inst.$values[this.key] = value;		
	}
};

p.undo = function(inst) {
	var c = inst.$changes;
	if (c.hasOwnProperty(this.key)) {
		this.set(inst,c[this.key]);
	}	
};

p.setMulti = function (inst,values) {
	for (var k in values) {
		this.set(inst,values[k]);
	}	
};

p.remove = function (inst) {
	var old = inst.$values[this.key];
	if (old !== undefined) {
		this._willChange(inst,old,undefined);		
		delete inst.$values[this.key];
	}
};

p.get = function (inst) {
	return inst.$values[this.key];
};  

p.modification = function (inst) {
	return inst.$changes[this.key];	
};

c = p = undefined;
/******************************************************************************/

/******************************************************************************/
c = DS.makeClass({
	name:'DSSetProperty',
	namespace:d,
	base:d.DSBasicProperty,
	cnst:function (data) {}
});
p = c.prototype;

p.get = function(inst,key) {
	return inst.$values[this.key][key];	
};

p._willChange = function(inst,key,old,value) {
	var c = inst.$changes[this.key];
	if (c.hasOwnProperty(key)) {
		if (c[key] === value) {
			delete c[key];
		}
	} else {
		c[key] = old;
	}
	//TODO:: incorporate changes from objects 
};

p.set = function (inst,key,value) {
	var col = inst.$values[this.key];
	var old = col[key];	
	if (value === old) {
		return;
	}
	this._willChange(inst,key,old,value);
	col[key] = value;
};

c = p = undefined;
/******************************************************************************/

/*
c = DS.makeClass({
	name:'DSArrayProperty',
	namespace:d,
	base:d.DSBasicProperty,
	cnst:function (data) {}
});

p = c.prototype;

p._willChange = function (inst,old,value,index) {
	
};

p.set = function (inst,value,index) {
	if (value instanceof Array) {
	//TODO:: replace the backing array with the given one or add an array at the given index	
	} else if (value instanceof d.DSDataObject) {
		value.$owner = [inst,this];
		var arr = inst.$values[this.key];
		if (index !== undefined) {
			var old = arr[index];
			arr[index] = value;
			this._willChange(inst,old,value);
		} else {
			arr.push(value);
			this._willChange(inst,undefined,value,arr.length-1);
		}
	} else {
		
	}
}

c=p=undefined;
*/

console.log('DS.data loaded',d);
}(DS));
