const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Load RSA private key
// Make sure to place your private key file in the same directory as this server file
const privateKeyPath = path.join(__dirname, "private_key.pem");
let privateKey;

try {
  privateKey = fs.readFileSync(privateKeyPath, "utf8");
  console.log("Private key loaded successfully");
} catch (error) {
  console.error("Error loading private key:", error.message);
  process.exit(1);
}

// Function to decrypt data using RSA private key
function decryptWithPrivateKey(encryptedData) {
  try {
    // Convert base64 encrypted data to buffer
    const encryptedBuffer = Buffer.from(encryptedData, "base64");

    // Decrypt using private key
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedBuffer
    );

    return decryptedBuffer.toString("utf8");
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// Route to handle encrypted data
app.post("/decrypt", async (req, res) => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({
        success: false,
        error: "No encrypted data provided",
      });
    }

    // Decrypt the data
    const decryptedText = decryptWithPrivateKey(encryptedData);

    console.log("Decrypted data:", decryptedText);

    res.json({
      success: true,
      decryptedData: decryptedText,
      message: "Data decrypted successfully",
    });
  } catch (error) {
    console.error("Decryption error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Route to get public key (for frontend use)
app.get("/public-key", (req, res) => {
  try {
    const publicKeyPath = path.join(__dirname, "public_key.pem");
    const publicKey = fs.readFileSync(publicKeyPath, "utf8");

    res.json({
      success: true,
      publicKey: publicKey,
    });
  } catch (error) {
    console.error("Error reading public key:", error.message);
    res.status(500).json({
      success: false,
      error: "Could not read public key",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
