const readlineSync = require('readline-sync');

// Définir la liste des lettres et leurs valeurs
let letterValues = {
  'A': 14, 'B': 4, 'C': 7, 'D': 5, 'E': 19, 'F': 2, 'G': 4, 'H': 2, 'I': 11,
  'J': 1, 'K': 1, 'L': 6, 'M': 5, 'N': 9, 'O': 8, 'P': 4, 'Q': 1, 'R': 10,
  'S': 7, 'T': 9, 'U': 8, 'V': 2, 'W': 1, 'X': 1, 'Y': 1, 'Z': 2
};

function Player(name){
  this.name = name;
  this.hand = [];
  this.board = [];
  this.playedWords = [];
}


let player1 = new Player("player1");
let player2 = new Player("player2");
let players = [player1, player2];

//fonction pile ou face (retourne "pile" ou "face")
function flipCoin() {
  return Math.random() < 0.5 ? "player1" : "player2";
}

// Function to draw 6 letters at random, ensuring that the value of the letter is not zero
function draw6Letters(player) {
  for (let i = 0; i < 6; i++) {
    draw1Letter(player);
  }
}

function draw1Letter(player) {
  availableLetters = Object.keys(letterValues);
  let letter;
  do {
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    letter = availableLetters[randomIndex];
  } while (letterValues[letter] === 0);
  player.hand.push(letter);
  letterValues[letter]--;
}
// Function to check if a word is valid, valid if word's length greater or equal to 3 and contains only letters that are in the playerhand. Do the function without callback
function checkWord(word, playerHand){
  if (word.length < 3) return false;
  for (let i = 0; i < word.length; i++) {
    if (!playerHand.includes(word[i])) {
      return false;
    }
  }
  return true;
}

function printBoard(player){
  console.log("Board du joueur " + player.name + " : \n");
  for (let i = 0; i < player.board.length; i++) {
    console.log(player.board[i]+ "\n");
  }
}

function addWord(player){
  let userInput;
  do{
    userInput = readlineSync.question('Entrez un mot : ');
    userInput =userInput.toUpperCase();
  } while (checkWord(userInput, player.hand) === false);
  console.log('Vous avez saisi : ' + userInput);
  player.board.push(userInput);
  player.playedWords.push(userInput)
}

function checkWordTransform(oldWord, newWord, playerHand){
  if (newWord.length < 3) return false;
  for (let i = 0; i < newWord.length; i++) {
    if (!playerHand.includes(newWord[i]) || (!oldWord.includes(newWord[i]))) {
      return false;
    }
  }
  for (let i = 0; i < oldWord.length; i++) {
    if (!newWord.includes(oldWord[i])) {
      return false;
    }
  }
  return true;
}

function transformWord(player){
  let userInput;
  do{
    userInput = parseInt(readlineSync.question('Entrez la ligne du mot à transformer : ')) - 1;
  } while (userInput <= 0 && userInput > player.board.length);
  oldWord = player.board[userInput];
  console.log('Vous avez choisi de transformer le mot : ' + oldWord);

  do{
    userInput = readlineSync.question('Entrez le nouveau mot : ');
    userInput = userInput.toUpperCase();
  } while (checkWordTransform(oldWord, userInput, player.hand) === false);
  console.log('Vous avez saisi : ' + userInput);
  player.board[userInput] = userInput;
  player.playedWords.push(userInput)
}

draw6Letters(player1);
console.log(player1.hand);
addWord(player1);
printBoard(player1);
transformWord(player1);
printBoard(player1);



/*

// Fonction pour calculer la valeur d'un mot
function calculateWordValue(word) {
  let value = 0;
  for (let i = 0; i < word.length; i++) {
    value += letterValues[word[i].toUpperCase()] || 0;
  }
  return value;
}

// Fonction pour initialiser le plateau de jeu
function initializeBoard() {
  const words = ['JARNAC', 'JAVA', 'SCRIPT'];  // Exemple de mots sur le plateau
  words.forEach(word => {
    const wordValue = calculateWordValue(word);
    console.log(`${word} - Value: ${wordValue}`);
  });
}

// Appeler la fonction d'initialisation
initializeBoard();

// Utiliser readline pour obtenir l'entrée de l'utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

// Exemple de demande de mot à l'utilisateur
rl.question('Entrez un mot : ', (userInput) => {
  console.log(`Vous avez saisi : ${userInput}`);
  rl.close();
});
*/