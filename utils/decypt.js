import crypto from 'crypto';
import fs from 'fs';
import { execSync } from 'child_process';

const privateKey = fs.readFileSync('./config/keys/private.pem', 'utf8');

export function decryptPayload(encrypted) {
  console.log('Starting decryption...');
  console.time('DecryptTime');

  try {
    // Primary: Node crypto
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(encrypted, 'base64')
    );
    console.timeEnd('DecryptTime');
    console.log('Node RSA succeeded!');
    return JSON.parse(decrypted.toString());

  } catch (err) {
    console.log('Node RSA failed. Trying OpenSSL fallback...');
    console.time('FallbackTime');

    try {
      // Write base64 to file
      fs.writeFileSync('temp.b64', encrypted);

      // Decode base64 safely in Node
      const base64String = fs.readFileSync('temp.b64', 'utf8').trim();
      const buf = Buffer.from(base64String, 'base64');

      fs.writeFileSync('temp.enc', buf);

      // Run OpenSSL fallback
      const result = execSync(
        'openssl pkeyutl -decrypt -inkey ./config/keys/private.pem -in temp.enc'
      );

      // Clean up
      fs.unlinkSync('temp.b64');
      fs.unlinkSync('temp.enc');

      console.timeEnd('FallbackTime');
      console.log('OpenSSL fallback succeeded!');
      return JSON.parse(result.toString());

    } catch (fallbackErr) {
      console.error('Both RSA & OpenSSL failed.');
      throw fallbackErr;
    }
  }
}
