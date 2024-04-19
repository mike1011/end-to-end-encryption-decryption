import React, { useState, useEffect } from "react";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import axios from "axios";

const DirectChat = () => {
  const [keyPair, setKeyPair] = useState(null);
  const [message, setMessage] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [nonce, setNonce] = useState("");
  const [backendData, setBackendData] = useState({});

  const userEmail = "user@example.com";
  const userPassphrase = "Iamspiderman@123";
  const APPLICATION_SECRET = "your-application-specific-fixed-secret";

  useEffect(() => {
    generateAndStoreKeys();
  }, []);

  const generateDeterministicSalt = async (userPassphrase) => {
    const hashInput = `${userEmail}-${userPassphrase}-${APPLICATION_SECRET}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const createEncryptionKey = async (userPassphrase, userSalt) => {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(userPassphrase),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode(userSalt),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  };

  const encryptData = async (data, key) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedData
    );
    return {
      encryptedData: Array.from(new Uint8Array(encryptedData))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      iv: Array.from(iv)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    };
  };

  const decryptData = async (encryptedData, iv, key) => {
    const ivArray = new Uint8Array(
      iv.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))
    );
    const encryptedArray = new Uint8Array(
      encryptedData.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))
    );
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivArray },
      key,
      encryptedArray
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  };

  const generateAndStoreKeys = async () => {
    const salt = await generateDeterministicSalt(userPassphrase);
    const encryptionKey = await createEncryptionKey(userPassphrase, salt);
    const newKeyPair = nacl.box.keyPair();
    const publicKeyBase64 = util.encodeBase64(newKeyPair.publicKey);
    const secretKeyBase64 = util.encodeBase64(newKeyPair.secretKey);

    const encryptedPublicKey = await encryptData(
      publicKeyBase64,
      encryptionKey
    );
    const encryptedSecretKey = await encryptData(
      secretKeyBase64,
      encryptionKey
    );

    // Simulate storing encrypted keys as if they were in a backend
    setBackendData({
      publicKeyEnc: encryptedPublicKey.encryptedData,
      publicKeyIv: encryptedPublicKey.iv,
      secretKeyEnc: encryptedSecretKey.encryptedData,
      secretKeyIv: encryptedSecretKey.iv,
    });

    console.log("Keys encrypted and saved successfully.", publicKeyBase64, secretKeyBase64);
    setKeyPair(newKeyPair);
  };

  const fetchAndDecryptKeys = async () => {
    const { publicKeyEnc, publicKeyIv, secretKeyEnc, secretKeyIv } =
      backendData;
    const salt = await generateDeterministicSalt(userPassphrase);
    const encryptionKey = await createEncryptionKey(userPassphrase, salt);

    const decryptedPublicKeyBase64 = await decryptData(
      publicKeyEnc,
      publicKeyIv,
      encryptionKey
    );
    const decryptedSecretKeyBase64 = await decryptData(
      secretKeyEnc,
      secretKeyIv,
      encryptionKey
    );

    const publicKey = util.decodeBase64(decryptedPublicKeyBase64);
    const secretKey = util.decodeBase64(decryptedSecretKeyBase64);

    // Update the keyPair state with the decrypted keys
    setKeyPair({ publicKey, secretKey });
    console.log("Keys fetched and decrypted successfully.", decryptedPublicKeyBase64, decryptedSecretKeyBase64);
  };

  const encryptMessage = async (plaintext) => {
    if (!keyPair) {
      console.error("Key pair not available.");
      return;
    }
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = util.decodeUTF8(plaintext);
    const encrypted = nacl.box(
      messageUint8,
      nonce,
      keyPair.publicKey,
      keyPair.secretKey
    );
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);
    setEncryptedMessage(util.encodeBase64(fullMessage));
    setNonce(util.encodeBase64(nonce));
  };

  const decryptMessage = async (encryptedMessage, nonce) => {
    if (!keyPair) {
      console.error("Key pair not available.");
      return;
    }
    const nonceUint8 = util.decodeBase64(nonce);
    const messageWithNonceAsUint8Array = util.decodeBase64(encryptedMessage);
    const message = messageWithNonceAsUint8Array.slice(nacl.box.nonceLength);
    const decrypted = nacl.box.open(
      message,
      nonceUint8,
      keyPair.publicKey,
      keyPair.secretKey
    );
    setDecryptedMessage(
      decrypted ? util.encodeUTF8(decrypted) : "Could not decrypt message."
    );
  };

  return (
    <div>
      <h1>Direct Chat - Asymmetric Encryption</h1>
      <button onClick={fetchAndDecryptKeys}>Fetch and Decrypt Keys</button>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={() => encryptMessage(message)}>Encrypt</button>
      <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        <strong>Encrypted:</strong> {encryptedMessage}
      </p>
      <button onClick={() => decryptMessage(encryptedMessage, nonce)}>
        Decrypt
      </button>
      <p>Decrypted: {decryptedMessage}</p>
    </div>
  );
};

export default DirectChat;
