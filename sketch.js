let path;
let player;
let bullets;
let score;
let fontRegular;
let dead;
let resetButton;
let bulletTimer;
let started = false;
let debug = false;

function preload()
{
    fontRegular = loadFont('assets/Comfortaa-Regular.ttf');
}

function setup()
{
    createCanvas(600,600);
    frameRate(60);
    start();
}

function start()
{
    let pWidth = 300;
    score = 0;
    bulletTimer = 0;
    path = new Path(width/2, height/2 - pWidth / 2, pWidth);
    player = new Player(path,20);
    bullets = [];
    bullets.push(new Bullet(false));
    textAlign(CENTER);
    textFont(fontRegular);
    textSize(32);
    dead = false;
    resetButton = new Button(width/2 - 200,height/2 + 100, 400, 100, 50, "Retry?");
}

function draw()
{
    background(51);
    if(!started)
    {
        startPrompt();
    }
    if(!dead)
    {
        path.update();
        player.update();
    }
    path.show();
    player.show();
    for(let bullet of bullets)
    {
        if(!dead && started)
            bullet.update();
        bullet.show();
    }
    if(player.checkCollide(bullets))
    {
        dead = true;
    }
    if(frameCount >= 60 && frameCount % 60 === 0 && !dead && started) {
        score++;
        bulletTimer++;
        if (bulletTimer >= 25) {
            bullets.push(new Bullet(Math.random() >= 0.5));
            bulletTimer = 0;
        }
    }
    noStroke();
    fill(255);
    text(score,0,10,width,height);
    if(dead)
        endScreen();
}

function startPrompt()
{
    noStroke();
    fill(100,100,100,100);
    rect(0,0,width,height);
    fill(255);
    text("Wave",0,height/2 - 100,width,height);
    textSize(48);
    text("Press LEFT or RIGHT arrow to Start",0,height/2,width,height);
}

function endScreen()
{
    noStroke();
    fill(225,0,0,100);
    rect(0,0,width,height);
    fill(255);
    text("You Died!",0,height/2 - 100,width,height);
    textSize(48);
    text(`Your Score Was: ${score}`,0,height/2,width,height);
    resetButton.show()
}

function keyPressed()
{
    switch(keyCode)
    {
        case RIGHT_ARROW:
            if(!started) started = true;
            path.right = true;
            break;
        case LEFT_ARROW:
            if(!started) started = true;
            path.left = true;
            break;
        case 32:
            if(dead)
                start();
            break;
        default:
            return false;
    }
}

function keyReleased()
{
    switch(keyCode)
    {
        case RIGHT_ARROW:
            path.right = false;
            break;
        case LEFT_ARROW:
            path.left = false;
            break;
        default:
            return false;
    }
}

function mousePressed()
{
    if(resetButton.showing && resetButton.checkClicked(mouseX,mouseY))
    {
        resetButton.showing = false;
        start();
    }
}

class Button
{
    constructor(x,y,length,height,rounding,text)
    {
        this.x = x;
        this.y = y;
        this.h = height;
        this.l = length;
        this.r = rounding;
        this.text = text;
        this.showing = false;
    }

    show()
    {
        this.showing = true;
        fill(255);
        rect(this.x,this.y,this.l,this.h,this.r);
        fill(0);
        this.tW = textWidth(this.text);
        text(this.text,(this.x + this.l/2),this.y + this.h/2 + 12);
    }

    checkClicked(mx, my)
    {
        if(mx > this.x + this.l ||
        mx < this.x || my > this.y + this.h ||
        my < this.y)
            return false;
        return true;
    }
}

class Path
{
    constructor(x,y,height)
    {
        this.w = 10;
        this.x = x - this.w/2;
        this.y = y;
        this.h = height;
        this.moveSpeed = 12;
        this.speed = 0;
        this.left = false;
        this.right = false;
    }
    update()
    {
        if(this.left && abs(this.speed) < this.moveSpeed)
        {
            this.speed -= 1;
        }
        else if(this.speed < 0)
        {
            this.speed += 1;
        }
        if(this.right && abs(this.speed) < this.moveSpeed)
        {
            this.speed += 1;
        }
        else if(this.speed > 0)
        {
            this.speed -= 1;
        }
        this.x += this.speed;
        this.x = constrain(this.x,0,width);
    }

    show()
    {
        noStroke();
        fill(255);
        ellipse(this.x, this.y, this.w * 2);
        ellipse(this.x, this.y + this.h, this.w * 2);
        strokeWeight(this.w);
        stroke(255);
        line(this.x, this.y, this.x, this.y + this.h);
    }
}

class Player {
    constructor(path, width) {
        this.path = path;
        this.width = width;
        this.moveSpeed = 40;
        this.y = this.path.y + (this.path.h / 2 - this.width / 2);
        this.x = this.path.x - this.width / 2;
    }

    show() {
        push();
        translate(this.x + this.width / 2, this.y + this.width / 2);
        rotate(map(sin(frameCount / this.moveSpeed), -1, 1, -4, 4, true));
        fill(255, 0, 220);
        rect(-this.width / 2, -this.width / 2, this.width, this.width, 5, 5, 5, 5);
        pop();
        if(debug) {
            stroke(255,0,0);
            line(this.x, this.y, this.x + this.width, this.y);
            line(this.x + this.width, this.y, this.x + this.width, this.y + this.width);
            line(this.x + this.width, this.y + this.width, this.x, this.y + this.width);
            line(this.x, this.y + this.width, this.x, this.y);
        }

    }

    update() {
        this.y = map(sin(frameCount / this.moveSpeed), -1, 1, this.path.y, this.path.y + (this.path.h - this.width), true);
        this.x = this.path.x - this.width / 2;
    }

    checkCollide(bullets)
    {
        let collided = false;
        for(let bullet of bullets)
        {
            if (this.x > bullet.rX ||
                this.x + this.width < bullet.lX ||
                this.y > bullet.bY ||
                this.y + this.width < bullet.tY)
                continue;
            collided = true;
        }
        return collided;
    }
}

class Bullet {
    constructor(right)
    {
        this.minSpeed = 5;
        this.maxSpeed = 10;
        this.dir = (right ? 1 : -1);
        this.x = this.dir === 1 ? random(width, width+200) : random(0, -200);
        this.speed = -this.dir * random(this.minSpeed,this.maxSpeed);
        this.w = 20;
        this.minY = path.y + this.w + player.width * 1.3;
        this.maxY = path.y + (path.h - (this.w + player.width * 1.3));
        this.y = random(this.minY, this.maxY);
        if(debug)
        {
            console.log(`Max: ${path.y + this.w + player.width * 1.5}`);
            console.log(`Min: ${path.y + (path.h - (this.w + player.width * 1.5))}`);
            console.log(`Bullet's ${this.y}`);
        }
        this.lX = this.x - this.w/2;
        this.rX = this.x + this.w/2;
        this.tY = this.y - this.w/2;
        this.bY = this.y + this.w/2;
    }

    update()
    {
        this.x += this.speed;
        this.lX = this.x - this.w/2;
        this.rX = this.x + this.w/2;
        this.tY = this.y - this.w/2;
        this.bY = this.y + this.w/2;

        if(this.checkFinished())
        {
            this.reset();
        }
    }

    show()
    {
        stroke(255);
        strokeWeight(this.w / 3);
        fill(255,0,0);
        ellipseMode(CENTER);
        ellipse(this.x,this.y,this.w);
        if(debug) {
            stroke(255,0,0);
            //Hitbox
            line(this.lX, this.tY, this.rX, this.tY);
            line(this.rX, this.tY, this.rX, this.bY);
            line(this.rX, this.bY, this.lX, this.bY);
            line(this.lX, this.bY, this.lX, this.tY);
            //Range
            line(0,this.minY,width,this.minY);
            line(0,this.maxY,width,this.maxY,);
        }
    }

    checkFinished()
    {
        if(this.dir === 1 && this.x + this.w < 0)
            return true;
        if(this.dir === -1 && this.x > width)
            return true;
        return false;
    }

    reset()
    {
        this.dir = (random() > .5 ? 1 : -1);
        this.x = this.dir === 1 ? random(width, width+200) : random(0, -200);
        this.y = random(this.minY, this.maxY);
        this.speed = -this.dir * random(this.minSpeed,this.maxSpeed);
        if(debug)
        {
            console.log(`Max: ${path.y + this.w + player.width * 1.5}`);
            console.log(`Min: ${path.y + (path.h - (this.w + player.width * 1.5))}`);
            console.log(`Bullet's ${this.y}`);
        }
    }
}
