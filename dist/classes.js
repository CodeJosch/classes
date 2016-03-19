/**
 * classes 0.2.0
 *
 * Simple classes framework with extendable classes and serializable objects for node and browser.
 *
 * https://github.com/CodeJosch/classes.git
 *
 * @preserve
 */
var classes = (function () {
	"use strict";

	var lib = function(){};

	lib.version = "0.2.0";

	// setup namespace
	lib.defined = { core : {}};

	(function (gobj) {

		["String", "Boolean", "Date", "Number"].forEach(function (clzname) {
			lib.defined.core[clzname] = gobj[clzname];
		});

	})(typeof window !== "undefined" ? window : global);

	
	/**
	 * output a warning message
	 * @param msg
	 */
	lib.warn = function () {
		console.warn(arguments);
	};

	lib.instancesCreated = 0;
	/**
	 * merge objects to first supplied parameter
	 * @returns {*}
	 */
	lib.merge = function () {
		var dest = arguments[0],
			i;
		if (dest === null || typeof dest !== "object") {
			return {};
		}

		for (i = 1; i < arguments.length; i++) {
			var obj = arguments[i];
			if (obj === null || typeof obj !== "object") continue;
			for (var key in obj) {
				if (!obj.hasOwnProperty(key)) {
					continue;
				}
				dest[key] = obj[key];
			}
		}
		return dest;
	};

	/**
	 * clone an object
	 * @param obj
	 */
	lib.clone = function (obj) {
		return lib.deserialize(lib.serialize(obj));
	};

	/**
	 * instantiate lazy obejct definitions identified by _classname
	 * @param obj
	 * @returns {*}
	 */
	lib.unlazy = function (obj) {
		if (!obj || "object" !== typeof obj) return obj;
		if (obj.__currentlyUnlazied) {
			lib.warn("Cannot unlazy in circles", obj);
			return obj;
		}
		obj.__currentlyUnlazied = true;
		if (obj instanceof Array) {
			for (var i = 0, len = obj.length; i < len; i++) {
				obj[i] = lib.unlazy(obj[i]);
			}
		} else if (obj instanceof Object) {

			if (obj._classname && typeof obj.prop !== "function") {
				return lib.createInstance(obj._classname, obj.param);
			}

			for (var attr in obj) {
				if (obj.hasOwnProperty(attr) && attr !== "__currentlyUnlazied") {
					obj[attr] = lib.unlazy(obj[attr]);
				}
			}
		}
		delete obj.__currentlyUnlazied;

		return obj;
	};

	/**
	 * serialize object to a string
	 * @param ser
	 */
	lib.serialize = function (ser) {
		var prep = function (obj) {
			var copy;

			// Handle the 3 simple types, and null or undefined
			if (null === obj || "object" !== typeof obj) return obj;
			// prevent endless recursions
			if (obj.__currentlyPrepped) {
				lib.warn("Cannot serialize in circles", obj);
				return {};
			}

			for (var corename in lib.defined.core) {
				if (obj instanceof lib.defined.core[corename]) {
					return {
						"_classname": "core." + corename,
						"param": obj.valueOf()
					};

				}
			}
			obj.__currentlyPrepped = true;
			if (obj instanceof Array) {
				copy = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					copy[i] = prep(obj[i]);
				}
				delete obj.__currentlyPrepped;
				return copy;
			}
			if (obj instanceof Object) {
				copy = {};
				if (obj._classname && typeof obj.props === "function") {
					copy = {
						"_classname": obj._classname,
						"param": prep(obj.props())
					};
				} else {
					for (var attr in obj) {
						if (obj.hasOwnProperty(attr) && attr !== "__currentlyPrepped") {
							copy[attr] = prep(obj[attr]);
						}
					}
				}
				delete obj.__currentlyPrepped;
				return copy;
			}
			delete obj.__currentlyPrepped;
			lib.warn("Could not serialze", obj);
			return obj;
		};
		return JSON.stringify(prep(ser));
	};

	/**
	 * deserialize a string
	 * @param ser
	 */
	lib.deserialize = function (ser) {
		return lib.unlazy(JSON.parse(ser));
	};


	/**
	 * Find a class by its name
	 * @param classname
	 * @returns {Class}
	 */
	lib.forName = function (classname) {
		var ns = classname.split("."),
			cur = lib.defined;

		for (var i = 0, ito = ns.length - 1; i < ito; i++) {
			if (!cur[ns[i]]) {
				break;
			}
			cur = cur[ns[i]];
		}
		return cur[ns[ns.length - 1]];
	};

	/**
	 * instantiate a class by its name. shorthand for new (Class)(options)
	 * @param classname
	 * @param options
	 * @returns {Class}
	 */
	lib.createInstance = function () {
		var classname, options;
		if (typeof arguments[0]==="string") {
			var clz = lib.forName(arguments[0]);

			if (!clz) {
				lib.warn("Class " + arguments[0] + " not found.");
				return null;
			}
			return new clz(arguments[1]);
		}
		return new this(arguments[0]);
	};

	/**
	 * extend a class
	 * parameters:
	 *   (superclass, classname, overrides)
	 *   (classname, overrides)
	 *   (overrides)
	 * @returns (Class)
	 */
	lib.define = function () {
		var superclass = lib,
			classname,
			overrides = {};

		if (arguments.length >= 3) {
			superclass = lib.forName(arguments[0]);
			classname = arguments[1];
			overrides = arguments[2];
		} else if (arguments.length === 2) {
			classname = arguments[0];
			overrides = arguments[1];
		} else if (arguments.length === 1) {
			overrides = arguments[0];
		}
		return superclass.extend(classname, overrides);
	};

	/**
	 * Classname property
	 * @type {string}
	 * @private
	 */
	lib.prototype._classname = "Class";

	/**
	 * default property values.
	 * @type {{}}
	 */
	lib.prototype.defaults = {};

	/**
	 * Create a string representation
	 * @returns {string|string}
	 */
	lib.prototype.toString = function () {
		return this._classname + "(" + lib.serialize(this.props()) + ")";
	};

	/**
	 * Find out if object is an instance of a class
	 * @param clzname
	 * @returns {boolean}
	 */
	lib.prototype.instanceOf = function (clzname) {
		var cur = this;
		while (cur) {
			if (cur._classname === clzname) {
				return true;
			}

			if (!cur._super) {
				return false;
			}
			cur = cur._super.prototype;
		}
		return false;
	};

	/**
	 * clone object
	 * @returns {lib}
	 */
	lib.prototype.clone = function () {
		return new this(lib.clone(this.props()));
	};

	/**
	 * serialize object
	 * @returns {String}
	 */
	lib.prototype.serialize = function () {
		return lib.serialize(this);
	};

	/**
	 * base class init method, sets passed properties to privatees
	 * @param options
	 */
	lib.prototype.init = function (options) {
		var props = {};

		lib.merge(props, JSON.parse(lib.serialize(this.defaults)), options );
		props = lib.unlazy(props);

		this.setProp = function (name, value) {
			props[name] = value;
		};

		this.unsetProp = function (name) {
			if (typeof props[name] !== "undefined") {
				delete props[name];
			}
		};

		this.prop = function (name) {
			return props[name];
		};

		this.props = function () {
			return props;
		};

		this.id = ++lib.instancesCreated;
	};


	/**
	 * extend a class by methods
	 * @params (optional)
	 * (String) classname
	 * (object) ovverides
	 * @returns {class}
	 */
	lib.extend = function () {
		var clzname,
			overrides;
		if (arguments.length === 2 && typeof arguments[0] === "string") {
			clzname = arguments[0];
			if (typeof arguments[1] === "function") {
				overrides = {init: arguments[1]};
			} else {
				overrides = arguments[1];
			}
		}  else if (arguments.length === 1) {
			if (typeof arguments[0] === "function") {
				overrides = {init: arguments[0]};
			} else {
				overrides = arguments[0];
			}

		} else {
			overrides = {};
		}

		var init = overrides.init ? overrides.init : undefined;
		var clz = function (options) {
			if (!this._initializing) {
				var sp = this._super;
				var inits = [];
				if (this.init) {
					inits.push(this.init);
				}
				while (sp) {
					if (sp.prototype.init) inits.push(sp.prototype.init);
					sp = sp.prototype._super;
				}
				for (var i = inits.length - 1; i >= 0; i--) {
					inits[i].call(this, options);
				}

			}
		};
		this.prototype._initializing = true;
		var proto = clz.prototype = new this();
		proto._super = this;
		if (typeof clzname !== "undefined") {
			proto._classname = clzname;
		}
		delete this.prototype._initializing;
		var defaults;

		if (overrides.defaults) {
			defaults = lib.merge({}, proto.defaults, overrides.defaults);
		} else {
			defaults = lib.merge({}, proto.defaults);
		}
		lib.merge(proto, this, overrides);

		proto.init = init;
		proto.defaults = JSON.parse(lib.serialize(defaults));

		clz.extend = function () {
			return lib.extend.apply(clz, arguments);
		};

		clz.createInstance = function () {
			return lib.createInstance.apply(clz, arguments);
		};

		if (clzname) {
			var ns = clzname.split("."),
				cur = lib.defined;

			for (var i = 0, ito = ns.length - 1; i < ito; i++) {
				if (!cur[ns[i]]) {
					cur[ns[i]] = {};
				}
				cur = cur[ns[i]];
			}
			cur[ns[ns.length - 1]] = clz;
		}
		return clz;
	};
	return lib;
})();

// expose node module
if (typeof module !== "undefined") {
	module.exports = classes;
}