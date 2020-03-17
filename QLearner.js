// Actions in pong: 'up' and 'down'
// States in pong: Ball Y-coordinate, AI Y-coordinate

class QLearningAgent {
  constructor(actions) {
    this.actions = actions;
    this.Q = {};
    this.N = {};
    this.s = null;
    this.a = null;
    this.r = null;
    this.g = 0.9;
  }

  initializeState(state) {
    // initialize q-values for state-action pair to zero
    if (!(state in this.Q)) {
      this.Q[state] = {};
      this.actions.forEach(action => {
        this.Q[state][action] = 0;
      });
    }

    if (!(state in this.N)) {
      this.N[state] = {};
      this.actions.forEach(action => {
        this.N[state][action] = 0;
      });
    }
  }

  // Find best action in a state
  maxAction(state) {
    let bestValue = -Infinity;
    this.initializeState(state);

    // find best action in state and the corresponding value
    Object.keys(this.Q[state]).forEach(action => {
      if (this.Q[state][action] > bestValue) {
        bestValue = this.Q[state][action];
      }
    });

    return bestValue;
  }

  nextAction(state) {
    let bestValue = -Infinity;
    let bestAction = null;

    if (!(state in this.Q)) {
      this.initializeState(state);
    }

    Object.keys(this.Q[state]).forEach(action => {
      if (
        this.explore(this.Q[state][action], this.N[state][action]) > bestValue
      ) {
        bestValue = this.Q[state][action];
        bestAction = action;
      }
    });

    return bestAction;
  }

  // Increment frequency of state-action pair
  incrementN(state, action) {
    // initialize frequency for state-action pair to zero
    if (!(state in this.N)) {
      this.actions.forEach(action => {
        this.Q[state][action] = 0;
      });
    }

    this.N[state][action]++;
  }

  // Ensure convergence
  stepSize(n) {
    return 0.9;
    // return 600 / (599 + n);
    // return 60 / (59 + n);
  }

  // Make the agent do some exploration
  explore(u, n) {
    // return u;
    if (n < 2) {
      // return Math.random() > 0.1 ? 100 : u;
      return 100;
    }

    return u;
  }

  // Update Q-value for previous state-action pair
  updateQ(state, action, reward, currentState) {
    const maxQ = this.maxAction(currentState);

    this.Q[state][action] +=
      this.stepSize(this.N[state][action]) *
      (this.r + this.g * maxQ - this.Q[state][action]);
  }

  // Find argument that maximizes the function
  getAction({ currentState, reward }) {
    if (this.s) {
      this.incrementN(this.s, this.a);
      this.updateQ(this.s, this.a, this.r, currentState);
    }

    this.s = currentState;
    this.r = reward;
    this.a = this.nextAction(currentState);
    if (!this.a) {
      console.log(this.Q);
      console.log(this.N);
      console.log(currentState);
      throw new Error("action is null");
    }
    return this.a;
  }
}

class PongAI {
  constructor(boardHeight, playerHeight) {
    const actions = ["up", "down", "stop"];
    this.agent = new QLearningAgent(actions);
    this.scores = [0, 0];
    this.boardHeight = boardHeight;
    // Size of state space is sections^2
    this.sections = 30;
    this.movementSpeed = Math.floor(this.boardHeight / this.sections);
  }

  // divide board into sections to speed up learning (reduce number of states)
  adjustPosition(y) {
    const adjusted =
      Math.floor((y * this.sections) / this.boardHeight) *
      Math.floor(this.boardHeight / this.sections);
    return adjusted;
  }

  getNextPosition(ballPosY, playerPosY, scores, ballhit) {
    let reward = 0;

    // give some reward for scoring a point
    if (this.scores[1] < scores[1]) {
      reward = 5;
      // give big punishment for letting opponent get a point
    } else if (this.scores[0] < scores[0]) {
      reward = -2;
    }

    this.scores = scores;

    // Blocking a ball gives high reward
    if (ballhit) {
      reward += 1;
    }

    const action = this.agent.getAction({
      currentState: [
        this.adjustPosition(ballPosY),
        this.adjustPosition(playerPosY)
      ],
      reward
    });

    // console.log(reward, action, playerPosY);
    if (isNaN(playerPosY)) {
      throw new Error(`${playerPosY} not a number`);
    }

    if (action === "up") {
      return Math.max(playerPosY - this.movementSpeed, 50);
    } else if (action === "down") {
      return Math.min(playerPosY + this.movementSpeed, this.boardHeight - 50);
    } else if (action === "stop") {
      return playerPosY;
    }
  }
}

export { PongAI };
