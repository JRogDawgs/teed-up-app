const fs = require('fs');
const path = require('path');

// Google OAuth credentials
const googleCredentials = {
  'EXPO_PUBLIC_GOOGLE_CLIENT_ID': '430318837199-2luqrqiqqdtb29hu76cj2hme7cupa0gq.apps.googleusercontent.com',
  'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID': '430318837199-2luqrqiqqdtb29hu76cj2hme7cupa0gq.apps.googleusercontent.com',
  'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID': '430318837199-2luqrqiqqdtb29hu76cj2hme7cupa0gq.apps.googleusercontent.com'
};

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

// Read existing .env file if it exists
let existingEnv = '';
try {
  existingEnv = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  // File doesn't exist, that's okay
}

// Parse existing environment variables
const existingVars = existingEnv
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key] = line.split('=');
    if (key) acc[key.trim()] = line;
    return acc;
  }, {});

// Create new .env content
let newEnvContent = '# Google OAuth Credentials\n';
Object.entries(googleCredentials).forEach(([key, value]) => {
  newEnvContent += `${key}=${value}\n`;
});

// Add existing Firebase config if present
const firebaseVars = Object.entries(existingVars)
  .filter(([key]) => key.startsWith('FIREBASE_'))
  .map(([, line]) => line);

if (firebaseVars.length > 0) {
  newEnvContent += '\n# Firebase Config\n';
  firebaseVars.forEach(line => {
    newEnvContent += line + '\n';
  });
}

// Write the new .env file
try {
  fs.writeFileSync(envPath, newEnvContent.trim() + '\n');
  console.log('✅ Successfully updated .env file with Google OAuth credentials');
  console.log('\nPlease restart your development server with:');
  console.log('npx expo start --clear');
} catch (err) {
  console.error('❌ Error writing .env file:', err);
} 