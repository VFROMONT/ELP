const readlineSync = require('readline-sync');
const fs = require('fs');
const logFileName = 'log.txt';
fs.writeFileSync(logFileName, '');
let turnCounter = 0;


// Définir la liste des lettres et leurs valeurs
let letterValues = {
  'A': 14, 'B': 4, 'C': 7, 'D': 5, 'E': 19, 'F': 2, 'G': 4, 'H': 2, 'I': 11,
  'J': 1, 'K': 1, 'L': 6, 'M': 5, 'N': 9, 'O': 8, 'P': 4, 'Q': 1, 'R': 10,
  'S': 7, 'T': 9, 'U': 8, 'V': 2, 'W': 1, 'X': 1, 'Y': 1, 'Z': 2
};

let game_start = true;

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
function addWord(player, playerBoard){
  let userInput;
  do{
    userInput = readlineSync.question('Entrez un mot : ');
    userInput =userInput.toUpperCase();
  } while (checkWord(userInput, player.hand) === false);
  console.log('Vous avez saisi : ' + userInput + "\n");
  playerBoard.push(userInput);
  for (const char of userInput) {
    const index = player.hand.indexOf(char);
    if (index !== -1) {
      player.hand.splice(index, 1);
    }
  }
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
function transformWord(player, playerBoard){
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
  player.board.splice(index, 1)
  playerBoard.push(newWord);
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
}

//fonction pour échanger 3 lettres
function exchangeLetters(player){
  do {
    exchange = readlineSync.question('Quelles lettres voulez-vous échanger : ');
    exchange = exchange.toUpperCase();
  } while (checkLettersExchange(exchange, player.hand) === false);
  //supprimer les lettres saisies de la main du joueur
  for (const char of exchange) {
    letterValues[char]++;
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
  console.log("\x1b[31m" + current_player.name + " fait un coup de jarnac!\x1b[0m");
  do {
    action_choice = readlineSync.keyIn("Choisissez une action :\n1. Ajouter un mot | 2.Transformer un mot | 3. Terminer Jarnac\n", {hideEchoBack: true, mask: '', limit: '$<1-3>'});
    action_choice = parseInt(action_choice);
    if (action_choice == 1) {
      if(previous_player.hand.length < 3){
        console.log("\x1b[31m" + previous_player.name + "n'a pas assez de lettres dans sa main\x1b[0m");
      }
      else {
        console.log("Ajouter un mot");
        addWord(previous_player, current_player.board);
        printBoard(previous_player)
        console.log("\x1b[" + previous_player.color + "mVoici la main de "+ previous_player.name + " : " + previous_player.hand + "\x1b[0m\n");
      }
    } else if (action_choice == 2) {
      console.log("Transformer un mot");
      transformWord(previous_player, current_player.board);
      printBoard(previous_player)
      console.log("\x1b[" + previous_player.color + "mVoici la main de "+ previous_player.name + " : " + previous_player.hand + "\x1b[0m\n");
    } else if (action_choice == 3) {
      console.log("\x1b[31m"+ current_player.name + " termine son coup de jarnac!\x1b[0m\n");
      printBoard(previous_player)
      console.log("\x1b[" + previous_player.color + "mVoici la main de "+ previous_player.name + " : " + previous_player.hand + "\x1b[0m\n");
      printBoard(current_player);
      console.log("\x1b[" + current_player.color + "mVoici votre main : " + current_player.hand + "\x1b[0m\n");
      
    }
  } while ((action_choice == 1 && !previous_player.hand.length < 3) || action_choice == 2 && action_choice!= 3);
}

function scoreWord(word){
  return word.length**2;
}

// fonction pour afficher le joueur gagnant
function calculateTotalScore(board){
  return board.reduce((total, word) => total + scoreWord(word), 0);
}

function displayWinner(player1, player2){
  const player1TotalScore = calculateTotalScore(player1.board);
  const player2TotalScore = calculateTotalScore(player2.board);
  console.log("Score de \x1b[" + player1.color + "m" + player1.name + " : " + player1TotalScore + "\x1b[0m");
  console.log("Score de \x1b[" + player2.color + "m" + player2.name + " : " + player2TotalScore + "\x1b[0m");
  fs.appendFileSync(logFileName, "Score de " + player1.name + " : " + player1TotalScore + "\n");
  fs.appendFileSync(logFileName, "Score de " + player2.name + " : " + player2TotalScore + "\n");

  if (player1TotalScore > player2TotalScore) {
    console.log("\x1b[" + player1.color + "m" + player1.name + "\x1b[0m a gagné la partie !");
    fs.appendFileSync(logFileName, player1.name + " a gagné la partie !\n");
  } else if (player2TotalScore > player1TotalScore) {
    console.log("\x1b[" + player2.color + "m" + player2.name + "\x1b[0m a gagné la partie !");
    fs.appendFileSync(logFileName, player2.name + " a gagné la partie !\n");
  } else {
    console.log("La partie est nulle, il n'y a pas de gagnant.");
    fs.appendFileSync(logFileName, "La partie est nulle, il n'y a pas de gagnant.");
  }
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
      turnCounter++;
      fs.appendFileSync(logFileName, "Tour : " + turnCounter + "\n");
      if(player1.board.length >= 8 || player2.board.length >= 8) {
        break players_loop;
      }
      let action_choice=1;
      previousPlayer = player === player1 ? player2 : player1;
      if(!player.first_turn){
        player.begin_turn = true;
      }
      turn_loop:
      do {
        //si c'est le premier tour du joueur
        if(player.first_turn){
          console.clear();
          console.log("\x1b[" + player.color + "m" + player.name + "\x1b[0m c'est votre tour !\n");
          fs.appendFileSync(logFileName, "C'est le tour de " + player.name + "\n");
          draw6Letters(player);
          //si l'on n'est pas au démarrage du jeu
          if(!game_start && previousPlayer.board.length >= 1){
            printBoard(previousPlayer);
            console.log("\x1b[" + previousPlayer.color + "mVoici la main de "+ previousPlayer.name + " :" + previousPlayer.hand + "\x1b[0m\n");
            printBoard(player);
            console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
            action_choice = readlineSync.keyIn("Voulez-vous faire un coup de Jarnac ?\n1. Oui | 2. Non\n", {hideEchoBack: true, mask: '', limit: '$<1-3>'});
            action_choice = parseInt(action_choice);
            if(action_choice == 1){
              fs.appendFileSync(logFileName, player.name + " a fait un coup de Jarnac\n");
              jarnac(previousPlayer, player);
            }
          }
          game_start = false;
          console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
          action_choice = readlineSync.keyIn("Choisissez une action :\n1. Ajouter un mot | 2. Passer\n", {hideEchoBack: true, mask: '', limit: '$<1-2>'});
          action_choice = parseInt(action_choice);
          if(action_choice == 1){
            addWord(player, player.board);
            fs.appendFileSync(logFileName, player.name + " a ajouté un mot\n");
            draw1Letter(player);
            printBoard(player);
            console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
          }
          else{
            fs.appendFileSync(logFileName, player.name + " a passe son tour\n");
            player.first_turn = false;
            break turn_loop;
          }
          player.first_turn = false;
        }
        else {
          //si c'est le début du tour du joueur
          if(player.begin_turn){
            console.clear();
            console.log("\x1b[" + player.color + "m" + player.name + "\x1b[0m c'est votre tour !\n");
            fs.appendFileSync(logFileName, "C'est le tour de " + player.name + "\n");
            //print le board de l'autre joueur
            printBoard(previousPlayer);
            console.log("\x1b[" + previousPlayer.color + "mVoici la main de "+ previousPlayer.name + " :" + previousPlayer.hand + "\x1b[0m\n");
            printBoard(player);
            console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
            if(previousPlayer.board.length >= 1){
              action_choice = readlineSync.keyIn("Voulez-vous faire un coup de Jarnac ?\n1. Oui | 2. Non\n", {hideEchoBack: true, mask: '', limit: '$<1-3>'});
              action_choice = parseInt(action_choice);
              if(action_choice == 1){
                fs.appendFileSync(logFileName, player.name + " a fait un coup de Jarnac\n");
                jarnac(previousPlayer, player);
              }
            }
            action_choice = readlineSync.keyIn("Choisissez une action :\n1. Tirer une lettre | 2. Echanger 3 lettres\n", {hideEchoBack: true, mask: '', limit: '$<1-2>'});
            action_choice = parseInt(action_choice);
            if (action_choice == 1) {
              fs.appendFileSync(logFileName, player.name + " a pioché une lettre\n");
              draw1Letter(player);
              console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
            }
            else if (action_choice == 2) {
              if (player.hand.length < 3) {
                console.log("\x1b[31mVous n'avez pas assez de lettres à échanger... tirage d'une lettre\x1b[0m\n");
                fs.appendFileSync(logFileName, player.name + " a pioché une lettre\n");
                draw1Letter(player);
                console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
              }
              else {
                fs.appendFileSync(logFileName, player.name + " a échangé 3 lettres\n");
                exchangeLetters(player);
                console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
              }
            }
            player.begin_turn = false;
          }
          
          action_choice = readlineSync.keyIn("Choisissez une action :\n1. Ajouter un mot | 2.Transformer un mot | 3. Passer\n", {hideEchoBack: true, mask: '', limit: '$<1-3>'});
          action_choice = parseInt(action_choice);
          if (action_choice == 1) {
            if(player.hand.length < 3){
              console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
            }
            else {
              console.log("Ajouter un mot");
              addWord(player, player.board);
              fs.appendFileSync(logFileName, player.name + " a ajouté un mot\n");
              draw1Letter(player);
              printBoard(player);
            }
            console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
          } else if (action_choice == 2) {
            console.log("Transformer un mot");
            transformWord(player, player.board);
            fs.appendFileSync(logFileName, player.name + " a transformé un mot\n");
            draw1Letter(player);
            printBoard(player);
            console.log("\x1b[" + player.color + "mVoici votre main : " + player.hand + "\x1b[0m\n");
          } else if (action_choice == 3) {
            fs.appendFileSync(logFileName, player.name + " passe son tour\n");
            console.log("\x1b[" + player.color + "m"+ player.name + "\x1b[0m passe son tour !");
          }
        }
      } while ((action_choice == 1 && !player.hand.length < 3) || action_choice == 2 && action_choice!= 3);
    }
  } while (player1.board.length < 8 && player2.board.length < 8);
  console.log("\nPartie terminée !");
  fs.appendFileSync(logFileName, "Partie terminée!\n");
  displayWinner(player1, player2);
}

startGame();