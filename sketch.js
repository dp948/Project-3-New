let shapes = [];
let numShapes = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize shapes
  for (let i = 0; i < numShapes; i++) {
    let types = ['triangle', 'circle', 'square', 'x'];
    let type = random(types);
    shapes.push(new Shape(random(width), random(height), type));
  }
}

function draw() {
  background(0); // solid black background

  for (let shape of shapes) {
    shape.update();
    shape.checkWallCollision();
    shape.checkCursorCollision(mouseX, mouseY);
    shape.display();
  }

  // Check collisions between all pairs after updating positions
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      resolveCollision(shapes[i], shapes[j]);
    }
  }
}

class Shape {
  constructor(x, y, type) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 1.2));
    this.type = type;
    this.size = random(30, 50);
    this.color = this.getColorByType(type);
    this.mass = this.size * 0.5; // mass proportional to size
  }

  getColorByType(type) {
    switch (type) {
      case 'triangle': return color(0, 255, 0); // green
      case 'circle': return color(255, 0, 0); // red
      case 'square': return color(255, 0, 255); // magenta
      case 'x': return color(0, 0, 255); // blue
    }
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    stroke(this.color);
    strokeWeight(4);
    fill(this.color);

    // Neon glow
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = this.color;

    switch (this.type) {
      case 'triangle':
        triangle(-this.size/2, this.size/2, this.size/2, this.size/2, 0, -this.size/2);
        break;
      case 'circle':
        ellipse(0, 0, this.size);
        break;
      case 'square':
        rectMode(CENTER);
        rect(0, 0, this.size, this.size);
        break;
      case 'x':
        line(-this.size/2, -this.size/2, this.size/2, this.size/2);
        line(-this.size/2, this.size/2, this.size/2, -this.size/2);
        break;
    }
    pop();
  }

  checkWallCollision() {
    if (this.pos.x < this.size/2) {
      this.pos.x = this.size/2;
      this.vel.x *= -1;
    } else if (this.pos.x > width - this.size/2) {
      this.pos.x = width - this.size/2;
      this.vel.x *= -1;
    }

    if (this.pos.y < this.size/2) {
      this.pos.y = this.size/2;
      this.vel.y *= -1;
    } else if (this.pos.y > height - this.size/2) {
      this.pos.y = height - this.size/2;
      this.vel.y *= -1;
    }
  }

  checkCursorCollision(mx, my) {
    let d = dist(this.pos.x, this.pos.y, mx, my);
    if (d < this.size/2 + 15) {
      let angle = atan2(this.pos.y - my, this.pos.x - mx);
      this.vel.x = cos(angle) * 2;
      this.vel.y = sin(angle) * 2;
    }
  }
}

// Elastic collision between two shapes
function resolveCollision(a, b) {
  let distVect = p5.Vector.sub(b.pos, a.pos);
  let distMag = distVect.mag();
  let minDist = (a.size + b.size) / 2;

  if (distMag < minDist) {
    let n = distVect.copy().normalize();
    let relVel = p5.Vector.sub(a.vel, b.vel);
    let speed = relVel.dot(n);

    if (speed < 0) return; // Already moving apart

    let impulse = (2 * speed) / (a.mass + b.mass);
    a.vel.sub(p5.Vector.mult(n, impulse * b.mass));
    b.vel.add(p5.Vector.mult(n, impulse * a.mass));

    // Separate overlapping shapes
    let overlap = (minDist - distMag) / 2;
    a.pos.sub(p5.Vector.mult(n, overlap));
    b.pos.add(p5.Vector.mult(n, overlap));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
