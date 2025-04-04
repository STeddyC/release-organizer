import 'dotenv/config';
import { execSync } from 'child_process';
import { writeFile } from 'fs/promises';

async function setupSSL() {
  try {
    // Create SSL configuration file
    const sslConfig = `
# SSL Configuration for releaseorganizer.com
SSLEngine on
SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
SSLHonorCipherOrder off
SSLSessionTickets off

# OCSP Stapling
SSLUseStapling on
SSLStaplingCache "shmcb:logs/stapling-cache(150000)"
SSLStaplingResponseMaxAge 900

# HSTS
Header always set Strict-Transport-Security "max-age=63072000" env=HTTPS

# Certificate paths
SSLCertificateFile /etc/ssl/certs/releaseorganizer.com.crt
SSLCertificateKeyFile /etc/ssl/private/releaseorganizer.com.key
SSLCertificateChainFile /etc/ssl/certs/releaseorganizer.com.ca-bundle
`;

    await writeFile('ssl-config.conf', sslConfig.trim());
    console.log('✓ Created SSL configuration file');

    // Instructions for manual steps
    console.log('\nImportant manual steps required:');
    console.log('1. Log in to your Hostinger control panel');
    console.log('2. Navigate to "SSL/TLS" section');
    console.log('3. Click "Install SSL"');
    console.log('4. Choose "Auto SSL" or upload your own certificate');
    console.log('5. Wait for SSL installation to complete');
    console.log('6. Verify SSL status at https://www.ssllabs.com/ssltest/');
    
  } catch (err) {
    console.error('! Failed to create SSL configuration:', err.message);
    process.exit(1);
  }
}

setupSSL();