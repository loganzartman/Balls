var Ball = function(universe, pos, r, mass, vel, color) {
	this.universe = universe;
	this.pos = pos;
	this.r = r;
	this.mass = mass;
	this.vel = typeof vel === "undefined" ? new Vector(0,0) : vel;
	this.vel = this.vel.add(this.universe.gravity);
	this.color = typeof color === "undefined" ? "black" : color;
	this.holding = false;
	this._collided = [false, false];
}
Ball.prototype.stepDistance = function(pixels) {
	var movement = this.vel.normalize().mult(pixels);
	var dt = movement.len() / this.vel.len();
	this.step(dt);
};
Ball.prototype.step = function(dt) {
	this.collideAny(this.universe.getNear(this));
	if (!this.holding) this.pos = this.pos.add(this.vel.mult(dt));
	this.boundsCheck(this.vel.mult(dt));
	this.vel = this.vel.add(this.universe.gravity.mult(dt));
	this.vel = this.vel.mult(1-(this.universe.airResistance*dt));
	// this.restCheck();
};
Ball.prototype.boundsCheck = function(dpos) {
	var dx0 = this.pos.x - this.r,
		dx1 = (this.universe.w - this.r) - this.pos.x,
		dy0 = this.pos.y - this.r,
		dy1 = (this.universe.h - this.r) - this.pos.y;
	if (dx0 < 0) {
		this._collided[0] = Math.min(1,(-dx0)/20);
		this.pos.x -= dx0 + (dpos.x + dx0);
		this.vel.x = -this.vel.x*this.universe.edgeRestitution;
	}
	if (dx1 < 0) {
		this._collided[0] = true;
		this.pos.x += dx1 + Math.min(1,(-dx1)/20);
		this.vel.x = -this.vel.x*this.universe.edgeRestitution;
	}
	if (dy0 < 0) {
		this._collided[0] = true;
		this.pos.y -= dy0 + Math.min(1,(-dy0)/20);
		this.vel.y = -this.vel.y*this.universe.edgeRestitution;
	}
	if (dy1 < 0) {
		this._collided[0] = true;
		this.pos.y += dy1 + Math.min(1,(-dy1)/20);
		this.vel.y = -this.vel.y*this.universe.edgeRestitution;
	}
};
Ball.prototype.restCheck = function() {
	if (Math.abs(this.vel.x) < this.universe.minVel) this.vel.x = 0;
	if (Math.abs(this.vel.y) < this.universe.minVel) this.vel.y = 0;
};
Ball.prototype.collideAny = function(balls) {
	for (var i=0; i<balls.length; i++) {
		if (balls[i] !== this && this.isColliding(balls[i])) {
			for (var z=0; z<this.universe.resolveSteps; z++) this.collide(balls[i]);
		}
	}
};
Ball.prototype.isColliding = function(ball) {
	return this.pos.sub(ball.pos).len() < ball.r + this.r;
};
Ball.prototype.collide = function(ball) {
	var displacement = this.pos.sub(ball.pos);
	if (displacement.len() === 0) throw new Error("d0");

	var overlap = displacement.len() - (this.r + ball.r);
	this.pos = this.pos.sub(displacement.normalize().mult(overlap*0.5));
	ball.pos = ball.pos.add(displacement.normalize().mult(overlap*0.5));
	
	var unitDisp = this.pos.sub(ball.pos).normalize();
	if (unitDisp.x === 0) unitDisp.x = 0.001;
	if (unitDisp.y === 0) unitDisp.y = 0.001;
	
	var tci = this.vel.dot(unitDisp),
		bci = ball.vel.dot(unitDisp);

	var tcf = bci,
		bcf = tci;

	this._collided[1] = Math.min(1, Math.abs(tcf-tci)/1000);
	this.vel = this.vel.add(unitDisp.mult(tcf-tci).mult(this.universe.ballRestitution));
	ball.vel = ball.vel.add(unitDisp.mult(bcf-bci).mult(ball.universe.ballRestitution));
};
Ball.prototype.draw = function(ctx,x,y) {
	ctx.fillStyle = this.color;
	ctx.beginPath();
	ctx.arc(x,y,this.r,0,Math.PI*2);
	ctx.fill();
};