import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase-config"; // Ensure correct Firebase config is imported

/**
 * User Registration Function
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (student/faculty)
 * @param {Object} userData - User details based on role (name, course, yearLevel, section for student or department for faculty)
 * @returns {Object} Registration result
 */
export const signUp = async (email, password, role, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Use the correct collection names and ensure all data is correctly formatted
    await setDoc(doc(db, role === 'student' ? "students" : "faculty", user.uid), {
      ...userData,
      email,
      role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });

    return {
      success: true,
      user,
      message: "Registration successful"
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message || "Registration failed"
    };
  }
};

/**
 * Enhanced Login Function with Admin Support
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Login result
 */


export const login = async (email, password) => {
  try {
    console.log("Attempting Firebase authentication for user:", email);

    // 1. Authenticate with Firebase Auth FIRST for ALL users
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Firebase authentication successful");

    // 2. Check if the user is an Admin
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    if (adminDoc.exists()) {
      console.log("Admin document found");
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAdmin', 'true'); // Keeping this for now until we refactor dashboard routes

      return {
        success: true,
        isAdmin: true,
        user: user,
        userData: adminDoc.data(),
        message: "Admin login successful"
      };
    }

    // 3. Check if the user is a Student
    const studentDoc = await getDoc(doc(db, "students", user.uid));
    if (studentDoc.exists()) {
      console.log("Student document found");
      localStorage.setItem('userRole', 'student');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAdmin', 'false');

      return {
        success: true,
        isAdmin: false,
        user: user,
        userData: studentDoc.data(),
        message: "Login successful"
      };
    }

    // 4. Check if the user is Faculty
    const facultyDoc = await getDoc(doc(db, "faculty", user.uid));
    if (facultyDoc.exists()) {
      console.log("Faculty document found");
      localStorage.setItem('userRole', 'faculty');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAdmin', 'false');

      return {
        success: true,
        isAdmin: false,
        user: user,
        userData: facultyDoc.data(),
        message: "Login successful"
      };
    }

    // 5. User authenticated but has no role document in Firestore
    console.log("User document not found in any role collection in Firestore");
    // We should probably sign them out if they don't have a valid role document
    await auth.signOut();
    return {
      success: false,
      message: "Your account does not have an assigned role set up in the database. Please contact support."
    };
  } catch (error) {
    console.error("Login error:", error);
    // Use the error handler helper for better UX messages
    return {
      success: false,
      message: handleError(error)
    };
  }
};


/**
 * Error Handler
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
const handleError = (error) => {
  // Prevent user enumeration by masking 'user-not-found' and 'wrong-password' behind a generic message
  const errorMessages = {
    'auth/user-not-found': 'Invalid email or password',
    'auth/wrong-password': 'Invalid email or password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/invalid-email': 'Invalid email format',
    'auth/weak-password': 'Password should be at least 6 characters'
  };

};

/**
 * Logout Function
 */
export const logout = async () => {
  try {
    await auth.signOut();
    localStorage.clear();
    return { success: true, message: "Logout successful" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
