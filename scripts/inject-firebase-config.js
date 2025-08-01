const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Paths to the files that need the Firebase config
const filesToUpdate = [
    'public/js/auth/login.js',
    'public/js/auth/register.js'
];

// Firebase configuration from environment variables
const firebaseConfig = `
// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
    authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
    projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
    storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
};`;

// Update each file with the Firebase configuration
filesToUpdate.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    try {
        // Read the file
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Replace the Firebase config section
        const updatedContent = content.replace(
            /const firebaseConfig = \{[\s\S]*?\};/, 
            firebaseConfig
        );
        
        // Write the updated content back to the file
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        
        console.log(`✅ Updated Firebase config in ${filePath}`);
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
});

console.log('\n🔥 Firebase configuration injection complete!');
