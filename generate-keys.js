const crypto = require("crypto");
const fs = require("fs");

// Generate RSA key pair
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // Key size in bits
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { publicKey, privateKey };
}

// Save keys to files
function saveKeysToFiles() {
  try {
    console.log("Generating RSA key pair...");

    const { publicKey, privateKey } = generateKeyPair();

    // Save private key
    fs.writeFileSync("private_key.pem", privateKey);
    console.log("Private key saved to private_key.pem");

    // Save public key
    fs.writeFileSync("public_key.pem", publicKey);
    console.log("Public key saved to public_key.pem");

    console.log("\nKey pair generated successfully!");
    console.log("You can now use these keys with your Express server.");

    // Display key info
    console.log("\n--- PUBLIC KEY ---");
    console.log(publicKey);

    console.log("\n--- PRIVATE KEY (Keep this secure!) ---");
    console.log(privateKey.substring(0, 100) + "...[truncated for security]");
  } catch (error) {
    console.error("Error generating keys:", error.message);
  }
}

// Run the script
if (require.main === module) {
  saveKeysToFiles();
}

module.exports = { generateKeyPair, saveKeysToFiles };
