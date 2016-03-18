if (typeof classes==="undefined") {
	var classes = require("../dist/classes.js");
}

classes.extend("vehicles.Owner", {
	"defaults": {
		"name": "owner"
	}
});

classes.extend("vehicles.Vehicle", {
	"defaults": {
		"km": 0,
		"wheels": 0,
		"motorized": false,
		"owner":classes.createInstance("vehicles.Owner", {"name":"nobody"})
	},
	"init": function () {
		this.setProp("vehicle-init", true);
	}
});

classes.extend("vehicles.Vehicle", "vehicles.Car", {
	"defaults": {
		"wheels": 4,
		"motorized": true,
		"owner":classes.createInstance("vehicles.Owner",{"name":"cardriver"})
	},
	"init": function () {
		this.setProp("car-init", true);
	}
});

classes.extend("vehicles.Vehicle" ,"vehicles.Bike", {
	"defaults": {
		"wheels": 2,
		"owner":classes.createInstance("vehicles.Owner",{"name":"biker"})
	},
	"init": function () {
		this.setProp("bike-init", true);
	}
});