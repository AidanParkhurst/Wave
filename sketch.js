let path;
let player;
let bullets;
let score;
let fontRegular;
let dead;
let resetButton;

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
    path = new Path(width/2, height/2 - pWidth / 2, pWidth);
    player = new Player(path,20);
    bullets = [];
    score = 0;
    bullets.push(new Bullet(false));
    textAlign(CENTER);
    textFont(fontRegular);
    textSize(32);
    dead = false;
}

function draw()
{
    background(51);
    path.show();
    if(!dead)
        path.update();
    player.show();
    if(!dead)
        player.update();
    for(let bullet of bullets)
    {
        bullet.show();
        if(!dead)
            bullet.update();
    }
    if(player.checkCollide(bullets))
    {
        dead = true;
    }
    if(frameCount >= 60 && frameCount % 60 === 0 && !dead)
        score++;
    noStroke();
    fill(255);
    text(score,0,10,width,height);
    if(dead)
        endScreen();
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
    resetButton = new Button(width/2 - 200,height/2 + 100, 400, 100, 50, "Retry?");
    resetButton.show()
}

function keyPressed()
{
    switch(keyCode)
    {
        case RIGHT_ARROW:
            path.right = true;
            break;
        case LEFT_ARROW:
            path.left = true;
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
    if(resetButton && resetButton.checkClicked(mouseX,mouseY))
        start();
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
    }

    show()
    {
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
        this.moveSpeed = 50;
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

    }

    update() {
        this.y = map(sin(frameCount / this.moveSpeed), -1, 1, this.path.y, this.path.y + (this.path.h - this.width), true);
        this.x = this.path.x - this.width / 2;
    }

    checkCollide(bullets)
    {
        for(let bullet of bullets)
        {
            if (this.x > bullet.x + bullet.w ||
                this.x + this.width < bullet.x ||
                this.y > bullet.y + bullet.w ||
                this.y + this.width < bullet.y)
                    return false;
            return true;
        }
    }
}

class Bullet {
    constructor(right)
    {
        this.minSpeed = 5;
        this.maxSpeed = 10 + score % 10;
        this.dir = (right ? 1 : -1);
        this.x = this.dir === 1 ? random(width, width+200) : random(0, -200);
        this.y = random(path.y, path.y + path.h);
        this.speed = -this.dir * random(this.minSpeed,this.maxSpeed);
        this.w = 20
    }

    update()
    {
        this.x += this.speed;
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
        ellipse(this.x,this.y,this.w);
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
        this.y = random(path.y, path.y + path.h);
        this.speed = -this.dir * random(this.minSpeed,this.maxSpeed);
    }
}
