import { Ball, Player } from "./classes.js";
import { PongAI } from "./QLearner.js";

//set up pong class
class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");
    this.ball = new Ball();

    this.players = [new Player(), new Player()];
    this.pongAI = new PongAI(this._canvas.height, this.players[1].size.y);
    // set player 1 position
    this.players[0].pos.x = 40;
    // set player 2 position
    this.players[1].pos.x = this._canvas.width - 40;
    //centers the player bars
    this.players.forEach(player => {
      player.pos.y = this._canvas.height / 2;
    });

    let lastTime;
    const callback = millis => {
      if (lastTime) {
        this.update((millis - lastTime) / 1000);
      }
      lastTime = millis;
      requestAnimationFrame(callback);
    };

    callback();
    this.reset();
  }

  playerHitsBall(player, ball) {
    return (
      player.left < ball.right &&
      player.right > ball.left &&
      player.top < ball.bottom &&
      player.bottom > ball.top
    );
  }

  collide(player, ball) {
    //check if the ball hits either player
    if (this.playerHitsBall(player, ball)) {
      const len = ball.vel.len;
      //reverse the ball velocity
      ball.vel.x = -ball.vel.x;

      ball.vel.y += 300 * (Math.random() - 0.5);
      // up ball velocity by5% 0n hit
      ball.vel.len = len * 1.05;
    }
  }

  draw() {
    //draws canvas
    this._context.fillStyle = "#1c1d25";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    this._context.fillStyle = "red";
    this._context.font = "30px Arial";
    this._context.fillText(
      `Round ${this.players[0].score + this.players[1].score + 1}`,
      this._canvas.width / 2,
      this._canvas.height / 5 - 30
    );
    this._context.fillText(
      `${this.players[0].score} - ${this.players[1].score}`,
      this._canvas.width / 2,
      this._canvas.height / 5
    );

    this.drawRect(this.ball);
    this.players.forEach(player => this.drawRect(player));
  }

  drawRect(rect) {
    //draws ball and players white
    this._context.fillStyle = "orange";
    this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
  }

  reset() {
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;

    this.ball.vel.x = 0;
    this.ball.vel.y = 0;

    // center AI on every reset
    this.players[1].pos.y = this._canvas.height / 2;
    this.start();
  }

  start() {
    if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
      this.ball.vel.x = 300 * (Math.random() > 0.5 ? 1 : -1);
      this.ball.vel.y = 300 * (Math.random() * 2 - 1);
      this.ball.vel.len = 400;
    }
  }

  update(dt) {
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;
    // change the x velocity of the ball if it collides with the borders
    if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
      const playerId = (this.ball.vel.x < 0) | 0;
      //increase player score
      this.players[playerId].score++;
      this.ball.vel.x = -this.ball.vel.x;
      this.reset();
    }
    // change the Y velocity of the ball if it collides with borders
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
      this.ball.vel.y = -this.ball.vel.y;
    }
    // // make the CPU player follow the ball
    // this.players[1].pos.y = this.ball.pos.y;

    // Make player follow ball to speed learning
    this.players[0].pos.y = this.ball.pos.y;
    // Use Q-learning
    this.players[1].pos.y = this.pongAI.getNextPosition(
      this.ball.pos.y,
      this.players[1].pos.y,
      [this.players[0].score, this.players[1].score],
      this.playerHitsBall(this.players[1], this.ball)
    );
    // for each collision with player
    this.players.forEach(player => this.collide(player, this.ball));

    this.draw();
  }
}

//variables for the canvas element
const canvas = document.getElementById("pong");
const pong = new Pong(canvas);
// add event lisnter for player 1 movement on mouse
// canvas.addEventListener("mousemove", event => {
//   pong.players[0].pos.y = event.offsetY;
// });
// event listner for click to start / restart
// canvas.addEventListener("click", event => {
//   pong.start();
// });
