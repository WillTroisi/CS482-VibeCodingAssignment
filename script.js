// =========================
// Deck + Game State
// =========================
const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

let deck = [];
let playerHand = [];
let computerHand = [];
let discardPile = [];

let awaitingSuitChoice = false;
let storedEightCard = null;
let gameOver = false;

// =========================
// Utility Functions
// =========================

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push(rank + suit);
        }
    }
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function drawCard() {
    if (deck.length === 0) reshuffle();
    return deck.pop();
}

function reshuffle() {
    let top = discardPile.pop();
    deck = shuffle(discardPile);
    discardPile = [top];
}

function isPlayable(card, topCard) {
    const cardRank = card.slice(0, -1);
    const topRank = topCard.slice(0, -1);
    const cardSuit = card.slice(-1);
    const topSuit = topCard.slice(-1);

    return (
        cardRank === "8" || 
        cardRank === topRank || 
        cardSuit === topSuit
    );
}

// =========================
// Game Initialization
// =========================

function startGame() {
    createDeck();
    shuffle(deck);

    playerHand = [];
    computerHand = [];
    discardPile = [];

    gameOver = false;

    for (let i = 0; i < 7; i++) {
        playerHand.push(drawCard());
        computerHand.push(drawCard());
    }

    discardPile.push(drawCard());

    updateUI();
    setStatus("Your turn! Play a card or draw.");
}

document.getElementById("draw-button").onclick = function () {
    if (awaitingSuitChoice || gameOver) return;
    let card = drawCard();
    playerHand.push(card);
    updateUI();

    setStatus("You drew a card. Computer's turn...");
    setTimeout(computerTurn, 1200);
};

function setStatus(msg) {
    document.getElementById("status").textContent = msg;
}

// =========================
// Check Win/Lose
// =========================

function checkWinLose() {
    if (playerHand.length === 0) {
        setStatus("🎉 You win! All your cards are gone!");
        gameOver = true;
        return true;
    }

    if (computerHand.length === 0) {
        setStatus("💀 You lose! Computer has no cards left!");
        gameOver = true;
        return true;
    }

    return false;
}

// =========================
// Player Move
// =========================

function playCard(card) {
    if (awaitingSuitChoice || gameOver) return;

    let top = discardPile[discardPile.length - 1];

    if (!isPlayable(card, top)) {
        setStatus("You cannot play that card!");
        return;
    }

    // Handle 8
    if (card.startsWith("8")) {
        awaitingSuitChoice = true;
        storedEightCard = card;
        document.getElementById("suit-selector").style.display = "block";
        setStatus("Choose a suit for the 8...");
        return;
    }

    // Normal play
    playerHand = playerHand.filter(c => c !== card);
    discardPile.push(card);
    updateUI();

    if (checkWinLose()) return;

    setStatus("Computer's turn...");
    setTimeout(computerTurn, 1200);
}

// =========================
// Confirm Suit after 8
// =========================

document.getElementById("confirm-suit").onclick = function () {
    if (gameOver) return;

    const chosenSuit = document.getElementById("suit-dropdown").value;
    const newCard = "8" + chosenSuit;

    playerHand = playerHand.filter(c => c !== storedEightCard);
    discardPile.push(newCard);

    document.getElementById("suit-selector").style.display = "none";

    awaitingSuitChoice = false;
    storedEightCard = null;

    updateUI();

    if (checkWinLose()) return;

    setStatus("Computer's turn...");
    setTimeout(computerTurn, 1200);
};

// =========================
// Computer Turn
// =========================

function computerTurn() {
    if (gameOver) return;

    let top = discardPile[discardPile.length - 1];
    let playable = computerHand.find(card => isPlayable(card, top));

    if (playable) {
        if (playable.startsWith("8")) {
            const randomSuit = suits[Math.floor(Math.random() * suits.length)];
            playable = "8" + randomSuit;
        }

        computerHand = computerHand.filter(c => !c.startsWith(playable[0])); 
        discardPile.push(playable);
        updateUI();

        setStatus("Computer played a card");

        if (checkWinLose()) return;
    } else {
        let card = drawCard();
        computerHand.push(card);
        setStatus("Computer draws a card.");
    }

    updateUI();
}

// =========================
// UI Rendering
// =========================

function updateUI() {
    // Player hand
    const handDiv = document.getElementById("player-hand");
    handDiv.innerHTML = "";

    playerHand.forEach(card => {
        const div = document.createElement("div");
        div.className = "card";
        div.textContent = card;
        div.onclick = () => playCard(card);
        handDiv.appendChild(div);
    });

    // Computer hand (face-down)
    const computerDiv = document.getElementById("computer-hand");
    computerDiv.innerHTML = "";

    computerHand.forEach(card => {
        const div = document.createElement("div");
        div.className = "card card-back";
        computerDiv.appendChild(div);
    });

    // Discard pile
    document.getElementById("discard-pile").textContent =
        discardPile[discardPile.length - 1];
}

// Start game
startGame();
