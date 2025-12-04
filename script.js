// -------------------------------
// GLOBAL STATE
// -------------------------------

let deck = [];
let playerHand = [];
let computerHand = [];
let discardPile = [];

let suits = ["♠", "♥", "♦", "♣"];
let ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// -------------------------------
// INITIAL SETUP
// -------------------------------

function initGame() {
    deck = createDeck();
    shuffle(deck);

    // Deal 7 cards to each
    for (let i = 0; i < 7; i++) {
        playerHand.push(deck.pop());
        computerHand.push(deck.pop());
    }

    // Start the discard pile
    discardPile.push(deck.pop());

    updateDisplay();
    setStatus("Your turn! Play a card or draw.");
}

// -------------------------------
// DECK LOGIC
// -------------------------------

function createDeck() {
    let d = [];
    for (let s of suits) {
        for (let r of ranks) {
            d.push({ rank: r, suit: s });
        }
    }
    return d;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// -------------------------------
// UI UPDATES
// -------------------------------

function updateDisplay() {
    const top = discardPile[discardPile.length - 1];
    document.getElementById("discard-pile").innerText = cardToString(top);

    const handDiv = document.getElementById("player-hand");
    handDiv.innerHTML = "";

    playerHand.forEach((card, index) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.innerText = cardToString(card);

        cardDiv.onclick = () => playCard(index);

        handDiv.appendChild(cardDiv);
    });
}

function cardToString(card) {
    return `${card.rank}${card.suit}`;
}

function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}

// -------------------------------
// PLAYER ACTIONS
// -------------------------------

function playCard(index) {
    const card = playerHand[index];
    const top = discardPile[discardPile.length - 1];

    if (!isValidPlay(card, top)) {
        setStatus("Invalid card. Play matching rank/suit or an 8.");
        return;
    }

    playerHand.splice(index, 1);
    discardPile.push(card);

    if (card.rank === "8") {
        chooseSuitForWild(card);
        return;
    }

    updateDisplay();
    setStatus("Computer's turn...");
    setTimeout(computerTurn, 1000);
}

function isValidPlay(card, top) {
    return (
        card.rank === "8" ||
        card.rank === top.rank ||
        card.suit === top.suit
    );
}

// -------------------------------
// WILD 8 SUIT SELECTION (PLAYER)
// -------------------------------

function chooseSuitForWild(card) {
    // Show the dropdown UI
    document.getElementById("suit-selector").style.display = "block";
    setStatus("You played an 8! Choose a suit.");

    // When player confirms
    document.getElementById("confirm-suit").onclick = () => {
        const chosen = document.getElementById("suit-dropdown").value;

        // Apply suit to the card
        card.suit = chosen;

        // Hide the menu again
        document.getElementById("suit-selector").style.display = "none";

        updateDisplay();
        setStatus("Computer's turn...");
        setTimeout(computerTurn, 800);
    };
}


// -------------------------------
// DRAW CARD
// -------------------------------

document.getElementById("draw-button").onclick = () => {
    if (deck.length === 0) {
        setStatus("Deck empty!");
        return;
    }

    const card = deck.pop();
    playerHand.push(card);
    updateDisplay();

    const top = discardPile[discardPile.length - 1];

    if (isValidPlay(card, top)) {
        setStatus("You drew a playable card! Playing it...");
        setTimeout(() => {
            playCard(playerHand.length - 1);
        }, 500);
    } else {
        setStatus("No valid play. Computer's turn...");
        setTimeout(computerTurn, 1000);
    }
};

// -------------------------------
// COMPUTER LOGIC (Iteration 3)
// -------------------------------

function chooseRandomSuit() {
    return suits[Math.floor(Math.random() * suits.length)];
}

function computerTurn() {
    setStatus("Computer is thinking...");

    const top = discardPile[discardPile.length - 1];

    // 1. Try to find a valid card (non-8 first)
    let playIndex = -1;

    // Try non-8 valid card
    for (let i = 0; i < computerHand.length; i++) {
        const card = computerHand[i];
        if (card.rank !== "8" && isValidPlay(card, top)) {
            playIndex = i;
            break;
        }
    }

    // Try 8 if no other valid card
    if (playIndex === -1) {
        for (let i = 0; i < computerHand.length; i++) {
            const card = computerHand[i];
            if (card.rank === "8") {
                playIndex = i;
                break;
            }
        }
    }

    // If found a playable card → play it
    if (playIndex !== -1) {
        const card = computerHand.splice(playIndex, 1)[0];
        discardPile.push(card);

        if (card.rank === "8") {
            const newSuit = chooseRandomSuit();
            card.suit = newSuit;
            setStatus(`Computer played 8 and chose ${newSuit}`);
        } else {
            setStatus(`Computer played ${cardToString(card)}`);
        }

        updateDisplay();

        setTimeout(() => {
            setStatus("Your turn! Play a card or draw.");
        }, 800);

        return;
    }

    // 2. No playable card → draw one
    if (deck.length > 0) {
        const drawn = deck.pop();
        computerHand.push(drawn);
        setStatus("Computer drew a card.");

        if (isValidPlay(drawn, top)) {
            setTimeout(() => {
                const card = computerHand.pop();
                discardPile.push(card);

                if (card.rank === "8") {
                    const newSuit = chooseRandomSuit();
                    card.suit = newSuit;
                    setStatus(`Computer played 8 and chose ${newSuit}`);
                } else {
                    setStatus(`Computer played ${cardToString(card)}`);
                }

                updateDisplay();
                setTimeout(() => {
                    setStatus("Your turn! Play a card or draw.");
                }, 800);
            }, 800);

            return;
        }
    } else {
        setStatus("Deck empty! Computer passes.");
    }

    setTimeout(() => {
        setStatus("Your turn! Play a card or draw.");
    }, 800);
}

// -------------------------------
// START GAME
// -------------------------------

initGame();
