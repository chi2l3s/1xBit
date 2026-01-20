export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  rank: string
  value: number
}

export interface Hand {
  cards: Card[]
  value: number
  soft: boolean
  busted: boolean
  blackjack: boolean
}

export interface BlackjackGame {
  playerHand: Hand
  dealerHand: Hand
  deck: Card[]
  status: "playing" | "playerBusted" | "dealerBusted" | "playerWin" | "dealerWin" | "push" | "blackjack"
}

const SUITS: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"]
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

function getCardValue(rank: string): number {
  if (rank === "A") return 11
  if (["K", "Q", "J"].includes(rank)) return 10
  return parseInt(rank)
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: getCardValue(rank) })
    }
  }
  return shuffleDeck(deck)
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateHandValue(cards: Card[]): { value: number; soft: boolean } {
  let value = 0
  let aces = 0

  for (const card of cards) {
    if (card.rank === "A") {
      aces++
      value += 11
    } else {
      value += card.value
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }

  return { value, soft: aces > 0 }
}

export function createHand(cards: Card[]): Hand {
  const { value, soft } = calculateHandValue(cards)
  return {
    cards,
    value,
    soft,
    busted: value > 21,
    blackjack: cards.length === 2 && value === 21,
  }
}

export function startGame(): BlackjackGame {
  const deck = createDeck()
  const playerCards = [deck.pop()!, deck.pop()!]
  const dealerCards = [deck.pop()!, deck.pop()!]

  const playerHand = createHand(playerCards)
  const dealerHand = createHand(dealerCards)

  let status: BlackjackGame["status"] = "playing"

  if (playerHand.blackjack && dealerHand.blackjack) {
    status = "push"
  } else if (playerHand.blackjack) {
    status = "blackjack"
  } else if (dealerHand.blackjack) {
    status = "dealerWin"
  }

  return {
    playerHand,
    dealerHand,
    deck,
    status,
  }
}

export function hit(game: BlackjackGame): BlackjackGame {
  if (game.status !== "playing") return game

  const deck = [...game.deck]
  const newCard = deck.pop()!
  const newCards = [...game.playerHand.cards, newCard]
  const playerHand = createHand(newCards)

  let status: BlackjackGame["status"] = "playing"
  if (playerHand.busted) {
    status = "playerBusted"
  }

  return {
    ...game,
    deck,
    playerHand,
    status,
  }
}

export function stand(game: BlackjackGame): BlackjackGame {
  if (game.status !== "playing") return game

  let deck = [...game.deck]
  let dealerCards = [...game.dealerHand.cards]

  while (calculateHandValue(dealerCards).value < 17) {
    dealerCards.push(deck.pop()!)
  }

  const dealerHand = createHand(dealerCards)
  const playerValue = game.playerHand.value
  const dealerValue = dealerHand.value

  let status: BlackjackGame["status"]

  if (dealerHand.busted) {
    status = "dealerBusted"
  } else if (dealerValue > playerValue) {
    status = "dealerWin"
  } else if (playerValue > dealerValue) {
    status = "playerWin"
  } else {
    status = "push"
  }

  return {
    ...game,
    deck,
    dealerHand,
    status,
  }
}

export function getMultiplier(status: BlackjackGame["status"]): number {
  switch (status) {
    case "blackjack":
      return 2.5
    case "playerWin":
    case "dealerBusted":
      return 2
    case "push":
      return 1
    default:
      return 0
  }
}

export function getCardDisplay(card: Card): string {
  const suitSymbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }
  return `${card.rank}${suitSymbols[card.suit]}`
}

export function isRedSuit(suit: Card["suit"]): boolean {
  return suit === "hearts" || suit === "diamonds"
}
