package main

import (
	"crypto/sha1"
	"fmt"
)

func hash() {
	password := "linkedin"
	sum := sha1.Sum([]byte(password))
	fmt.Printf("%x", sum)
}
