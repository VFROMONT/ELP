package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strings"
	"time"
)

func main() {
	arguments := os.Args
	if len(arguments) == 1 {
		fmt.Println("Please provide port number")
		return
	}

	PORT := ":" + arguments[1]
	l, err := net.Listen("tcp", PORT) //listen for TCP connection on port :port
	if err != nil {
		fmt.Println(err)
		return
	}
	defer l.Close()

	c, err := l.Accept() //Accept of TCP connection
	if err != nil {
		fmt.Println(err)
		return
	}

	for { //TantQue la connexion est ouverte
		netData, err := bufio.NewReader(c).ReadString('\n')
		if err != nil {
			fmt.Println(err)
			return
		}
		if strings.TrimSpace(string(netData)) == "STOP" { //Pour fermer la connexion
			fmt.Println("Exiting TCP server!")
			return
		}

		fmt.Print("-> ", string(netData)) // netData = message reçu
		fmt.Print("Début du hackage via le dictionnaire")
		t := time.Now()
		myTime := t.Format(time.RFC3339) + "\n"
		c.Write([]byte(myTime)) // Message à renvoyer
	}
}
