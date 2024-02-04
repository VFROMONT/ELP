const readlineSync = require('readline-sync');

// Définir la liste des lettres et leurs valeurs
let letterValues = {
  'A': 14, 'B': 4, 'C': 7, 'D': 5, 'E': 19, 'F': 2, 'G': 4, 'H': 2, 'I': 11,
  'J': 1, 'K': 1, 'L': 6, 'M': 5, 'N': 9, 'O': 8, 'P': 4, 'Q': 1, 'R': 10,
  'S': 7, 'T': 9, 'U': 8, 'V': 2, 'W': 1, 'X': 1, 'Y': 1, 'Z': 2
};

// Définition de la classe Player
function Player(name){
  this.name = name;
  this.hand = [];
  this.board = [];
  this.first_turn = true;
  this.begin_turn = false;
  this.color = "";
}


// fonction pile ou face
function flipCoin(name_first_player, name_second_player){
  if (Math.random() < 0.5) {
    return [name_first_player, name_second_player];
  }
  else {
    return [name_second_player, name_first_player];
  }
}

// fonction qui tire 6 lettres au hasard et les ajoute à la main du joueur
function draw6Letters(player) {
  for (let i = 0; i < 6; i++) {
    draw1Letter(player);
  }
}

// fonction qui tire une lettre au hasard et l'ajoute à la main du joueur
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

// fonction qui check si le mot est valide
function checkWord(word, playerHand){
  if (word.length < 3) return false;
  for (let i = 0; i < word.length; i++) {
    if (!playerHand.includes(word[i])) {
      return false;
    }
  }
  return true;
}

function checkLettersExchange(letters, playerHand){
  if (letters.length != 3) return false;
  for (let i = 0; i < letters.length; i++) {
    if (!playerHand.includes(letters[i])) {
      return false;
    }
  }
  return true;
}

// fonction qui affiche le plateau de jeu du joueur
function printBoard(player){
  console.log("\x1b[" + player.color +"mBoard du joueur " + player.name + " : \n");
  for (let i = 0; i < player.board.length; i++) {
    console.log("\x1b["+ player.color + "m" + player.board[i]+ "\x1b[0m\n");
  }
}

// fonction qui ajoute un mot au plateau de jeu du joueur
function addWord(player){
  let userInput;
  do{
    userInput = readlineSync.question('Entrez un mot : ');
    userInput =userInput.toUpperCase();
  } while (checkWord(userInput, player.hand) === false);
  console.log('Vous avez saisi : ' + userInput + "\n");
  player.board.push(userInput);
  for (const char of userInput) {
    const index = player.hand.indexOf(char);
    if (index !== -1) {
      player.hand.splice(index, 1);
    }
  }
  draw1Letter(player);
}

// fonction qui check si la transformation du mot est valide
function checkWordTransform(oldWord, newWord, playerHand){
  if (newWord.length < 3) return false;
  const oldWordLetters = oldWord.split('');
  const newWordLetters = newWord.split('');
  // Vérifier que chaque lettre du nouveau mot est dans la main du joueur et était présente dans l'ancien mot
  for (let i = 0; i < newWordLetters.length; i++) {
    if (!(playerHand.includes(newWordLetters[i]) || oldWordLetters.includes(newWordLetters[i]))) {
      return false;
    }
  }
  // Vérifier que chaque lettre de l'ancien mot est présente dans le nouveau mot
  for (let i = 0; i < oldWordLetters.length; i++) {
    if (!newWordLetters.includes(oldWordLetters[i])) {
      return false;
    }
  }

  // Si toutes les conditions sont remplies, le mot est correctement transformé
  return true;
}

// fonction qui transforme un mot du plateau de jeu du joueur
function transformWord(player){
  let index;
  do {
    index = readlineSync.question('Entrez la ligne du mot a transformer : ');
    index = parseInt(index) - 1;
    oldWord = player.board[index];
  } while (index < 0 || index >= player.board.length || oldWord === undefined);
  
  console.log('Vous avez choisi de transformer le mot : ' + oldWord);
  
  let newWord;
  do{
    newWord = readlineSync.question('Entrez le nouveau mot : ');
    newWord = newWord.toUpperCase();
  } while (checkWordTransform(oldWord, newWord, player.hand) === false);
  console.log('Vous avez saisi : ' + newWord + "\n");
  player.board[index] = newWord;
  for (const char of newWord) {
    const countInNewWord = newWord.split(char).length - 1;
    const countInOldWord = oldWord.split(char).length - 1;
    if (countInNewWord > countInOldWord) {
        const excessCount = countInNewWord - countInOldWord;
        for (let i = 0; i < excessCount; i++) {
            const index = player.hand.indexOf(char);
            if (index !== -1) {
                player.hand.splice(index, 1);
            }
        }
    }
}

  draw1Letter(player);
}

//fonction pour échanger 3 lettres
function exchangeLetters(player){
  do {
    exchange = readlineSync.question('Quelles lettres voulez-vous échanger : ');
    exchange = exchange.toUpperCase();
  } while (checkLettersExchange(exchange, player.hand) === false);
  //supprimer les lettres saisies de la main du joueur
  for (const char of exchange) {
    const index = player.hand.indexOf(char);
    if (index !== -1) {
      player.hand.splice(index, 1);
    }
  }
  for (let i = 0; i < 3; i++) {
    draw1Letter(player);
  }
}

//fonction jarnac
function jarnac(previous_player, current_player) {
  console.log("\x1b[" + current_player.color + "m" + current_player.name + " fait un coup de jarnac!");
  /*
  action_choice = readlineSync.keyIn("Choisissez une action :\n1. Ajouter un mot | 2.Transformer un mot | 3. Terminer Jarnac\n", {hideEchoBack: true, mask: '', limit: '$<1-3>'});
  action_choice = parseInt(action_choice);
  if (action_choice == 1) {
    if(previous_player.hand.length < 3){
      console.log("\x1b[31m" + previous_player.name + "n'a pas assez de lettres dans sa main\x1b[0m");
    }
    else {
      console.log("Ajouter un mot");
      addWord(player);
      printBoard(current_player);
    }
    console.log("Voici votre main : \x1b[" + player.color + "m" + player.hand + "\x1b[0m\n");
  } else if (action_choice == 2) {
    console.log("Transformer un mot");
    transformWord(player);
    printBoard(player);
    console.log("Voici votre main : \x1b[" + player.color + "m" + player.hand + "\x1b[0m\n");
  } else if (action_choice == 3) {
    console.log("\x1b[" + player.color + "m"+ player.name + "\x1b[0m termine son coup de jarnac!");
  }*/
}

function scoreWord(word){
  return word.length**2;
}

async function startGame(){
  name_first_player = readlineSync.question('Entrez votre nom de joueur : ');
  name_second_player = readlineSync.question('Entrez votre nom de joueur : ');
  let players = flipCoin(name_first_player, name_second_player);
  let player1 = new Player(players[0]);
  let player2 = new Player(players[1]);
  players = [player1, player2];
  player1.color = "36";
  player2.color = "33"

  do {
    players_loop:
    for (const player of players) {
      if(player1.board.length >= 3 || player2.board.length >= 3) {
        break players_loop;
      }
      let action_choice=1;
      previousPlayer = player === player1 ? player2 : player1;
      if(!player.first_turn){
        player.begin_turn = true;
      }
      do {
        if(player.first_turn){
          console.clear();
          console.log("\x1b[" + player.color + "m" + player.name + "\x1b[0m c'est votre tour !\n");
          draw6Letters(player);
          console.log("Voici votre main : \x1b[" + player.color + "m" + player.hand + "\x1b[0m\n");
          addWord(player);
          printBoard(player);
          console.log("Voici votre main : \x1b[" + player.color + "m" + player.hand + "\x1b[0m\n");
          player.first_turn = false;
        }
        else {
          if(player.begin_turn){
            console.clear();
            console.log("\x1b[" + player.color + "m" + player.name + "\x1b[0m c'est votre tour !\n");
            //print le board de l'autre joueur
            printBoard(previousPlayer);
            console.log("Voici la main de "+ previousPlayer.name + " : \x1b[" + previousPlayer.color + "m" + previousPlayer.hand + "\x1b[0m\n");
            printBoard(player);
            console.log("Voici votre main : \x1b[" + player.color + "m" + player.hand + "\x1b[0m\n");
            action_choice = readlineSync.keyIn("Choisissez une action :\n1. Jarnac! | 2. Tirer une lettre | 3. Echanger 3 lettres\n", {hideEchoBack: true, mask: '', limit: '$<1-2>'});
            action_choice = parseInt(action_choice);
            if(action_choice == 1){
              jarnac(previousPlayer, player);
            }
            else if (action_choice == 2) {
              draw1Letter(player);
            }
            else if (action_choice == 3) {
              exchangeLetters(player);
            }
            console.log("Voici votre main : \x1b[" + player.color + "m" + player.hand + "\x1b[0m\n");
            player.begin_turn = false;
          }
          
          action_choice = readlineSync.keyIn("Choisissez une action :\n1. Ajouter un mot | 2.Transformer un mot | 3. Passer\n", {hideEchoBack: true, mask: '', limit: '$<1-3>'});
          action_choice = parseInt(action_choice);
          if (action_choice == 1) {
            if(player.hand.length < 3){
              console.log("\x1b[31mVous n'avez pas assez de lettres dans votre main\x1b[0m");
            }
            else {
              console.log("Ajouter un mot");
              addWord(player);
              printBoard(player);
            }
            console.log("Voici votre main : \x1b[" + player.color + "m" + player.hand + "\x1b[0m\n");
          } else if (action_choice == 2) {
            console.log("Transformer un mot");
            transformWord(player);
            printBoard(player);
            console.log("Voici votre main : \x1b[" + player.color + "m" + player.hand + "\x1b[0m\n");
          } else if (action_choice == 3) {
            console.log("\x1b[" + player.color + "m"+ player.name + "\x1b[0m passe son tour !");
          }
        }
      } while ((action_choice == 1 && !player.hand.length < 3) || action_choice == 2 && action_choice!= 3);
    }
  } while (player1.board.length < 3 && player2.board.length < 3);
  console.log("\nPartie terminée !");
}

startGame();

// Création des instances de la classe Player
/*
let player1 = new Player("player1");
let player2 = new Player("player2");
let players = [player1, player2];


draw6Letters(player1);
console.log(player1.hand);
addWord(player1);
printBoard(player1);
transformWord(player1);
printBoard(player1);
*/


/*
async function startGame() {
  console.clear();
  let otherplayer
  currentPlayer=1
  for (let i = 0; i < players.length; i++) {
    draw6Letters(players[i]);
  }
  // Fonction récursive pour gérer les tours des joueurs
  async function playTurn() {
      console.log(`Joueur ${currentPlayer}, vos lettres : ${players[currentPlayer-1].hand}`);
      otherplayer = currentPlayer === 1 ? 2 : 1;
      console.log(`Joueur ${otherplayer}, ses lettres : ${players[otherplayer-1].hand}`)

      addWord(players[currentPlayer-1])
      draw1Letter(players[currentPlayer-1]);
      printBoard(players[currentPlayer-1]);
      transformWord(players[currentPlayer-1]);       
      console.log(`Fin du tour du joueur ${currentPlayer}`);
      currentPlayer = currentPlayer === 1 ? 2 : 1;
  // Attendre 2 secondes
      await delay(1000);
  // Effacer le contenu de la console
      console.clear();
      playTurn();
      }
      
  // Démarrer le premier tour
  playTurn();
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
startGame();
*/