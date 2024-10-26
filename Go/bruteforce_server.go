package main

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net"
	"os"
	"strconv"
	"sync"
	"time"
)

var (
	wg sync.WaitGroup
	mu sync.Mutex
)

func hashPassword(password string) string {
	hash := sha256.New()
	hash.Write([]byte(password))
	return hex.EncodeToString(hash.Sum(nil))
}

func bruteforce(passwordHash string, dictionaryPath string) (string, bool) {
	file, err := os.Open(dictionaryPath)
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture du fichier de dictionnaire:", err)
		return "", false
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		password := scanner.Text()
		hash := hashPassword(password)
		if hash == passwordHash {
			return password, true
		}
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Erreur lors de la lecture du fichier de dictionnaire:", err)
		return "", false
	}

	return "", false
}

func bruteforceWorker(passwordHashes []string, dictionaryPath string, results chan<- string) {
	defer wg.Done()

	for _, passwordHash := range passwordHashes {
		if password, found := bruteforce(passwordHash, dictionaryPath); found {
			results <- fmt.Sprintf("%s : Mot de passe trouvé : %s\n", passwordHash, password)
		} else {
			results <- fmt.Sprintf("%s : Échec du bruteforce\n", passwordHash)
		}
	}
}

func handleClient(conn net.Conn, dictionaryPath string, archive_files bool) {
	defer conn.Close()

	clientAddr := conn.RemoteAddr().String()

	scanner := bufio.NewScanner(conn)
	//récupérer le nombre de workers
	scanner.Scan()
	numWorkersStr := scanner.Text()

	numWorkers, err := strconv.Atoi(numWorkersStr)
	if err != nil {
		fmt.Println("Erreur de conversion de numWorkers en entier :", err)
		return
	}

	// récupérer le fichier de sommes de hachages
	// Ouvrir un nouveau fichier sur le serveur
	received_hashes, err := os.Create("received_hashes" + clientAddr + ".found")
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer received_hashes.Close()

	for scanner.Scan() {
		line := scanner.Text()
		if line == "END_OF_FILE_TRANSFER" {
			break
		}

		_, err := received_hashes.WriteString(line + "\n")
		if err != nil {
			fmt.Println("Erreur lors de l'écriture du fichier reçu :", err)
			return
		}
	}

	fmt.Println("Sommes de hachage reçues avec succès. Bruteforce en cours... (client : " + clientAddr + ")")

	// Lire le fichier de sommes de hachages

	passwordHashesFile, err := os.Open(received_hashes.Name())
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture du fichier de sommes de hachages:", err)
		return
	}
	defer passwordHashesFile.Close()

	outputFile, err := os.Create("server_output_" + clientAddr + ".txt")
	if err != nil {
		fmt.Println("Erreur lors de la création du fichier de résultats:", err)
		return
	}
	defer outputFile.Close()

	var passwordHashes []string
	hash_Scanner := bufio.NewScanner(passwordHashesFile)
	for hash_Scanner.Scan() {
		passwordHashes = append(passwordHashes, hash_Scanner.Text())
	}

	startTime := time.Now()

	results := make(chan string, len(passwordHashes))

	wg.Add(numWorkers)
	chunkSize := (len(passwordHashes) + numWorkers - 1) / numWorkers
	for i := 0; i < numWorkers; i++ {
		start := i * chunkSize
		end := (i + 1) * chunkSize
		if end > len(passwordHashes) {
			end = len(passwordHashes)
		}
		go bruteforceWorker(passwordHashes[start:end], dictionaryPath, results)
	}

	go func() {
		wg.Wait()
		close(results)
	}()

	for result := range results {
		outputFile.WriteString(result)
	}

	//Envoi du fichier bruteforce_output au client
	file, err := os.Open(outputFile.Name())
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

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

	elapsedTime := time.Since(startTime)
	fmt.Printf("Bruteforce terminé en %s. (client : %s)\n", elapsedTime, clientAddr)
	conn.Write([]byte("\nBruteforce terminé en " + elapsedTime.String() + "\n"))

	if archive_files != true {
		os.Remove("received_hashes" + clientAddr + ".found")
		os.Remove("server_output_" + clientAddr + ".txt")
	}

}

func main() {
	dictionaryPath := "hashmob.net_2024-01-07.medium.found"
	archive_files := false

	listener, err := net.Listen("tcp", ":8080")
	if err != nil {
		fmt.Println("Erreur lors de la création du serveur TCP:", err)
		return
	}
	defer listener.Close()

	fmt.Println("Serveur en attente de connexions sur le port 8080...")

	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Erreur lors de la connexion du client:", err)
			continue
		}

		fmt.Println("Nouvelle connexion client :", conn.RemoteAddr())
		go handleClient(conn, dictionaryPath, archive_files)
	}
}
