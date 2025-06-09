
# Seamless Encrypted File Sharing

An encrypted file sharing app that lets you securely upload and share files using a custom encryption key. With no URLs to remember or click, and AES-256 encryption, the platform provides a simple and private way to exchange files.


![Architecture Diagram](https://raw.githubusercontent.com/karthik-saiharsh/file-sharing-app/refs/heads/main/architecture.png)


## Features

- AES-256 encryption with user-supplied keys
- Key is never stored on the server — it's discarded immediately after use.
- Encrypted file stored securely in a database
- Share Files using a 4-character unique ID (e.g. `Aek3`) instead of a URL.
- Only users with the correct key, and file ID can decrypt and access the file.


## How it Works

**Upload Phase**
- You choose a file and enter a key.
- File and key are sent to server.
- The server encrypts the file using AES-256 with your key.
- The key is immediately discarded.
- The encrypted file is stored in the database.
- A 4-character sharing ID is generated and returned.

**Download Phase**
- The recipient enters the 4-character sharing ID and the correct key.
- The server retrieves the encrypted file and decrypts it using the key provided.
- If the key is correct, the original file is downloaded.


## How is it Different from Other File Sharing Solutions
- **No URLs**: Prevents phishing, spoofing, and tracking via links, plus it's easier to remember a file ID than a link.
- A different kind of **End-to-End Encryption** and **Double Layer Protection** – Only someone with the right key and ID can decrypt the file.
- The server never stores or logs the actual key.
