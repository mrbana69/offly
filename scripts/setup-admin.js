#!/usr/bin/env node

/**
 * Admin Setup Script for Offly
 *
 * This script helps set up the first admin user for the Offly application.
 * Run this script to create an admin user in Firestore.
 *
 * Usage:
 * 1. Make sure you're logged in to Firebase: firebase login
 * 2. Set your project: firebase use your-project-id
 * 3. Run: node scripts/setup-admin.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const readline = require('readline');

const firebaseConfig = {
  // These will be loaded from environment variables
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('❌ Error: Firebase config not found. Make sure your .env.local file is set up.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupAdmin() {
  try {
    console.log('🚀 Offly Admin Setup');
    console.log('===================\n');

    const email = await askQuestion('Enter admin email: ');
    const password = await askQuestion('Enter admin password (min 6 characters): ');
    const name = await askQuestion('Enter admin display name: ');

    if (!email || !password || !name) {
      console.error('❌ Error: All fields are required');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters');
      rl.close();
      return;
    }

    console.log('\n⏳ Creating admin user...');

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore with admin role
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      displayName: name,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔑 Role: admin`);
    console.log('\n🎉 You can now log in to /admin/login with these credentials.');

  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);

    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 This email is already registered. If you want to make an existing user an admin,');
      console.log('   you can manually update their Firestore document to add: role: "admin"');
    }
  } finally {
    rl.close();
  }
}

setupAdmin();