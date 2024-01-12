package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
)

func tabmdpsep() [][]string {
	readFile, err := os.Open("motdepasse.txt")
	if err != nil {
		log.Fatal(err)
	}
	fileScanner := bufio.NewScanner(readFile)
	fileScanner.Split(bufio.ScanLines)
	var lines []string
	for fileScanner.Scan() {
		lines = append(lines, fileScanner.Text())
	}
	readFile.Close()
	var tabmdp [][]string
	for _, line := range lines {
		for i := 0; i < size; i++ {
			for j := 0; j < len(lines)/10; j++ {
				tabmdp[i][j] = line
			}
		}
	}
	return tabmdp
}

func hash()

func compareHashes(pairChan <-chan [2]string, resultChan chan<- string, hashed_pwd []string) {
	for pair := range pairChan {
		password, hashed := pair[0], pair[1]
		for _, fileHash := range hashed_pwd {
			if hashed == fileHash {
				resultChan <- password
				return
			}
		}
	}
}

// pairChan où je reçois les couples (pwd,hashed pwd ) de la fonction de hash

func main() {
	filename1 := "motdepasse.txt"
	numGoroutines := 10
	// Read the hashed passwords from the file
	mdp, err := tabmdpsep(filename1)
	hashed_mdp := tabmdpsep("hashed_pwd")
	if err != nil {
		log.Fatalf("Failed to read hashed passwords: %v", err)
	}

	pairChan := make(chan [2]string)
	resultChan := make(chan string)

	// goroutines pour hash et comparaison
	go hashPassword(mdp, pairChan)

	// Si plusieurs couples (pwd, hashed pwd) reçus à la fois
	for i := 0; i < numGoroutines; i++ {
		go compareHashes(pairChan, resultChan, hashed_mdp)
	}

	for range mdp {
		matchedPassword := <-resultChan
		fmt.Printf("Match found for: %s\n", matchedPassword)
	}
}
