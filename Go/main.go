package main

import (
	"fmt" // For printing and scanning
	"math/rand"
)

var t int // C'est un scope, il permettra de connaitre la variable t partout (il est en dehors de toutes func), ici cest un scope global, qui permet de communiquer t
// sur tout les fichiers ayant le même package

func main() {
	fmt.Printf("Hello world!")

	var x int // uint ne permet que de mettre des valeurs positives alors que int permet les 2, u = unsigned
	x = 12    // uint8 permet d'aller de 0 à 255 et int8 de -128 à 127 (8 por 8 bits d'espace de stockage)
	y := 16   // Assigne directement que "y" est un int avec les ":"

	var ( // var pour variable (int ou uint , bool, string, float32 ou 64, complex64 ou 128 et des alias tel que byte (alias de uint8) ou rune (alias de int32))
		z int
	)

	fmt.Printf("Mon nombre est : %v \n", x) // %v = %variable
	fmt.Println(x, y)                       // si on veut afficher que les variables (comme en JAVA)

	// + - * / %
	fmt.Println(x + y)
	// == != >= <= < > renvoie true ou false
	// && || et logique ou logique

	if z = rand.Int(); z%2 == 0 { // if Statement ; Condition { (le Statement n'est pas obligatoire la plupart du temps si z est déjà assigné)
		fmt.Println(z, "est un nombre paire")
	} else { // On peut aussi avoir else if Statement ; Condition {
		fmt.Println(z, "est un nombre impaire")
	}

	/*for InitStatement ; Condition; UpdateStatement { comme en Python
	*On peut aussi avoir for Condition{ code+UpdateStatement } car le InitStatement n'est pas obligatoire si i est déjà assigné : Il se comporte comme un whyle
	*On peut faire des break
	*On peut aussi ne rien mettre dans les condtions du for et faire un break : for { if x>5{break} else{x++} }
	*On peut aussi faire des continue pour sauter des étapes sans rien faire et passé à l'incrément suivant
	 */
	for ; x < 100; x++ { // le premier ; est obligatoire avec une incrémentation dans le for pour ne pas avoir d'erreur de syntaxe
		if x%2 == 1 {
			continue // ici on saute tout les nombres impaires
		}
		fmt.Println(x)
	}

	// un array, c'est une liste, elle peut être de tout les types et ils peut stocker plusieurs types différents
	var list [2]int // ici une liste de taille 2
	list[0] = 10
	list[1] = 20

	newList := [7]int{1, 2, 3, 4, 5, 6, 7} //[...] comptera automatiquement le nombre d'élément de la liste, pas besoin de mettre 7
	// range newList pour obtenir 7
	for pos, value := range newList { //Pour afficher les valeurs d'un array et le range permet d'avoir la position et la valeur en même temps (_ pour ignorer une valeur)
		fmt.Printf("Position %d est égale à %d.\n", pos, value)
	}
	//map = classe: on peut avoir un nom lié à une valeur
	supermarketprice := map[string]int{ // string est la clé, le supermarché.string, et int est la valeur lié à la clé (on peut choisir n'importe qu'elle type pour la clé ou pour la valeur)
		"prince": 3,
		"eau":    2,
		"viande": 6,
	}
	fmt.Println(supermarketprice["prince"]) // affichera 3
}
func sayHello(name string) {
	fmt.Printf("Bjr, je m'appelle %v.\n", name)
	t := 10 //scope local
	fmt.Println(t)
}
func calculePerRect(a, b int) (int, string) { // le int{ est le type de varaible à renvoyer. On peut avoir plusieurs type de return avec (int, string, error){
	message := fmt.Sprint("Yo") // Pour stocker un print
	return 2 * (a + b), message
}

// error est un type de renvoie avec return error.New("\bErreur: vous avez fait une erreur")
// si on a plusieurs types de return, il faut tous les renvoyer à chaque return : return 2,"", error.New...
// dans le terminal, pour appeler plusieurs ayant le même package (obligatoire pour faire comprendre les que les fichiers sont liés), il faut tous les citer dans le go run ./...0
