if (typeof classes==="undefined") {
	var classes = require("../dist/classes.js");
}

classes.extend("vehicles.Vehicle", {
	"defaults": {
		"km": 0,
		"wheels": 0,
		"motorized": false
	},
	"init": function () {
		this.setProp("vehicle-init", true);
	}
});

classes.extend("vehicles.Vehicle", "vehicles.Car", {
	"defaults": {
		"wheels": 4,
		"motorized": true
	},
	"init": function () {
		this.setProp("car-init", true);
	}
});

classes.extend("vehicles.Vehicle" ,"vehicles.Bike", {
	"defaults": {
		"wheels": 2
	},
	"init": function () {
		this.setProp("bike-init", true);
	}
});