var Universe = function(w,h,canvas,rgb) {
	this.balls = [];
	this.tethers = [];
	this.gravity = new Vector(0, 1);
	this.ballRestitution = 0.999;
	this.edgeRestitution = 1.0;
	this.airResistance = 0.0005; //or rolling friction
	this.minVel = 0.01;
	this.minStepSize = 1e-4;
	this.w = w;
	this.h = h;
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");
	this.color = this.ctx.createRadialGradient(this.w*0.5,this.h*0.4,0,this.w*0.5,this.h*0.4,Math.max(this.w*0.5,this.h*0.5));
	this.color.addColorStop(0, "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")");
	this.color.addColorStop(1, "rgb("+(rgb[0]-30)+","+(rgb[1]-30)+","+(rgb[2]-30)+")");
	this._blurSteps = 12;
	this.resolveSteps = 1;
	this.soundHit = new Howl({
		urls: ["hit_r.wav"],
		sprite: {
			hit: [0, 174]
		},
		volume: 0.4
	});
	this.soundBump = new Howl({
		urls: ["bump.wav"],
		sprite: {
			bump: [0, 528-174]
		},
		volume: 0.3
	});
};
Universe.prototype.createTether = function(ball, position, length, softness) {
	var tether = {
		ball: ball,
		pos: position,
		len: length,
		softness: softness
	};
	return this.tethers.push(tether);
};
Universe.prototype.add = function(ball) {
	if (this.balls.indexOf(ball) < 0) this.balls.push(ball);
};
Universe.prototype.getNear = function(ball) {
	return this.balls; //todo
};
Universe.prototype.getTethers = function(ball) {
	return this.tethers.filter(function(tether){
		return tether.ball === ball;
	});
};
Universe.prototype.step = function(dt) {
	if (this.balls.length > 0) {
		var steps = this.balls.reduce(function(prev, current){
			var pl = prev.vel.len(),
				cl = current.vel.len();
			return pl>cl?prev:current;
		}, this.balls[0]).vel.len();
		steps = 0.5*Math.max(2, Math.floor(steps)+1);
		
		var dpix = this.balls.map(function(ball){
			return ball.vel.len() / steps;
		});

		for (var s=0; s<steps; s++) {
			for (var i=this.balls.length-1; i>=0; i--) {
				if (dpix[i] > this.minStepSize) this.balls[i].stepDistance(dpix[i]);
			}
		}

		// for (var i=this.balls.length-1; i>=0; i--) {
		// 	if (this.balls[i]._collided[0]) {
		// 		//this.balls[i]._collided[0];
		// 		var id = this.soundBump.play("bump");
		// 		this.soundBump.volume(0.001, id);
		// 		this.balls[i]._collided[0] = false;
		// 	}
		// 	if (this.balls[i]._collided[1]) {
		// 		this.soundHit.volume = this.balls[i]._collided[1];
		// 		this.soundHit.play("hit");
		// 		this.balls[i]._collided[1] = false;
		// 	}
		// }
	}

	this.draw(dt);
};
Universe.prototype.draw = function() {
	this.ctx.fillStyle = this.color;
	this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
	for (var i=0; i<this.tethers.length; i++) {
		var tether = this.tethers[i];
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = "white";
		this.ctx.beginPath();
		this.ctx.moveTo(tether.pos.x, tether.pos.y);
		this.ctx.lineTo(tether.ball.pos.x, tether.ball.pos.y);
		this.ctx.stroke();
	}
	for (var i=this.balls.length-1; i>=0; i--) {
		var len = this.balls[i].vel.len();
		var blurStep = this.balls[i].vel.normalize().mult(len/this._blurSteps);
		var dx = blurStep.x,
			dy = blurStep.y;
		var steps = Math.min(~~len, this._blurSteps);
		this.ctx.globalAlpha = 1/(steps)+0.1;
		for (var z=-steps; z<=0; z++) {
			this.balls[i].draw(this.ctx, this.balls[i].pos.x+dx*z, this.balls[i].pos.y+dy*z);
		}
		this.ctx.globalAlpha = 1;
	}
	if (Mouse.down === 2 || Mouse.down === 3 && Mouse.grabbed) {
		this.ctx.save();
		this.ctx.strokeStyle = "white";
		this.ctx.lineWidth = 1;
		var diff = new Vector(Mouse.x, Mouse.y).sub(new Vector(Mouse.startX, Mouse.startY));
		this.ctx.translate(Mouse.startX, Mouse.startY);
		this.ctx.rotate(diff.dir());
		this.ctx.beginPath();
		if (Mouse.down === 2) this.ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI*2);
		this.ctx.moveTo(0, 0);
		var len = diff.len();
		this.ctx.lineTo(-len, 0);
		this.ctx.lineTo(-len+16, 8);
		this.ctx.lineTo(-len+16, -8);
		this.ctx.lineTo(-len, 0);
		this.ctx.stroke();
		this.ctx.restore();
	}
	this.canvas.style.cursor = Mouse.down===2 && Mouse.grabbed ? "move" : "default";
	this.ctx.font = "12pt sans-serif";
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "top";
	this.ctx.fillStyle = "rgb(255,215,215)";
	this.ctx.fillText("click and drag to move balls.", 8, 8);
	this.ctx.fillStyle = "rgb(215,255,215)";
	this.ctx.fillText("hold shift and drag to launch them.", 8, 8+18);
	this.ctx.fillStyle = "rgb(215,215,255)";
	this.ctx.fillText("hold control and drag to launch new ones.", 8, 8+18*2);
	this.ctx.fillStyle = "rgb(215,215,215)";
	this.ctx.fillText("press space to start over.", 8, 8+18*3);
};