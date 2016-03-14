(function (lib) {
	"use strict";


	(function(gobj) {
		lib.core = {};
		["String", "Boolean", "Date", "Number"].forEach(function(clzname) {
			lib.core[clzname] = gobj[clzname];
		});

	})(typeof window !== "undefined" ? window : global);

	/**
	 * output a warning message
	 * @param msg
	 */
	lib.warn = function () {
		console.warn(arguments);
	};

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

			for (var corename in lib.core) {
				if (obj instanceof lib.core[corename]) {
					return {
						"_classname": "core."+corename,
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
				if (obj._classname) {
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
		var unprep = function (obj) {
			var copy;

			if (null === obj || "object" !== typeof obj) return obj;

			if (obj instanceof Array) {
				copy = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					copy[i] = unprep(obj[i]);
				}
				return copy;
			}

			if (obj instanceof Object) {
				copy = {};

				if (obj._classname) {
					return lib.createInstance(obj._classname, obj.param);
				}
				for (var attr in obj) {
					if (obj.hasOwnProperty(attr)) {
						copy[attr] = unprep(obj[attr]);
					}
				}

				return copy;
			}
			lib.warn("Could not unprep ", obj);
			return undefined;
		};
		return unprep(JSON.parse(ser));
	};

	/**
	 * Find a class by its name
	 * @param classname
	 * @returns {Class}
	 */
	lib.forName = function (classname) {
		var ns = classname.split("."),
			cur = lib;

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
	lib.createInstance = function (classname, options) {
		var clz = lib.forName(classname);

		if (!clz) {
			lib.warn("Class " + classname + " not found.");
			return null;
		}
		return new clz(options);
	};

	/**
	 * extend a class
	 * parameters:
	 *   (superclass, classname, overrides)
	 *   (classname, overrides)
	 *   (overrides)
	 * @returns (Class)
	 */
	lib.extend = function () {
		var superclass = lib.Class,
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
	 * Base class constructor
	 * @param options
	 * @constructor
	 */
	lib.Class = function (options) {
	};

	/**
	 * Classname property
	 * @type {string}
	 * @private
	 */
	lib.Class.prototype._classname = "Class";

	/**
	 * default property values.
	 * @type {{}}
	 */
	lib.Class.prototype.defaults = {};

	/**
	 * Create a string representation
	 * @returns {string|string}
	 */
	lib.Class.prototype.toString = function () {
		return this._classname + "(" + lib.serialize(this.props()) + ")";
	};

	/**
	 * Find out if object is an instance of a class
	 * @param clzname
	 * @returns {boolean}
	 */
	lib.Class.prototype.instanceOf = function (clzname) {
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
	 * @returns {lib.Class}
	 */
	lib.Class.prototype.clone = function () {
		return new this(lib.clone(this.props()));
	};
	/**
	 * base class init method, sets passed properties to privatees
	 * @param options
	 */
	lib.Class.prototype.init = function (options) {
		var props = {};

		lib.merge(props, lib.clone(this.defaults), options);

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

	};

	/**
	 * create instance of class
	 * @param options
	 * @returns {lib.Class}
	 */
	lib.Class.createInstance = function (options) {
		return new this(options);
	};
	/**
	 * extend a class by methods
	 * @params (optional)
	 * (String) classname
	 * (object) ovverides
	 * @returns {class}
	 */
	lib.Class.extend = function () {
		var clzname,
			overrides;
		if (arguments.length === 2 && typeof arguments[0] === "string") {
			clzname = arguments[0];
			if (typeof arguments[1] === "function") {
				overrides = {init: arguments[1]};
			} else {
				overrides = arguments[1];
			}
		} else if (arguments.length === 1) {
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
		proto.defaults = lib.clone(defaults);

		clz.extend = function () {
			return lib.Class.extend.apply(clz, arguments);
		};

		clz.createInstance = function () {
			return lib.Class.createInstance.apply(clz, arguments);
		};

		if (clzname) {
			var ns = clzname.split("."),
				cur = lib;

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

})(typeof module !== "undefined" ? module.exports = {} : classes = {});