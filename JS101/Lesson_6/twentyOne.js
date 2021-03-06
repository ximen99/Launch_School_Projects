let readline = require("readline-sync");
const SUIT_NAME = { H: "Hearts", D: "Diamonds", S: "Spades", C: "Clubs" };
const FACE_CARDS = ["J", "Q", "K", "A"];
const MAX_WINS = 5;

function prompt(str) {
  console.log(`=> ${str}`);
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index--) {
    let otherIndex = Math.floor(Math.random() * (index + 1)); // 0 to index
    [array[index], array[otherIndex]] = [array[otherIndex], array[index]]; // swap elements
  }
  return array;
}

function createDeck() {
  let deck = [];
  let cardNum = [];
  // add card number
  for (let i = 2; i <= 10; i++) {
    cardNum.push(i);
  }
  // add JQKA
  cardNum = cardNum.concat(FACE_CARDS);
  // create the full Deck
  cardNum.forEach((n) => {
    for (const suit of Object.keys(SUIT_NAME)) {
      deck.push([suit, n]);
    }
  });
  return deck;
}

function displayCardReceived(turn, card) {
  prompt(`${turn} just got a ${card[1]} of ${SUIT_NAME[card[0]]}`);
}

function dealOneCard(turn, gameData) {
  if (turn === "player") {
    gameData.playerDeck.push(gameData.deck.pop());
  } else if (turn === "dealer") {
    gameData.dealerDeck.push(gameData.deck.pop());
  }
}

function dealCards(turn, gameData) {
  if (turn === "init") {
    dealOneCard("player", gameData);
    dealOneCard("player", gameData);
    dealOneCard("dealer", gameData);
    dealOneCard("dealer", gameData);
  } else {
    dealOneCard(turn, gameData);
  }
}

function calculateScore(cards) {
  let values = cards.map((arr) => arr[1]);
  let score = 0;

  values.forEach((value) => {
    if ("JQK".includes(value)) {
      score += 10;
    } else if (value === "A") {
      score += 11;
    } else {
      score += value;
    }
  });

  values
    .filter((value) => value === "A")
    .forEach((_) => {
      if (score > 21) score -= 10;
    });

  return score;
}

function readDeck(deck) {
  let values = deck.map((card) => card[1]);
  return (result = values.join(", ").replace(/,(?=[^,]*$)/, " and"));
}

function displayDeck(turn, gameData) {
  if (turn === "player") {
    // only display first card of dealer
    prompt(`Dealer has: ${gameData.dealerDeck[0][1]} and an unknown card`);
    prompt(`You have ${readDeck(gameData.playerDeck)}`);
  } else {
    prompt(`Dealer has: ${readDeck(gameData.dealerDeck)}`);
    prompt(`You have ${readDeck(gameData.playerDeck)}`);
  }
}

function playerTurn(gameData) {
  while (true) {
    displayDeck("player", gameData);
    prompt('Do you want to hit or stay (please input "hit" or "stay").');
    let answer = readline.question();
    if (answer.toLowerCase() === "stay") {
      prompt("You Chose to stay!");
      gameData.playerRoundDone = true;
      break;
    } else {
      dealCards("player", gameData);
      displayCardReceived("You", gameData.playerDeck.slice(-1)[0]);
      let playerScore = calculateScore(gameData.playerDeck);
      // check if player busted
      if (playerScore > 21) {
        gameData.winner = "dealer";
        prompt(`Your score is ${playerScore}, You busted!`);
        gameData.playerRoundDone = true;
        break;
      }
    }
  }
}

function displayGameWinner(gameData) {
  if (gameData.winner == "player") {
    prompt("You won!");
  } else if (gameData.winner == "dealer") {
    prompt("Dealer won!");
  } else {
    prompt("It's a tie!");
  }
}

function playAgain() {
  let answer;
  while (true) {
    prompt("Do you want to play again? (y/n)");
    answer = readline.question().toLowerCase()[0];
    if ("yn".includes(answer)) {
      break;
    } else {
      prompt("Not a valid answer, please choose between y or n");
    }
  }
  return answer === "y";
}

function startGame() {
  prompt("Do start the game?");
  readline.question();
}

function dealerTurn(gameData) {
  while (true) {
    displayDeck("dealer", gameData);
    if (calculateScore(gameData.dealerDeck) < 17) {
      // if score is lower than 17 keep hitting
      prompt("Dealer chose to hit!");
      dealCards("dealer", gameData);
      displayCardReceived("Dealer", gameData.dealerDeck.slice(-1)[0]);
      let dealerScore = calculateScore(gameData.dealerDeck);
      // check if dealer is busted
      if (dealerScore > 21) {
        gameData.winner = "player";
        prompt(`Dealer score is ${dealerScore}, he busted!`);
        break;
      }
    } else {
      // score over 17 choose stay
      prompt("Dealer choose to stay!");
      gameData.winner = "compare";
      break;
    }
  }
}

function decideWinner(gameData) {
  let playerScore = calculateScore(gameData.playerDeck);
  let dealerScore = calculateScore(gameData.dealerDeck);
  if (playerScore > dealerScore) {
    gameData.winner = "player";
  } else if (playerScore < dealerScore) {
    gameData.winner = "dealer";
  }
}

function playRounds(gameData) {
  if (gameData.playerRoundDone) {
    dealerTurn(gameData);
  } else {
    playerTurn(gameData);
  }
}

function updateMatchScore(matchScore, gameData) {
  matchScore[gameData.winner] += 1;
}

function matchWinner(matchScore) {
  if (matchScore.player >= MAX_WINS) {
    return "player";
  } else if (matchScore.dealer >= MAX_WINS) {
    return "dealer";
  }
}

function displayMatchWinner(matchScore) {
  let winner = matchWinner(matchScore);
  winner = winner.charAt(0).toUpperCase() + winner.slice(1).toLowerCase();
  prompt(`${winner} is the winner of this match!`);
}

function displayMatchScore(matchScore) {
  prompt(`Your have ${matchScore.player} wins so far in this match;`);
  prompt(`Dealer has ${matchScore.dealer} wins so far in this match.`);
}

// match loop
while (true) {
  // clear screen for new match
  console.clear();
  // initializing match score
  let matchScore = { player: 0, dealer: 0 };

  prompt(
    "Welcome to the game twenty one. First one to win five games wins the match!"
  );
  // game loop
  while (!matchWinner(matchScore)) {
    console.clear();
    prompt("Starting a new game...");
    // initializing Game Data
    let gameData = {
      playerDeck: [],
      dealerDeck: [],
      winner: undefined,
      deck: shuffle(createDeck()),
      playerRoundDone: false,
    };
    // shuffle deck
    shuffle(gameData.deck);
    // set up cards
    dealCards("init", gameData);
    // play round loop
    while (!gameData.winner) {
      playRounds(gameData);
    }
    // if no one busted compare score
    if (gameData.winner == "compare") {
      decideWinner(gameData);
    }

    displayGameWinner(gameData);

    updateMatchScore(matchScore, gameData);

    displayMatchScore(matchScore);

    startGame();
  }

  displayMatchWinner(matchScore);

  // ask to see if play again.
  if (!playAgain()) {
    prompt("Thanks for playing the game!");
    break;
  }
}
