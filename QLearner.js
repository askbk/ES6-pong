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
    let bestValue = -10;
    this.initializeState(state);

    // find best action in state and the corresponding value
    this.Q[state].forEach(action => {
      if (this.Q[state][action] > bestValue) {
        bestValue = this.Q[state][action];
      }
    });

    return bestValue;
  }

  nextAction(state) {
    let bestValue = -10;
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
    return 60 / (59 + n);
  }

  // Make the agent do some exploration
  explore(u, n) {
    if (n < 10) {
      return 1;
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
    if (this.state) {
      this.incrementN(this.s, this.a);
      this.updateQ(this.s, this.a, this.r, currentState);
    }

    this.s = currentState;
    this.r = reward;
    this.a = this.nextAction(currentState);

    return this.a;
  }
}

class PongAI {
  constructor(height) {
    const actions = ["up", "down"];
    this.agent = new QLearningAgent(actions);
    this.scores = [0, 0];
    this.boardHeight = height;
  }

  getNextPosition(ballPosY, paddlePosY, scores, ballhit) {
    let reward = 0;

    if (this.scores[1] < scores[1]) {
      reward = 5;
    } else if (this.scores[0] < scores[0]) {
      reward = -100;
    }

    if (ballhit) {
        reward += 200
    }

    const action = this.agent.getAction({
      currentState: [ballPosY, paddlePosY],
      reward
    });

    if (action === "up") {
      return paddlePosY - 1;
    } else if (action === "down") {
      return paddlePosY + 1;
    } else {
      return paddlePosY;
    }
  }
}

export { PongAI };
