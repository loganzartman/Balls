var canvas, universe;
var Mouse = {x:0, y:0, startX:0, startY:0, down:false, grabbed: null, gOffset: null};
var BALL_RADIUS = 50;

window.addEventListener("load", function(){
	canvas = document.getElementById("display");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	document.body.appendChild(canvas);
	universe = new Universe(canvas.width, canvas.height, canvas, [60,60,60]);
	setInterval(function(){
		//these events need to be synced with universe stepping
		if (Mouse.up) {
			Mouse.up = false;
			if (Mouse.down === 2) {
				launchBall();
			}
			if (Mouse.down === 3 && Mouse.grabbed) {
				launchBall(Mouse.grabbed);
			}
			if (Mouse.grabbed) {
				Mouse.grabbed.holding = false;
			}
			Mouse.down = 0;
			Mouse.grabbed = null;
		}

		universe.step();
		if (Mouse.down === 1 && Mouse.grabbed) {
			var lpos = Mouse.grabbed.pos.clone();
			Mouse.grabbed.pos = new Vector(Mouse.x, Mouse.y).add(Mouse.gOffset);
			Mouse.grabbed.vel = Mouse.grabbed.pos.sub(lpos);
			Mouse.grabbed.applyTethers();
			var vy = Mouse.grabbed.vel.y;
			Mouse.grabbed.vel.y = Math.max(1e-3,Math.abs(vy))*(Math.sign(vy)||1);
		}
	}, 1000/60);

	resetGame();
	
	function md(event) {
		event.preventDefault();
		Mouse.down = event.ctrlKey ? 2 : event.shiftKey ? 3 : 1;
		Mouse.startX = event.pageX;
		Mouse.startY = event.pageY;
		if (Mouse.down !== 2) {
			universe.balls.forEach(function(ball){
				var disp = ball.pos.sub(new Vector(Mouse.x, Mouse.y));
				if (disp.len() < ball.r) {
					Mouse.grabbed = ball;
					if (Mouse.down === 2) Mouse.gOffset = disp;
					else {
						Mouse.gOffset = new Vector(0,0);
						Mouse.startX = ball.pos.x;
						Mouse.startY = ball.pos.y;
					}
					ball.holding = true;
				}
			});
		}
	}
	function mm(event) {
		Mouse.x = event.pageX;
		Mouse.y = event.pageY;
	}
	function mu(event) {
		Mouse.up = true;
	}
	function td(event) {
		Mouse.down = 1;
		Mouse.startX = event.targetTouches[0].pageX;
		Mouse.startY = event.targetTouches[0].pageY;
		event.pageX = Mouse.startX;
		event.pageY = Mouse.startY;
		md(event);
	}
	function tm(event) {
		event.preventDefault();
		Mouse.x = event.targetTouches[0].pageX;
		Mouse.y = event.targetTouches[0].pageY;
	}
	function tu(event) {
		event.preventDefault();
		mu(event);
	}
	document.addEventListener("mousedown", md, false);
	document.addEventListener("mousemove", mm, false);
	document.addEventListener("mouseup", mu, false);
	document.addEventListener("touchstart", td, false);
	document.addEventListener("touchmove", tm, false);
	document.addEventListener("touchend", tu, false);
	document.addEventListener("keydown", function(event){
		if (event.keyCode === 32) resetGame();
	}, false);
}, false);

function resetGame() {
	universe.balls = [];
	universe.tethers = []
	var N = 7;
	var x0 = universe.w*0.5-BALL_RADIUS*N,
		y0 = universe.h * 0.7;
	for (var i=0; i<N; i++) {
		var ball = new Ball(
			universe,
			new Vector(x0 + BALL_RADIUS*i*2, y0),
			BALL_RADIUS,
			1,
			new Vector(0, 0),
			"white"
		);
		universe.createTether(
			ball,
			ball.pos.sub(new Vector(0, universe.h*0.5)),
			universe.h * 0.5,
			1
		);
		universe.add(ball);
	}
}

function makeTriangle(basePos, depth) {
	var colors = ["yellow", "blue", "red", "purple", "orange", "darkseagreen", "brown", "black"],
		cind = 0;
	for (var col=0; col<depth; col++) {
		for (var row=0; row<=col; row++) {
			var ball = new Ball(
				universe,
				basePos.add(new Vector(0,BALL_RADIUS*2*row)),
				BALL_RADIUS,
				1,
				new Vector(1e-5,1e-5),
				colors[cind=(cind+1)%colors.length]
			);
			universe.add(ball);
		}
		basePos.x += Vector.fromDir(Math.PI/6,BALL_RADIUS*2).x;
		basePos.y -= Vector.fromDir(Math.PI/6,BALL_RADIUS*2).y;
	}

	var ball = new Ball(
		universe,
		new Vector(universe.w * 0.3, universe.h * 0.5),
		BALL_RADIUS,
		1,
		new Vector(1e-5,1e-5),
		"white"
	);
	universe.add(ball);
}


function launchBall(ball) {
	var dpos = new Vector(Mouse.x,Mouse.y).sub(new Vector(Mouse.startX, Mouse.startY)).negate();
	dpos = dpos.mult(1/5);
	if (typeof ball === "undefined") {
		var ball = new Ball(
			universe,
			new Vector(Mouse.startX,Mouse.startY),
			BALL_RADIUS,
			1,
			dpos,
			"white"
		);
		universe.add(ball);
	}
	else ball.vel = dpos;
}

function rand(a,b) {
	if (typeof b === "undefined") {
		if (typeof a === "undefined") return rand(1);
		return rand(0,a);
	}
	return Math.random()*(b-a)+a;
}