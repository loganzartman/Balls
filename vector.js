var Vector = function(x,y) {
	this.x = x;
	this.y = y;
}
Vector.fromDir = function(angle, mag) {
	mag = typeof mag === "number" ? mag : 1;
	return new Vector(
		Math.cos(angle) * mag,
		Math.sin(angle) * mag
	);
};
Vector.prototype.add = function(v) {
	return new Vector(this.x + v.x, this.y + v.y);
};
Vector.prototype.sub = function(v) {
	return new Vector(this.x - v.x, this.y - v.y);
};
Vector.prototype.negate = function() {
	return new Vector(-this.x, -this.y);
};
Vector.prototype.mult = function(a) {
	if (typeof a === "number")
		return new Vector(this.x * a, this.y * a);
	else if (a instanceof Vector)
		return new Vector(this.x * a.x, this.y * a.y);
	else
		throw new Error("Vector multiplication error");
};
Vector.prototype.dot = function(v) {
	return this.x*v.x + this.y*v.y;
};
Vector.prototype.len = function() {
	return Math.sqrt(this.x*this.x + this.y*this.y);
};
Vector.prototype.dir = function() {
	return Math.atan2(this.y, this.x);
};
Vector.prototype.clone = function() {
	return new Vector(this.x, this.y);
};
Vector.prototype.normalize = function() {
	var len = this.len();
	if (len === 0) return new Vector(0,0);
	return new Vector(this.x / len, this.y / len);
};
Vector.prototype.unit = Vector.prototype.normalize;