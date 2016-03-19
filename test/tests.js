if (typeof chai === "undefined") {
	var chai = require("chai");
}
if (typeof classes === "undefined") {
	var classes = require("../dist/classes.js");
}
chai.should();

describe('Defining classes', function () {

	it('Class vehicles.Vehicle can be found by name.', function () {
		chai.expect(classes.forName("vehicles.Vehicle")).to.be.a("function");
	});
	it('Class vehicles.Car can be found by name.', function () {
		chai.expect(classes.forName("vehicles.Car")).to.be.a("function");
	});
	it('Class vehicles.Bike can be found by name.', function () {
		chai.expect(classes.forName("vehicles.Bike")).to.be.a("function");
	});
	it('Class vehicles.EBike can be found by name.', function () {
		chai.expect(classes.forName("vehicles.EBike")).to.be.a("function");
	});

	it('Classes are instantiable via name and class', function () {
		["vehicles.Vehicle", "vehicles.Car", "vehicles.Bike", "vehicles.EBike"].forEach(function (clz) {
			var v = classes.createInstance(clz, {});
			chai.expect(v._classname).to.equal(clz);

			v = classes.forName(clz).createInstance();
			chai.expect(v._classname).to.equal(clz);
		});
	});

	it('Instance of', function () {
		var car = new classes.defined.vehicles.Car();
		chai.expect(car.instanceOf("vehicles.Vehicle")).to.equal(true);
		chai.expect(car.instanceOf("vehicles.Car")).to.equal(true);
		chai.expect(car.instanceOf("vehicles.Bike")).to.equal(false);

		var bike = new classes.defined.vehicles.Bike();
		chai.expect(bike.instanceOf("vehicles.Vehicle")).to.equal(true);
		chai.expect(bike.instanceOf("vehicles.Car")).to.equal(false);
		chai.expect(bike.instanceOf("vehicles.Bike")).to.equal(true);
	});
});
describe('Properties', function () {
	it('Created objects have gettable and settable properties', function () {
		var car = classes.createInstance("vehicles.Car",{prop: "prop"});
		chai.expect(car.prop("prop")).to.equal("prop");
		car.setProp("prop", "prop-new");
		chai.expect(car.prop("prop")).to.equal("prop-new");

		var bike = classes.createInstance("vehicles.Bike",{prop: "prop"});
		chai.expect(bike.prop("prop")).to.equal("prop");
		bike.setProp("prop", "prop-new");
		chai.expect(bike.prop("prop")).to.equal("prop-new");

	});

	it('Default properties are set and can be overwritten by constructor options', function () {
		chai.expect(classes.createInstance("vehicles.Vehicle").prop("km")).to.equal(0);
		chai.expect(classes.createInstance("vehicles.Vehicle", {"km": 100}).prop("km")).to.equal(100);
		chai.expect(classes.createInstance("vehicles.Vehicle").prop("wheels")).to.equal(0);
		chai.expect(classes.createInstance("vehicles.Vehicle").prop("motorized")).to.equal(false);

		chai.expect(classes.createInstance("vehicles.Bike").prop("km")).to.equal(0);
		chai.expect(classes.createInstance("vehicles.Bike", {"km": 200}).prop("km")).to.equal(200);
		chai.expect(classes.createInstance("vehicles.Bike").prop("wheels")).to.equal(2);
		chai.expect(classes.createInstance("vehicles.Bike").prop("motorized")).to.equal(false);

		chai.expect(classes.createInstance("vehicles.Car").prop("km")).to.equal(0);
		chai.expect(classes.createInstance("vehicles.Car", {"km": 300}).prop("km")).to.equal(300);
		chai.expect(classes.createInstance("vehicles.Car").prop("wheels")).to.equal(4);
		chai.expect(classes.createInstance("vehicles.Car").prop("motorized")).to.equal(true);


	});
});
describe('Inheritance', function () {
	it('Init methods are called along with ther super implementations', function () {
		var car = classes.createInstance("vehicles.Car",{prop: "prop"});
		chai.expect(car.prop("vehicle-init")).to.equal(true);
		chai.expect(car.prop("car-init")).to.equal(true);
		chai.expect(car.prop("bike-init")).to.equal(undefined);

		var bike = classes.createInstance("vehicles.Bike",{prop: "prop"});
		chai.expect(bike.prop("vehicle-init")).to.equal(true);
		chai.expect(bike.prop("bike-init")).to.equal(true);
		chai.expect(bike.prop("car-init")).to.equal(undefined);
	});
});

describe('Serializing and Deserializing', function () {
	var date = new Date();
	date.setFullYear(1995);
	var s = classes.serialize({
		"string": "prop",
		"stringobject": new String("str"),
		"num": new Number(1),
		"int" :27,
		"float" :0.5,
		"bool": true,
		"boolobject": new Boolean(true),
		"date": date,
		"obj": classes.createInstance("vehicles.Bike", {"km":42}),
		"another": classes.forName("vehicles.Car").createInstance()
	});
	var o = classes.deserialize(s);

	it('Serializing returns string', function () {
		chai.expect(classes.serialize({"banana":"cool"})).to.be.a("string");
		chai.expect(classes.createInstance("vehicles.Bike", {"km": 2}).serialize()).to.be.a("string");
	});

	it('Deserializing serialized object returns object', function () {
		chai.expect(o).to.be.a("object");
	});

	it('object string properties are deserialized correctly', function () {
		chai.expect(o.string).to.be.a("string");
		chai.expect(o.string).to.equal("prop");

		chai.expect(o.stringobject).to.be.a("string");
		chai.expect(o.stringobject.toString()).to.equal("str");
	});

	it('object number properties are deserialized correctly', function () {
		chai.expect(o.num).to.be.a("number");
		chai.expect(o.num.valueOf()).to.equal(1);

		chai.expect(o.int).to.be.a("number");
		chai.expect(o.int).to.equal(27);

		chai.expect(o.float).to.be.a("number");
		chai.expect(o.float).to.equal(0.5);
	});

	it('object boolean properties are deserialized correctly', function () {
		chai.expect(o.bool).to.be.a("boolean");
		chai.expect(o.bool).to.equal(true);

		chai.expect(o.boolobject).to.be.a("boolean");
		chai.expect(o.boolobject.valueOf()).to.equal(true);
	});

	it('object date properties are deserialized correctly', function () {
		chai.expect(o.date).to.be.a("date");
		chai.expect(o.date.getFullYear()).to.equal(1995);
	});

	it('object classobject properties are deserialized correctly', function () {
		chai.expect(o.obj).to.be.a("object");
		chai.expect(o.obj._classname).to.equal("vehicles.Bike");
		chai.expect(o.obj.prop).to.be.a("function");
		chai.expect(o.obj.prop("km")).to.be.a("number");
		chai.expect(o.obj.prop("km")).to.equal(42);
	});

	it('objects in properties of objects deserialized correctly', function () {
		chai.expect(o.obj.prop("owner")).to.be.a("object");
		chai.expect(o.obj.prop("owner")._classname).to.be.a("string");
		chai.expect(o.obj.prop("owner")._classname).to.equal("vehicles.Owner");
		chai.expect(o.obj.prop("owner").prop).to.be.a("function");
		chai.expect(o.obj.prop("owner").prop("name")).to.equal("biker");

	});
});