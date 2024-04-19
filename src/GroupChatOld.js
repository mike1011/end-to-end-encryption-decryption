import React, { useState, useEffect } from 'react';
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import axios from 'axios';

const GroupChat = () => {
  const [sharedKey, setSharedKey] = useState(null);
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

  useEffect(() => {
    generateAndStoreKey();
  }, []);

  const generateAndStoreKey = async () => {
    const newSharedKey = nacl.randomBytes(nacl.secretbox.keyLength);
    // commenting as there is no backend now...TODO
    // await axios.post('/store-shared-key', { key: util.encodeBase64(newSharedKey) });
    console.log("Shared key generated and stored.", util.encodeBase64(newSharedKey));
    setSharedKey(newSharedKey);
  };

  const fetchSharedKey = async () => {
    // commenting as there is no backend now...TODO
    // const response = await axios.get('/fetch-shared-key');
    // return util.decodeBase64(response.data.key);
    console.log("Fetching shared key...", util.encodeBase64(sharedKey));
    return util.decodeBase64(util.encodeBase64(sharedKey));
  };

  const encryptMessage = async (text, key) => {
    console.log("Encrypting message...");
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const messageUint8 = util.decodeUTF8(text);
    const encrypted = nacl.secretbox(messageUint8, nonce, key);
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);
    const encodedMessage = util.encodeBase64(fullMessage);
    console.log("Message encrypted: ", encodedMessage);
    return encodedMessage;
  };

  const decryptMessage = async (messageWithNonce, key) => {
    console.log("Decrypting message...");
    const messageWithNonceAsUint8Array = util.decodeBase64(messageWithNonce);
    const nonce = messageWithNonceAsUint8Array.slice(0, nacl.secretbox.nonceLength);
    const message = messageWithNonceAsUint8Array.slice(nacl.secretbox.nonceLength);
    const decrypted = nacl.secretbox.open(message, nonce, key);
    const decodedMessage = decrypted ? util.encodeUTF8(decrypted) : "Could not decrypt message.";
    if (decrypted) {
      console.log("Message decrypted successfully: ", decodedMessage);
    } else {
      console.log("Failed to decrypt message.");
    }
    return decodedMessage;
  };

  const handleEncrypt = async () => {
    const currentSharedKey = await fetchSharedKey();
    const encrypted = await encryptMessage(message, currentSharedKey);
    setEncryptedMessage(encrypted);
  };

  const handleDecrypt = async () => {
    const currentSharedKey = await fetchSharedKey();
    const decrypted = await decryptMessage(encryptedMessage, currentSharedKey);
    setDecryptedMessage(decrypted);
  };

  return (
    <div>
      <h1>Group Chat - Symmetric Encryption</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={handleEncrypt}>Encrypt</button>
      <p>Encrypted: {encryptedMessage}</p>
      <button onClick={handleDecrypt}>Decrypt</button>
      <p>Decrypted: {decryptedMessage}</p>
    </div>
  );
};

export default GroupChat;
