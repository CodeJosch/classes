if (typeof classes==="undefined") {
	var classes = require("../dist/classes.js");
}


classes.define("vehicles.Owner", {
	"defaults": {
		"name": "owner"
	}
});

classes.define("vehicles.Vehicle", {
	"defaults": {
		"km": 0,
		"wheels": 0,
		"motorized": false,
		"owner":{_classname:"vehicles.Owner", param:{"name":"nobody"}}
	},
	"init": function () {
		this.setProp("vehicle-init", true);
	}
});

classes.define("vehicles.Vehicle", "vehicles.Car", {
	"defaults": {
		"wheels": 4,
		"motorized": true,
		"owner":{_classname:"vehicles.Owner",param:{"name":"cardriver"}}
	},
	"init": function () {
		this.setProp("car-init", true);
	}
});

classes.define("vehicles.Vehicle" ,"vehicles.Bike", {
	"defaults": {
		"wheels": 2,
		"owner":classes.createInstance("vehicles.Owner",{"name":"biker"})
	},
	"init": function () {
		this.setProp("bike-init", true);
	}
});

classes.define("vehicles.Bike" ,"vehicles.EBike", {
	"defaults": {
		"wheels": 2,
		"motorized": true,
		"owner":classes.createInstance("vehicles.Owner",{"name":"ebiker"})
	},
	"init": function () {
		this.setProp("ebike-init", true);
	}
});

classes.define("vehicles.planes.Plane", {
	"defaults": {
		"wheels": 2,
		"motorized": true,
		"owner":classes.createInstance("vehicles.Owner",{"name":"ebiker"})
	},
	"init": function () {
		this.setProp("ebike-init", true);
	}
});

classes.define("vehicles.planes.Plane","vehicles.planes.Concorde", {
	"defaults": {
		"wheels": 2,
		"motorized": true,
		"owner":classes.createInstance("vehicles.Owner",{"name":"ebiker"})
	},
	"init": function () {
		this.setProp("ebike-init", true);
	}
});