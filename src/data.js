var d = DS.namespace('data');
var c,p;

c = DS.makeClass({
	name:'DSDataObject',
	namespace:d,
	cnst:function(data) {
		var cls = this.constructor;
		this.$values = {};
		this.$changes = {};
		this.$ownProperties = {};
		this.$owner = data.$owner;
		cls.$accessors(this);
	},
	load: function () {
		var self = this;
		this.$properties = {};
		this.$accessors = function (inst) {
			for (var pk in self.$properties) {
				self.$properties[pk].accessor(inst);
			}
		};
		this.$removeProperty = function (key) {
			delete self.$properties[key];	
		};
		this.$addProperty = function (prop) {
			var existing = self.$properties[prop.key];
			if (existing === undefined) {
				self.$properties[prop.key] = prop;
			} else {
				console.log('property with key:',prop.key,'already exists for class:',self._name);
			}
		};
	},
});
p = c.prototype;
p.$addProperty = function (p) {
	var cls = this.constructor;
	var existing = cls.$properties[p.key];
	if (existing === undefined)	{
		existing = this.$ownProperties[p.key];
		if (existing === undefined) {
			this.$ownProperties[p.key] = p;
			p.accessor(this);
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

p.$undo = function () {
	for (var k in this.$changes) {
		var p = this.$_propForKey(k);
		p.undo(this);
	}
};

p.$set = function() {
	
};

p.$setByKey = function (propKey,value) {
	var cls = this.constructor;
	var p = cls.$properties[propKey];
	if (p === undefined) {
		p = this.$ownProperties[propKey];
		if (p === undefined) {
			console.log('Could not find property for key:',propKey);
			return;
		}
	}
	p.set(this,value);
};

p.$setByKeys = function(data) {
	for (var k in data) {
		this.$setByKey(k,data[k]);
	}	
};

c = p = undefined;

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

p.accessor = function (inst) {
	var self = this;
	if (inst.hasOwnProperty(p.name)) {
		console.log('property: ',p,'will override accessor named:',p.name,'instance:',inst);
	}
	if (this.hasOwnProperty('default')) {
		this._set(inst,this.default);
	}
	inst[this.name] = function (value) {
		var res = inst;
		if (value !== undefined) {
			self.set(inst,value);
		} else {
			if (arguments.length === 0) {
				res = self.get(inst);			
			} else {
				self.remove(inst);
			}
		}
		return res;
	};
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

p.toJSON = function (inst,json) {
	json[this.key] = this.get(inst);
};

p.fromJSON = function (json,inst) {
	var j = json[this.key];
	this.set(inst,j); 
};
c = p = undefined;

c = DS.makeClass({
	name:'DSSetProperty',
	namespace:d,
	base:d.DSBasicProperty,
	cnst:DS.nop//function (data) {}
});
p = c.prototype;

p.get = function(inst,key) {
	return inst.$values[this.key][key];	
};

p._willChange = function(inst,key,old,value) {
		
};

p.set = function (inst,key,value) {
	var col = inst.$values[this.key];
	var old = col[key];	
	if (value === old) {
		return;
	}
	col[key] = value;
};

c = p = undefined;

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

/*
delete c;
delete p;
delete d;
*/
