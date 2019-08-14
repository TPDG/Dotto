window.onload = function(){ 
	document.getElementById("button").style.visibility = "hidden";
	startGame(); 
}

var canvasWidth = 1558;
var canvasHeight = 738;
var uiWidth = 1360;
var uiHeight = 660;
var hero;
var enemy = [];
var point = [];
var spawnX = 0, spawnY = 0;
var maxSpawnSize = 2000;
var gameStarted = false;

var x, y, ss, time = [0,0];

//img's
var img = new Image();
var logo = new Image();
var textback = new Image();
img.src = 'graphic/settings.png';
logo.src = 'graphic/logo.png';
textback.src = 'graphic/textback.png';

//sounds
var pointPop;
var endGameSound;
var mainSong;

function startGame() {
	myGameArea.start();

	pointPop = new sound("sounds/Pop.mp3");
	endGameSound = new sound("sounds/end.wav");
	mainSong = new sound("sounds/mainsong.mp3");

 	hero = new component(30,"rgba(255,0,50,0.8)",canvasWidth/2, canvasHeight/2);

 	for(i = 0; i<2; i++)
 	{
 		x = (Math.floor(Math.random() * (maxSpawnSize - 5)));   
   		y = (Math.floor(Math.random() * (maxSpawnSize - 5)));
   		ss = (Math.floor(Math.random() * (200)) + 50);
 		enemy[i] = new component(60,"rgba(50,0,"+ ss +",0.9)",x, y);
 	}

  	enemy[2] = new component(0,"rgba(0,0,255,0.7)",-1500, -300);

 	for(i = 0; i<=500; i++)
 	{
    	x = (Math.floor(Math.random() * (maxSpawnSize - 5)));   
    	y = (Math.floor(Math.random() * (maxSpawnSize - 5)));
    	ss = (Math.floor(Math.random() * (200)) + 80);
   		point.push(new component(5, "rgba(50," + ss +",50, 1)", x, y));
 	}

}

var myGameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 16);

  //event lisener
  window.addEventListener('keydown', function (e) {
            e.preventDefault();
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
  window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
  clear : function() {
    this.context.clearRect(-300, -300, 2310, 2310);
  }
}

function component(radius,color,x,y){
	this.x = x;
	this.y = y;
	this.speedX = 0;
    this.speedY = 0;
    this.score = 0;
    this.fat = 0;

	this.update = function(){
		this.radius = (radius + this.score) - this.fat;
		ctx = myGameArea.context; 
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
	}
	//change position
	this.newPos = function(){
		this.x += this.speedX;
		this.y += this.speedY;
	}
	//colision detection
	this.crashWith = function(otherobj) {
    var distanceX = this.x - otherobj.x;
    var distanceY = this.y - otherobj.y;
    var radiusSum = this.radius + otherobj.radius;
    var crash = false;
    if(distanceX * distanceX + distanceY * distanceY <= radiusSum * radiusSum)
    {
    	crash = true;
    }
    return crash;
  }
}

//sound control
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
} 

//game
function updateGameArea() {

	ctx = myGameArea.context;
	var ui_ctx = document.getElementById("ui").getContext('2d');

	if(hero.radius < 1){
		endgame();
		return;
	}

	if(hero.radius > 30 || hero.score > 5){
		hero.fat += hero.radius*0.001;
	}

	myGameArea.clear();
  	resize();

  	//background
  	ctx.fillStyle = "gray";
  	ctx.strokeStyle = "rgba(128,128,128,0.5)";
  	ctx.lineWidth = 3;
  	ctx.setLineDash([15, 10]);
  	ctx.strokeRect(-3, -3, 2003, 2003);
  
	//spawn new points
 	 myGameArea.frameNo += 1;
  	if (everyinterval(25) && point.length <= 500){
    	x = (Math.floor(Math.random() * (maxSpawnSize - 5)));   
    	y = (Math.floor(Math.random() * (maxSpawnSize - 5)));
    	ss = (Math.floor(Math.random() * (200)) + 80);
    	point.push(new component(5, "rgba(50," + ss +",50, 1)", x, y));
	}
	for (i = 0; i < point.length; i += 1) {
		point[i].update();
	}

	ui_ctx.clearRect(0,0,uiWidth,uiHeight);

	if(gameStarted == true){
		collision();
  		camera();
  		movement();
		enemyAI();
		for (i = 0; i < enemy.length; i += 1) {
   	    	enemy[i].newPos();
   	    	enemy[i].update();
 		}
  
  		hero.newPos();  
  		hero.update();

  		//points score
  		ctx.beginPath();
  		ctx.lineTo(250 - spawnX,0 - spawnY);
 		ctx.lineTo(230 - spawnX,50 - spawnY);
 		ctx.lineTo(0 - spawnX,50 - spawnY);
 		ctx.lineTo(0 - spawnX,0 - spawnY);
  		ctx.closePath();
 		ctx.fill();

  		ctx.font = "30px Lucida Console";
  		ctx.fillStyle = "rgba(0,0,0,0.8)";
 		ctx.fillText("Points: " + hero.score, 15 - spawnX, 35 - spawnY); 3

 		console.log(time[0]);
  		if(everyinterval(60)){
  			if(time[0]% 15 == 0){
  				x = (Math.floor(Math.random() * (maxSpawnSize - 5)));   
    			y = (Math.floor(Math.random() * (maxSpawnSize - 5)));
    			ss = (Math.floor(Math.random() * (80)) + 50);
  				enemy.push(new component(ss, "rgba(50,0," + ss + ",0.8)", x, y));
  			}
  			//time count
  			if(time[0] == 60){
  				time[0] = 0; 
  				time[1]++;
  			} 
  			time[0]++;
  		}
  	}else{
  	menu();
  	}
}

function everyinterval(n) {
	if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
	return false;
}

var speed = 2;
function movement(){
  	if (myGameArea.keys && myGameArea.keys[65] && hero.speedX >= -speed) {hero.speedX -= 1;} 
    if (myGameArea.keys && myGameArea.keys[68] && hero.speedX <=  speed) {hero.speedX += 1;}
    if (myGameArea.keys && myGameArea.keys[87] && hero.speedY >= -speed) {hero.speedY -= 1;}
    if (myGameArea.keys && myGameArea.keys[83] && hero.speedY <=  speed) {hero.speedY += 1;}

   // if (hero.speedX > 0) {hero.speedX -= 0.3;} else if (hero.speedX < 0) {hero.speedX += 0.3;}
   // if (hero.speedY > 0) {hero.speedY -= 0.3;} else if (hero.speedY < 0) {hero.speedY += 0.3;}
}

var range = 600, enemySpeed = 0.75;
function enemyAI(){
	//enemy follow 
	for (i = 0; i < enemy.length; i += 1) {
	if(hero.x>enemy[i].x - range && hero.x<enemy[i].x + range)
        {
        	if(hero.y>enemy[i].y - range && hero.y<enemy[i].y + range)
            {
                if (enemy[i].x != hero.x || enemy[i].y != hero.y)
                {
                    if(enemy[i].x >= hero.x && enemy[i].speedX >= -enemySpeed)
                    {
                    	enemy[i].speedX -= enemySpeed;
                    }
                    if(enemy[i].x <= hero.x && enemy[i].speedX <= enemySpeed)
                    {
                        enemy[i].speedX += enemySpeed;
                    }
                    if(enemy[i].y >= hero.y && enemy[i].speedY >= -enemySpeed)
                    {
                        enemy[i].speedY -= enemySpeed;
                    }
                    if(enemy[i].y <= hero.y && enemy[i].speedY <= enemySpeed)
                    {
                        enemy[i].speedY += enemySpeed;
                    }
                }
            }else{enemy[i].speedX = 0;}
        }else{enemy[i].speedY = 0;}
    }
}

function camera(){ 	
   	//camera lock
    if(hero.x < canvasWidth/2 - 20 ^ hero.x > maxSpawnSize - canvasWidth/2 + 20)
    	{
    		if(hero.y < canvasHeight/2 - 20 ^ hero.y > maxSpawnSize - canvasHeight/2 + 20){
    			ctx.translate(0, 0);
    		}
    		else{
    			ctx.translate(0,-hero.speedY);
				spawnY -= hero.speedY;
    		}
		}
		else if(hero.y < canvasHeight/2 - 20 ^ hero.y > maxSpawnSize - canvasHeight/2 + 20)
		{
			ctx.translate(-hero.speedX, 0);
			spawnX -= hero.speedX;
		}
		else{
			ctx.translate(-hero.speedX, -hero.speedY);
			spawnX -= hero.speedX;
			spawnY -= hero.speedY;
		}
    }

function collision(){
  //boundaries collision
  if(hero.x >= maxSpawnSize - hero.radius){hero.x = maxSpawnSize - hero.radius;}
  if(hero.x <= hero.radius){hero.x = hero.radius;}
  if(hero.y >= maxSpawnSize - hero.radius){hero.y = maxSpawnSize - hero.radius;}
  if(hero.y <= hero.radius){hero.y = hero.radius;}

  //hero-point collision
  for (i = 0; i < point.length; i += 1) {
        if (hero.crashWith(point[i])) {
  			hero.score += 1;
  			point.splice(i,1);
  			pointPop.play();
 		}
    }
 /*//enemy-point collision
 if(enemy.radius <= 300){
 	for(i = 0; i < enemy.length; i += 1){
 		for(j = 0; j < point.length; j += 1){
 			if(enemy[i].crashWith(point[j])){
 			enemy[i].score +=1;
 			point.splice(j,1);
 			}	
 		}
 	}
 }*/
 	//hero-enemy collision
 	for (i = 0; i < enemy.length; i += 1) {
 	    if (hero.crashWith(enemy[i]) && enemy[i].radius <= hero.radius){
 			enemy[i].score += 0.01;
  			hero.fat += 0.01;
  		}
 		if (hero.crashWith(enemy[i]) && enemy[i].radius > hero.radius){
 			enemy[i].score += 0.5;
  			hero.fat += 0.5;
  		}
 	}
}

function resize() {
    var canvas = document.querySelector("canvas");
    var ui_canvas = document.getElementById("ui");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = myGameArea.width / myGameArea.height;

    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowHeight / gameRatio) + "px";
        ui_canvas.style.width = windowWidth/1.2 + "px";
        ui_canvas.style.height = (windowHeight / gameRatio)/1.2 + "px";
    }
    else{
        canvas.style.width = (windowWidth * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
        ui_canvas.style.width = (windowWidth * gameRatio)/1.2 + "px";
        ui_canvas.style.height = windowHeight/1.2 + "px";
    }
}

var ii = 0;
var dots = ".";
function menu(){
	var ui = document.getElementById("ui");
	var ui_ctx = ui.getContext('2d');

	ui.addEventListener("click", function (evt) {
    var mousePos = getMousePos(ui, evt);
    gameStarted = true;
    mainSong.stop();
	}, false);

	if(gameStarted == false){
	//mainSong.play();
	ui_ctx.fillStyle = 'rgba(255,255,255,0.65)';
	ui_ctx.fillRect(0,0,uiWidth,uiHeight);

	var grad = ctx.createRadialGradient(1000, 600, 950, 512, 2100, 150);
  	grad.addColorStop(0, 'rgba(100,100,100,1)');
  	grad.addColorStop(1, 'rgba(0,255,255,1)');
  	ui_ctx.fillStyle = grad;

	ui_ctx.beginPath();
	ui_ctx.arc(uiWidth - 200, 100, 450, 0, Math.PI * 2, false);
	ui_ctx.fill();

	grad = ctx.createRadialGradient(-600, 300, 950, 512, 2100, 150);
  	grad.addColorStop(0, 'rgba(100,100,100,1)');
  	grad.addColorStop(1, 'rgba(255,0,179,1)');

	ui_ctx.fillStyle = grad;
	ui_ctx.beginPath();
	ui_ctx.arc(225, uiHeight - 200, 150, 0, Math.PI * 2, false);
	ui_ctx.fill();

	ui_ctx.drawImage(textback,(uiWidth/2) - textback.width/2, uiHeight - 125);	
	ui_ctx.font = "30px Lucida Console";
	ui_ctx.fillStyle = 'rgba(0,0,0,0.85)';
	ui_ctx.textAlign = "center";
	ui_ctx.fillText("Click anywhere to start", uiWidth/2 - 10, uiHeight - 75);
	ui_ctx.textAlign = "left";
	ui_ctx.fillText(dots, uiWidth/2 + 200, uiHeight - 75);

	if(everyinterval(30)){
		if(dots == "..."){dots = "";}else{dots += ".";}
	}

	ui_ctx.drawImage(textback,(uiWidth/2) - textback.width/3, 110, textback.width/1.5, 120);	
	ui_ctx.font = "100px Lucida Console";
	ui_ctx.textAlign = "center";
	ui_ctx.fillText("Dotto", uiWidth/2, 200);
	
	//settings rotation
	ui_ctx.save();
	ui_ctx.globalAlpha = 0.8;
	ui_ctx.translate(uiWidth - 50, 50);
	ui_ctx.rotate(ii);
	ui_ctx.drawImage(img, -(50/2), -(50/2), 50, 50);
	ui_ctx.restore();
	if(ii>=1){ii = 0;}else{ii+=0.02;}
    }

}

//Mouse Position
	function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function endgame(){
	var ui_ctx = document.getElementById("ui").getContext('2d');
	document.getElementById("button").style.visibility = "visible";
		if(gameStarted == true){
			endGameSound.play();
			gameStarted = false;
		}

		ui_ctx.clearRect(0,0,uiWidth,uiHeight);
		ui_ctx.fillStyle = 'rgba(255,255,255,0.65)';
  		ui_ctx.fillRect(200,100,uiWidth - 400,uiHeight - 200);
  		ui_ctx.font = "50px Lucida Console";
		ui_ctx.fillStyle = "black";
		ui_ctx.textAlign = "center";
		ui_ctx.fillText("GAME OVER", uiWidth/2, uiHeight/2 - 100);
		ui_ctx.font = "40px Lucida Console";
		ui_ctx.fillText("Score: " + hero.score, uiWidth/2, uiHeight/2);
		ui_ctx.fillText("Time alive: " + time[1] + "min " + time[0] + "sec", uiWidth/2, uiHeight/2 + 50);
}

function restart(){
	location.reload();
}

		//hero-enemy
        /*if (hero.crashWith(enemy[i]) && enemy[i].radius < hero.radius) {
  		hero.score += enemy[i].radius;
  		console.log(hero.score);
  		enemy.splice(i,1);
 		}*/

 		//enemy-enemy collision
 		/*if(enemyJump == true){
 		if(enemy[0].crashWith(enemy[1])){
 			if(hero.x > enemy[0].x){enemy[0].speedX += 1;}else{enemy[0].speedX -= 1;}
 			if(hero.y > enemy[0].y){enemy[0].speedY += 1;}else{enemy[0].speedY -= 1;}
 		}
}*/