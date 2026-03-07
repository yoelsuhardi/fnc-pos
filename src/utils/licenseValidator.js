// This script uses the Web Crypto API to verify RSA signatures offline

// The public key corresponding to the private key held by the developer.
// WARNING: NEVER put the private_key.pem in the src/ directory.
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxFNv4knvyrpEDKfWSl0J
/g4e8D8HD+gKZw+We4yQJH4T1GGsqIZByZpEf6edZek1+RNONFL+XvtzWbeg5jqm
QRiWyMMteht1lvBqALGfx7P7RjzxnvtSwxPlZsMUik/VtFfTXyc7ySSljAmQLLZL
/xfJARuRDl0Wtlnx4yCpM3K4wkw4PczKchBJXzIzEVBkVdC+mJf8xGtNGSqTj0t7
iTuqCa+VmjchIa7NmP9/AU+EBlgOCIty6wBl8U1tc6dJH6Dx4TaDfPcI3TzQLykd
hcEeZPBr6qoAOZ7cVRH9IZDdOyzNdcJNZLZe983aLYHw0B+yJuSr3y7I4glA5ymG
LwIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Validates a given license key string
 * Format: Base64(JSON_Payload).Base64(RSA_Signature)
 * @param {string} licenseKey 
 * @param {string} rawPublicKeyPem 
 * @returns {Promise<{valid: boolean, reason?: string, payload?: object}>}
 */
export async function validateLicense(licenseKey, rawPublicKeyPem) {
    if (!licenseKey || typeof licenseKey !== 'string') {
        return { valid: false, reason: 'Kunci lisensi kosong atau format salah.' };
    }

    const parts = licenseKey.split('.');
    if (parts.length !== 2) {
        return { valid: false, reason: 'Format lisensi korup atau tidak utuh.' };
    }

    const [encodedPayload, signatureBase64] = parts;

    try {
        // 1. Decode Payload
        const payloadStr = atob(encodedPayload);
        const payload = JSON.parse(payloadStr);

        // 2. Check Expiry Expiration
        if (!payload.expires) {
            return { valid: false, reason: 'Lisensi tidak memiliki tanggal kedaluwarsa.' };
        }

        const expiryDate = new Date(payload.expires);
        const today = new Date();

        // Strip time from today for accurate day comparison
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(23, 59, 59, 999); // valid until end of the expiry day

        if (today > expiryDate) {
            return { valid: false, reason: `Lisensi mesin kasir ini telah kedaluwarsa sejak ${expiryDate.toLocaleDateString('id-ID')}. Silakan hubungi pusat.`, payload };
        }

        // 3. Verify RSA Signature using Web Crypto API
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = rawPublicKeyPem.substring(
            rawPublicKeyPem.indexOf(pemHeader) + pemHeader.length,
            rawPublicKeyPem.indexOf(pemFooter)
        ).replace(/\s/g, '');

        const binaryDerString = window.atob(pemContents);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }

        const cryptoKey = await window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "RSASSA-PKCS1-v1_5",
                hash: "SHA-256"
            },
            true,
            ["verify"]
        );

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(payloadStr);

        const signatureBinaryStr = window.atob(signatureBase64);
        const signatureBuffer = new Uint8Array(signatureBinaryStr.length);
        for (let i = 0; i < signatureBinaryStr.length; i++) {
            signatureBuffer[i] = signatureBinaryStr.charCodeAt(i);
        }

        const isSignatureValid = await window.crypto.subtle.verify(
            "RSASSA-PKCS1-v1_5",
            cryptoKey,
            signatureBuffer,
            dataBuffer
        );

        if (!isSignatureValid) {
            return { valid: false, reason: 'Sistem menolak kunci palsu. Lisensi ini telah dilarang atau bukan dikeluarkan oleh instansi resmi.' };
        }

        // 4. All Checks Passed
        return { valid: true, payload };

    } catch (err) {
        console.error('License validation exception:', err);
        return { valid: false, reason: 'Sandi kriptografi lisensi rusak atau tidak dikenal sistem.' };
    }
}
