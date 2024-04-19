import React, { useState, useEffect } from "react";
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import CryptoJS from "crypto-js"; // Used for hashing if needed

const GroupChat = () => {
  const [sharedKey, setSharedKey] = useState(null);
  const [message, setMessage] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [iv, setIv] = useState(null);
  const [backendData, setBackendData] = useState({});
  const userEmail = "user@example.com";
  const userPassphrase = "Iamspiderman@123";
  const APPLICATION_SECRET = "your-application-specific-fixed-secret";

  useEffect(() => {
    generateAndStoreKey();
  }, []);

  const createEncryptionKey = async () => {
    // Generate a random key for symmetric encryption
    return nacl.randomBytes(nacl.secretbox.keyLength);
  };

  const generateDeterministicSalt = () => {
    // This is just a placeholder to simulate generating a salt, actually not used in encryption here.
    const hashInput = `${userEmail}-${userPassphrase}-${APPLICATION_SECRET}`;
    return CryptoJS.SHA256(hashInput).toString(CryptoJS.enc.Hex);
  };

  const generateAndStoreKey = async () => {
    const key = await createEncryptionKey();
    // Simulate encrypting and storing the key in the backend
    const encryptedKey = util.encodeBase64(key);
    setBackendData({ encryptedKey });
    console.log("Key generated and stored successfully.", encryptedKey);
    setSharedKey(key);
  };

  const fetchAndDecryptKeys = async () => {
    const { encryptedKey } = backendData;
    const key = util.decodeBase64(encryptedKey); // Simulating decryption by decoding
    setSharedKey(key);
    console.log("Key fetched and decrypted successfully.", encryptedKey);
  };

  const encryptMessage = async (plaintext, key) => {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const messageUint8 = util.decodeUTF8(plaintext);
    const encrypted = nacl.secretbox(messageUint8, nonce, key);
    setIv(util.encodeBase64(nonce));
    return util.encodeBase64(encrypted);
  };

  const decryptMessage = async (ciphertext, nonce, key) => {
    const messageWithNonceAsUint8Array = util.decodeBase64(ciphertext);
    const nonceUint8 = util.decodeBase64(nonce);
    const decrypted = nacl.secretbox.open(messageWithNonceAsUint8Array, nonceUint8, key);
    return decrypted ? util.encodeUTF8(decrypted) : "Failed to decrypt message.";
  };

  const handleEncrypt = async () => {
    if (!sharedKey) {
      console.error("Encryption key is not ready.");
      return;
    }
    const ciphertext = await encryptMessage(message, sharedKey);
    setEncryptedMessage(ciphertext);
  };

  const handleDecrypt = async () => {
    if (!sharedKey || !encryptedMessage || !iv) {
      console.error("Decryption prerequisites are not met.");
      return;
    }
    const plaintext = await decryptMessage(encryptedMessage, iv, sharedKey);
    setDecryptedMessage(plaintext);
  };

  return (
    <div>
      <h1>Group Chat - Symmetric Encryption</h1>
      <button onClick={fetchAndDecryptKeys}>Fetch and Decrypt Keys</button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={handleEncrypt}>Encrypt</button>
      <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        <strong>Encrypted:</strong> {encryptedMessage}
      </p>
      <button onClick={handleDecrypt}>Decrypt</button>
      <p>
        <strong>Decrypted:</strong> {decryptedMessage}
      </p>
    </div>
  );
};

export default GroupChat;
