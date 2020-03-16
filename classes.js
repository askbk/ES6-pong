// set up vector class
class Vec {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set len(value) {
    const fact = value / this.len;
    this.x *= fact;
    this.y *= fact;
  }
}

class Rect {
  constructor(w, h) {
    this.pos = new Vec();
    this.size = new Vec(w, h);
  }
  // setting the borders of the rectangle
  get left() {
    return this.pos.x - this.size.x / 2;
  }
  get right() {
    return this.pos.x + this.size.x / 2;
  }
  get top() {
    return this.pos.y - this.size.y / 2;
  }
  get bottom() {
    return this.pos.y + this.size.y / 2;
  }
}

class Ball extends Rect {
  constructor() {
    //creates a 10 x 10
    super(10, 10);
    //set up velocity
    this.vel = new Vec();
  }
}

class Player extends Rect {
  constructor() {
    super(20, 100);
    this.score = 0;
  }
}

export { Ball, Player };
