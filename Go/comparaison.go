package main

func compareHashes(pairChan <-chan [2]string, resultChan chan<- string, tabmdp []string) {
	for pair := range pairChan {
		password, hashed := pair[0], pair[1]
		for _, fileHash := range tabmdp {
			if hashed == fileHash {
				resultChan <- password
				return
			}
		}
	}
}

// pairChan où je reçois les couples (pwd,hashed pwd ) de la fonction de hash
