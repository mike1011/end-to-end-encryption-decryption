# End to End Encryption Decryption Chat Application
A Demo app to showcase secure messaging using ReactJS that leverages end-to-end encryption using both asymmetric and symmetric key encryption provided by TweetNaCl.js. This project aims to provide a secure way of communicating where only the communicating users can read the messages.

### Features
End-to-End Encryption: All messages are encrypted on the client side using a combination of asymmetric and symmetric encryption.
ReactJS Frontend: Modern and responsive UI built with React.
Secure Key Handling: Public and private keys are generated using the NaCl library's cryptographic functions.
Technologies
ReactJS
TweetNaCl.js for encryption
nacl-util for utility functions like encoding and decoding
Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
You will need Node.js and npm installed on your computer to run this project.

### Install Node.js and npm
https://nodejs.org/en/download/
Installing
Clone the repository to your local machine:

git clone https://github.com/mike1011/end-to-end-encryption-decryption.git
cd end-to-end-encryption-decryption
Install the necessary packages:


npm install
Running the application
To start the application, run:


npm run start
This will start the React development server and open the application in your default web browser.

###  Usage
Generate Keys: Upon first use, the user will need to generate a set of public and private keys. This can be done through the UI.
Send Encrypted Message: To send a message, input the recipient's public key and your private key. The app will encrypt the message asymmetrically.
Decrypt Message: When receiving a message, use your private key and the sender's public key to decrypt the message symmetrically.
Contributing
Contributions are welcome! Please feel free to submit a pull request or open issues to improve the application or suggest new features.

### License
This project is licensed under the MIT License - see the LICENSE.md file for details.

###  Acknowledgments
TweetNaCl.js contributors and community
Everyone who contributed to the React ecosystem
