package main

import (
		"encoding/base64"
	"io"
	"crypto/rand"
	"crypto/cipher"
	"encoding/hex"
	"crypto/aes"
	"fmt"

	"github.com/gopherjs/gopherjs/js"
	)


var key,_ = hex.DecodeString("3a3e567a576b405136324c247238484d6e55755f357a")

type Output struct {
	text    []byte
	halfkey string
}

func main() {
	fmt.Println("mainnnnnnnnnnnnnnnnnnn")
	js.Module.Get("exports").Set("pet", map[string]interface{}{
		"NewEnc": NewEnc,
	})
}

func NewEnc(text []byte, halfkey string) *js.Object {
	fmt.Println("new encrypt")
	return js.MakeWrapper(&Output{text, halfkey})
}

func (p *Output) encrypt()string  {
	fmt.Println("encryptttttttttttttt")
	plaintext := p.text
	halfKey := p.halfkey

	key := []byte(string(key)+halfKey)

	block, err := aes.NewCipher(key)
	if err != nil {
		return ""
	}

	nonce, saltKey, _ :=generateSaltAndNonce()
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return ""
	}

	cipherText := aesgcm.Seal(nil, nonce, plaintext, nil)
	return  saltKey+base64.StdEncoding.EncodeToString(nonce)+base64.StdEncoding.EncodeToString(cipherText)

}



func generateSaltAndNonce() ([]byte, string, error) {
	// Never use more than 2^32 random nonces with a given key because of
	// the risk of a repeat.
	nonce := make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, "", err
	}

	randomSalt := make([]byte, 4)
	if _, err := io.ReadFull(rand.Reader, randomSalt); err != nil {
		return nil, "", err
	}

	return nonce, fmt.Sprintf("%x", randomSalt), nil
}


