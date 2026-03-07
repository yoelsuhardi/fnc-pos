import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the private key exists
const privateKeyPath = path.join(__dirname, 'private_key.pem');
if (!fs.existsSync(privateKeyPath)) {
    console.error('❌ Error: private_key.pem not found in scripts directory.');
    process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

/**
 * Generate a cryptographically signed offline license key.
 * @param {string} clientName - Name of the client/restaurant
 * @param {number} validDays - Number of days the license is valid for
 */
function generateLicense(clientName, validDays) {
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(issueDate.getDate() + validDays);

    // Build the payload
    const payload = {
        client: clientName,
        issued: issueDate.toISOString().split('T')[0],
        expires: expiryDate.toISOString().split('T')[0],
        // Random nonce to ensure every key is unique even for the same inputs
        nonce: crypto.randomBytes(4).toString('hex')
    };

    const payloadString = JSON.stringify(payload);

    // Sign the payload using RSA-SHA256
    const sign = crypto.createSign('SHA256');
    sign.update(payloadString);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');

    // Combine payload inside Base64 encoding + Signature
    const encodedPayload = Buffer.from(payloadString).toString('base64');

    // The final license key format: ENCODED_PAYLOAD.SIGNATURE
    const licenseKey = `${encodedPayload}.${signature}`;

    console.log('\n✅ License Generated Successfully ✅');
    console.log('--------------------------------------------------');
    console.log(`Client   : ${payload.client}`);
    console.log(`Issued   : ${payload.issued}`);
    console.log(`Expires  : ${payload.expires}`);
    console.log('--------------------------------------------------');
    console.log('Give this EXACT key to the client:\n');
    console.log(licenseKey);
    console.log('\n--------------------------------------------------');
}

// Simple CLI arguments handling
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node license_generator.mjs "Client Name" <ValidDays>');
    console.log('Example: node license_generator.mjs "FNC St Albans" 365');
    process.exit(1);
}

const clientName = args[0];
const validDays = parseInt(args[1], 10);

if (isNaN(validDays) || validDays <= 0) {
    console.error('❌ Error: ValidDays must be a positive number.');
    process.exit(1);
}

generateLicense(clientName, validDays);
