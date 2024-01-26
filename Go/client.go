package main

import (
	"fmt"
	"io"
	"net"
	"os"
)

func main() {
	// Define the server address and the file to send
	serverAddress := "localhost:8080"
	filePath := "hash_sum2.left"

	conn, err := net.Dial("tcp", serverAddress)
	if err != nil {
		fmt.Println("Error connecting to the server:", err)
		return
	}
	defer conn.Close()

	fmt.Println("Connected to the server.")

	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

	// Send the file
	_, err = io.Copy(conn, file)
	if err != nil {
		fmt.Println("Error sending file:", err)
		return
	}

	fmt.Println("File sent successfully.")
}
