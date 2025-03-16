package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/hex"
	"errors"
)

var key, _ = hex.DecodeString("37215d395771592a4a766d516856")

func main() {

}

func AesDecrypt(text []byte, halfKey string) (string, error) {
	finalKey := []byte(string(key) + halfKey)
	block, err := aes.NewCipher(finalKey)
	if err != nil {
		return "", err
	}

	if len(text) < aes.BlockSize {
		return "", errors.New("cipherText too short")
	}

	iv := text[:aes.BlockSize]
	text = text[aes.BlockSize:]
	cfb := cipher.NewCFBDecrypter(block, iv)
	cfb.XORKeyStream(text, text)
	data, e := base64.StdEncoding.DecodeString(string(text))
	if e != nil {
		return "", e
	}
	return string(data), e
}
