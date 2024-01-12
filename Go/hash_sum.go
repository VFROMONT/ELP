package main

import (
	"crypto/sha1"
	"fmt"
)

func hash() {
	password := "test"
	sum := sha1.Sum([]byte(password))
	fmt.Printf("%x", sum)
}
