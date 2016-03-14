if (typeof chai === "undefined") {
	var chai = require("chai");
}
if (typeof classes === "undefined") {
	var classes = require("../dist/classes.js");
}

chai.should();

describe('Defining classes', function () {

	it('Classes can be found by name.', function () {
		chai.expect(classes.forName("vehicles.Vehicle")).to.be.a("function");
		chai.expect(classes.forName("vehicles.Car")).to.be.a("function");
		chai.expect(classes.forName("vehicles.Bike")).to.be.a("function");
	});

	it('Classes are instantiable', function () {
		["vehicles.Vehicle", "vehicles.Car", "vehicles.Bike"].forEach(function (clz) {
			var v = classes.createInstance(clz, {});
			chai.expect(v._classname).to.equal(clz);

			v = classes.forName(clz).createInstance();
			chai.expect(v._classname).to.equal(clz);
		})
	});

	it('Instance of', function () {
		var v = new classes.vehicles.Car();
		chai.expect(v.instanceOf("vehicles.Vehicle")).to.equal(true);
		chai.expect(v.instanceOf("vehicles.Car")).to.equal(true);
		chai.expect(v.instanceOf("vehicles.Bike")).to.equal(false);
	});
});
describe('Properties', function () {
	it('Created objects have gettable and settable properties', function () {
		var car = new classes.vehicles.Car({prop: "prop"});
		chai.expect(car.prop("prop")).to.equal("prop");
		car.setProp("prop", "prop-new");
		chai.expect(car.prop("prop")).to.equal("prop-new");

		var bike = new classes.vehicles.Bike({prop: "prop"});
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
		var car = new classes.vehicles.Car({prop: "prop"});
		chai.expect(car.prop("vehicle-init")).to.equal(true);
		chai.expect(car.prop("car-init")).to.equal(true);
		chai.expect(car.prop("bike-init")).to.equal(undefined);

		var bike = new classes.vehicles.Bike({prop: "prop"});
		chai.expect(bike.prop("vehicle-init")).to.equal(true);
		chai.expect(bike.prop("bike-init")).to.equal(true);
		chai.expect(bike.prop("car-init")).to.equal(undefined);
	});
});
describe('Serializing and Deserializing', function () {
	var date = new Date();
	date.setFullYear(1995);
	var s = classes.serialize({
		prop: "prop",
		"str": new String("str"),
		"num": new Number(1),
		"bool": new Boolean(true),
		"date": date,
		"obj": classes.createInstance("vehicles.Bike"),
		"another":classes.forName("vehicles.Car").createInstance()
	});
	var o = classes.deserialize(s);
	var s2 = classes.createInstance("vehicles.Bike", {"km":2}).serialize();

	it('Serializing returns string', function () {
		chai.expect(s).to.be.a("string");
		chai.expect(s2).to.be.a("string");
	});

	it('Deserializing returns object', function () {

		chai.expect(o).to.be.a("object");
	});

	it('object properties are deserialized correctly', function () {

		chai.expect(o.str).to.be.a("string");
		chai.expect(o.str.toString()).to.equal("str");

		chai.expect(o.num).to.be.a("number");
		chai.expect(o.num.valueOf()).to.equal(1);
		chai.expect(o.bool).to.be.a("boolean");
		chai.expect(o.bool.valueOf()).to.equal(true);

		chai.expect(o.prop).to.equal("prop");
		chai.expect(o.date).to.be.a("date");
		chai.expect(o.date.getFullYear()).to.equal(1995);
		chai.expect(o.obj).to.be.a("object");
		chai.expect(o.obj._classname).to.equal("vehicles.Bike");
	});
	it('object properties are deserialized correctly', function () {

	});
});