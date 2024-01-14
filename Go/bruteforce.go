package main

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
)

func hashPassword(password string) string {
	hash := sha256.New()
	hash.Write([]byte(password))
	return hex.EncodeToString(hash.Sum(nil))
}

func bruteforce(passwordHash string, dictionaryPath string) bool {
	file, err := os.Open(dictionaryPath)
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture du fichier de dictionnaire:", err)
		return false
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	lineNumber := 1

	for scanner.Scan() {
		password := scanner.Text()
		hash := hashPassword(password)

		if hash == passwordHash {
			fmt.Printf("Mot de passe trouvé : %s\n", password)
			fmt.Printf("Trouvé à la ligne %d du dictionnaire.\n", lineNumber)
			return true
		}

		lineNumber++
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Erreur lors de la lecture du fichier de dictionnaire:", err)
		return false
	}

	fmt.Println("Aucun mot de passe trouvé dans le dictionnaire.")
	return false
}

func main() {
	passwordHash := "aea9d8490e66f66e51c19f1e4e0e1b3769cf74a6c6ed8379fe8b62cb4c89ba04"
	dictionaryPath := "hashmob.net_2024-01-07.medium.found"

	if bruteforce(passwordHash, dictionaryPath) {
		fmt.Println("Bruteforce réussi!")
	} else {
		fmt.Println("Échec du bruteforce.")
	}
}
