package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/hex"

	"github.com/gopherjs/gopherjs/js"
)

var key,_ = hex.DecodeString("3a3e567a576b405136324c247238484d6e55755f357a")

type Output struct {
	text    string
	halfkey string
}

func New(text string, halfkey string) *js.Object {
	return js.MakeWrapper(&Output{text, halfkey})
}

func (p *Output) Name() string {
	input := p.text
	halfKey := p.halfkey

	nonceRange := input[8:24]
	nonce,_ := base64.StdEncoding.DecodeString(nonceRange)
	key := []byte(string(key)+halfKey)

	input = input[24:]
	cipherText,_ := base64.StdEncoding.DecodeString(input)
	block, err := aes.NewCipher(key)
	if err != nil {
		return err.Error()
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return err.Error()
	}

	output,e := aesgcm.Open(nil, nonce, cipherText, nil)
	if e!=nil {
		return e.Error()
	}

	return string(output)
}

func main() {
	js.Module.Get("exports").Set("pet", map[string]interface{}{
		"New": New,
	})
}