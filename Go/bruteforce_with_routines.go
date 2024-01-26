package main

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
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
			mu.Lock()
			results <- fmt.Sprintf("%s : Mot de passe trouvé : %s\n", passwordHash, password)
			mu.Unlock()
		} else {
			mu.Lock()
			results <- fmt.Sprintf("%s : Échec du bruteforce\n", passwordHash)
			mu.Unlock()
		}
	}
}

func bruteforceAll(passwordHashesPath string, dictionaryPath string, outputPath string, numWorkers int) {
	startTime := time.Now()

	passwordHashesFile, err := os.Open(passwordHashesPath)
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture du fichier de sommes de hachages:", err)
		return
	}
	defer passwordHashesFile.Close()

	outputFile, err := os.Create(outputPath)
	if err != nil {
		fmt.Println("Erreur lors de la création du fichier de résultats:", err)
		return
	}
	defer outputFile.Close()

	var passwordHashes []string
	scanner := bufio.NewScanner(passwordHashesFile)
	for scanner.Scan() {
		passwordHashes = append(passwordHashes, scanner.Text())
	}

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

	elapsedTime := time.Since(startTime)
	fmt.Printf("Bruteforce terminé en %s.\n", elapsedTime)
}

func main() {
	passwordHashesPath := "hash_sums.found"
	dictionaryPath := "hashmob.net_2024-01-07.medium.found"
	outputPath := "bruteforce_output.txt"
	numWorkers := 8 // You can adjust the number of workers based on your requirements

	bruteforceAll(passwordHashesPath, dictionaryPath, outputPath, numWorkers)
}
