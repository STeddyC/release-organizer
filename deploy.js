import 'dotenv/config';
import FtpDeploy from 'ftp-deploy';
import { rm, writeFile } from 'fs/promises';
import { execSync } from 'child_process';

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: 21,
  localRoot: './dist',
  remoteRoot: '/public_html',
  include: ['*', '**/*', '.htaccess'],
  exclude: [],
  deleteRemote: false,
  forcePasv: true,
  sftp: false,
  timeout: 60000,
  retries: 5,
  parallel: 1
};

const adminConfig = {
  ...config,
  localRoot: './dist-admin',
  remoteRoot: '/public_html/gazde'
};

async function cleanDist() {
  try {
    await rm('./dist', { recursive: true, force: true });
    await rm('./dist-admin', { recursive: true, force: true });
    console.log('✓ Cleaned dist directories');
  } catch (err) {
    console.log('! Could not clean dist directories:', err.message);
  }
}

async function createHtaccess() {
  const htaccessContent = `# Enable rewrite engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle www subdomain
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteCond %{HTTP_HOST} !^gazde\\. [NC]
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# If the request is not for a valid file or directory
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# If the request is not for an asset
RewriteCond %{REQUEST_URI} !^/assets/

# Send everything else to index.html
RewriteRule ^ index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript application/json
</IfModule>

# Set caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Prevent directory listing
Options -Indexes

# Set security headers
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Allow cross-origin for fonts and images
<FilesMatch "\\.(ttf|otf|eot|woff|woff2)$">
    Header set Access-Control-Allow-Origin "*"
</FilesMatch>

# Serve correct MIME types
AddType application/javascript .js
AddType text/css .css
AddType image/svg+xml .svg
AddType application/font-woff .woff
AddType application/font-woff2 .woff2

# Handle errors
ErrorDocument 404 /index.html`;

  const adminHtaccessContent = `# Enable rewrite engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# If the request is not for a valid file or directory
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# If the request is not for an asset
RewriteCond %{REQUEST_URI} !^/assets/

# Send everything else to index.html
RewriteRule ^ index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript application/json
</IfModule>

# Set caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Prevent directory listing
Options -Indexes

# Set security headers
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Allow cross-origin for fonts and images
<FilesMatch "\\.(ttf|otf|eot|woff|woff2)$">
    Header set Access-Control-Allow-Origin "*"
</FilesMatch>

# Serve correct MIME types
AddType application/javascript .js
AddType text/css .css
AddType image/svg+xml .svg
AddType application/font-woff .woff
AddType application/font-woff2 .woff2

# Handle errors
ErrorDocument 404 /index.html`;

  try {
    await writeFile('./dist/.htaccess', htaccessContent);
    await writeFile('./dist-admin/.htaccess', adminHtaccessContent);
    console.log('✓ Created .htaccess files');
  } catch (err) {
    console.error('! Failed to create .htaccess files:', err.message);
    throw err;
  }
}

async function buildProject() {
  try {
    console.log('Building main project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✓ Main build completed');

    console.log('Building admin project...');
    execSync('npm run build:admin', { stdio: 'inherit' });
    console.log('✓ Admin build completed');
    return true;
  } catch (err) {
    console.error('! Build failed:', err.message);
    return false;
  }
}

async function validateCredentials() {
  const required = ['FTP_USER', 'FTP_PASSWORD', 'FTP_HOST'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('FTP Connection Details:');
  console.log(`- Host: ${process.env.FTP_HOST}`);
  console.log(`- User: ${process.env.FTP_USER}`);
  console.log('- Port: 21');
}

let totalFiles = 0;
let transferredFiles = 0;

async function deploy() {
  try {
    await validateCredentials();
    await cleanDist();

    const buildSuccess = await buildProject();
    if (!buildSuccess) {
      throw new Error('Build failed');
    }

    await createHtaccess();
    
    console.log('Deploying main site to Hostinger...');
    await ftpDeploy.deploy(config);
    console.log('✓ Main site deployment completed');

    console.log('Deploying admin site to Hostinger...');
    await ftpDeploy.deploy(adminConfig);
    console.log('✓ Admin site deployment completed');

    console.log('Summary:');
    console.log(`- Total files: ${totalFiles}`);
    console.log(`- Transferred: ${transferredFiles}`);

    return { totalFiles, transferredFiles };
  } catch (err) {
    console.error('! Deployment failed:', err.message);
    if (err.stack) {
      console.error('Stack trace:', err.stack);
    }
    process.exit(1);
  }
}

ftpDeploy.on('uploading', function({ totalFilesCount, transferredFileCount, filename }) {
  totalFiles = totalFilesCount;
  transferredFiles = transferredFileCount;
  console.log(`[${transferredFileCount}/${totalFilesCount}] Uploading: ${filename}`);
});

ftpDeploy.on('uploaded', function({ totalFilesCount, transferredFileCount, filename }) {
  totalFiles = totalFilesCount;
  transferredFiles = transferredFileCount;
  console.log(`[${transferredFileCount}/${totalFilesCount}] Uploaded: ${filename}`);
});

ftpDeploy.on('log', function(data) {
  console.log('Log:', data);
});

ftpDeploy.on('upload-error', function(data) {
  console.error('Upload error for file:', data.filename);
  console.error('Error details:', data.err);
  if (data.err.code) {
    console.error('Error code:', data.err.code);
  }
  if (data.err.stack) {
    console.error('Stack trace:', data.err.stack);
  }
});

deploy();