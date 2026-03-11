import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import readline from "readline";

// NOTE: You must temporarily copy your firebase config here from src/firebase/firebase-config.js 
// to run this setup script.
const firebaseConfig = {
    apiKey: "AIzaSyCWPK6YOK65w1mSVh969SN-3Jkprd2VPTU",
    authDomain: "counseling-management-system.firebaseapp.com",
    projectId: "counseling-management-system",
    storageBucket: "counseling-management-system.appspot.com",
    messagingSenderId: "662850750993",
    appId: "1:662850750993:web:38ec747e0f2d68e99ebfb0",
    measurementId: "G-X127R0S4KM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== CMS Admin Setup Utility ===");
console.log("This script will create a secure Admin account in Firebase Authentication");
console.log("and register their UID in the Firestore 'admins' collection.");
console.log("Make sure you replaced the dummy firebaseConfig in this file with your actual config!\n");

rl.question("Enter new Admin Email: ", (email) => {
    rl.question("Enter new Admin Password (min 6 chars): ", async (password) => {
        try {
            console.log(`\nCreating account for ${email}...`);

            // 1. Create the user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log(`✅ Auth Success! UID: ${user.uid}`);
            console.log(`Registering UID in Firestore 'admins' collection...`);

            // 2. Add the UID to the "admins" collection
            await setDoc(doc(db, "admins", user.uid), {
                email: email,
                role: "admin",
                createdAt: new Date().toISOString()
            });

            console.log("✅ Firestore Update Success!");
            console.log("\n🎉 Admin account fully set up! You can now log into the CMS.");

        } catch (error) {
            console.error("\n❌ Setup Failed:");
            console.error(error.message);
        } finally {
            process.exit(0);
        }
    });
});
