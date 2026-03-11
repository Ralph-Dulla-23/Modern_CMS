// src/services/profileService.js
import { getAuth, updateEmail, updatePassword, sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { toast } from 'sonner';

export async function updateUserProfile(newData) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        console.error("No user logged in");
        toast.error("No user logged in");
        return;
    }

    try {
        if (newData.email && newData.email !== user.email) {
            await updateEmail(user, newData.email);
            await sendEmailVerification(user);
            toast.info("Please verify your new email before it can be updated in your profile.");
            return;
        }
        if (newData.password) {
            await updatePassword(user, newData.password);
        }

        // Determine collection path from localStorage role (Firebase Auth user objects don't have a .role property)
        const userRole = localStorage.getItem('userRole');
        const path = userRole === 'student' ? 'students' : 'faculty';
        const userRef = doc(db, path, user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            toast.info("Creating a new profile document as it does not exist.");
            await setDoc(userRef, { name: newData.name, email: user.email, createdAt: new Date().toISOString() });
        } else {
            const { email, password, ...firestoreData } = newData;
            await updateDoc(userRef, firestoreData);
        }

        toast.success("Profile updated successfully");
    } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(`Error updating profile: ${error.message}`);
        throw error;
    }
}