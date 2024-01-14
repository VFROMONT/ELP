package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strings"
)

func main() {
	// var tabmdp = [][] string{ }
	arguments := os.Args
	if len(arguments) == 1 {
		fmt.Println("Please provide host:port.") // go run tcpC.go host:port
		return
	}

	CONNECT := arguments[1]
	c, err := net.Dial("tcp", CONNECT)
	if err != nil {
		fmt.Println(err)
		return
	}

	for {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Veuillez choisir un des codes suivant en donnant son numéro :\n ")
		fmt.Print("0:    / 1:     /\n ")   // Mettre les codes passés à travers la fct de hash
		text, _ := reader.ReadString('\n') // text = message à envoyer
		fmt.Fprintf(c, text+"\n")

		message, _ := bufio.NewReader(c).ReadString('\n')
		fmt.Print("->: " + message)
		if strings.TrimSpace(string(text)) == "STOP" { // Pour fermer la connexion via le message STOP envoyer depuis le client (ici)
			fmt.Println("TCP client exiting...")
			return
		}
	}
}
