package main

import (
	"bufio"
	"fmt"
	"io"
	"net"
	"os"
	"strconv"
)

func main() {
	conn, err := net.Dial("tcp", "localhost:8080")
	if err != nil {
		fmt.Println("Erreur lors de la connexion au serveur:", err)
		return
	}
	defer conn.Close()

	user_scanner := bufio.NewScanner(os.Stdin)

	// Demander le nombre de workers
	for {
		fmt.Print("Entrez le nombre de workers : ")
		user_scanner.Scan()
		numWorkers := user_scanner.Text()
		if _, err := strconv.Atoi(numWorkers); err == nil {
			// Envoyer le nombre de workers au serveur
			conn.Write([]byte(numWorkers + "\n"))
			break
		}
		fmt.Println("Erreur : Veuillez entrer un chiffre valide")
	}

	// Demander le chemin/nom du fichier de hachages
	fmt.Print("Entrez le chemin/nom du fichier de hachages : ")
	user_scanner.Scan()
	hashesFilePath := user_scanner.Text()

	for {
		if _, err := os.Stat(hashesFilePath); os.IsNotExist(err) {
			fmt.Print("Le fichier spécifié n'existe pas.\nEntrez un chemin/nom de fichier valide : ")
			user_scanner.Scan()
			hashesFilePath = user_scanner.Text()
		} else {
			break
		}
	}

	file, err := os.Open(hashesFilePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

	// Envoyer le fichier des sommes de hachages au serveur
	_, err = io.Copy(conn, file)
	if err != nil {
		fmt.Println("Error sending file:", err)
		return
	}
	// Envoyer un message spécial pour indiquer que l'envoi est terminé
	_, err = conn.Write([]byte("END_OF_FILE_TRANSFER\n"))
	if err != nil {
		fmt.Println("Error sending end of file message:", err)
		return
	}

	fmt.Println("Fichier envoyé avec succès. Bruteforce en cours...")

	//récetion du fichier bruteforce_output
	bruteforce_output, err := os.Create("bruteforce_output_" + conn.LocalAddr().String() + ".txt")
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer bruteforce_output.Close()

	resultScanner := bufio.NewScanner(conn)
	for resultScanner.Scan() {
		line := resultScanner.Text()
		if line == "END_OF_FILE_TRANSFER" {
			break
		}

		_, err := bruteforce_output.WriteString(line + "\n")
		if err != nil {
			fmt.Println("Erreur lors de l'écriture du fichier reçu :", err)
			return
		}
	}

	fmt.Println("voir " + bruteforce_output.Name())

	// Lire les résultats du serveur et les afficher
	for resultScanner.Scan() {
		fmt.Println(resultScanner.Text())
	}

	if err := resultScanner.Err(); err != nil {
		fmt.Println("Erreur lors de la lecture des résultats du serveur:", err)
	}
}
