package main

import (
	"bufio"
	"log"
	"os"
)

var size = 10

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
