// src/firebase/firestoreService.js

import { db } from './firebase-config';
import { collection, addDoc, getDocs, getDoc, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Submits a student interview form to Firestore.
 * @param {Object} formData - The form data to be submitted.
 * @returns {Object} - Success status and document ID or error message.
 */
export const submitStudentInterviewForm = async (formData) => {
  try {
    // Validate form data before submission
    if (!formData.studentName || !formData.courseYearSection || !formData.dateOfBirth) {
      throw new Error("Required fields are missing.");
    }

    const user = getAuth().currentUser;

    // Enhance form data with additional metadata
    const enhancedFormData = {
      ...formData,
      studentUid: user ? user.uid : '', // Add the strict relational UID
      email: user ? user.email : '', // Use Firebase Auth email directly
      submissionDate: new Date().toISOString(), // Add submission date
      status: 'Pending', // Initial status
      type: 'Walk-in', // Default type
      referral: 'Self', // Default referral source
      remarks: '', // Empty initially
      isReferral: false // Flag to identify if it's a referral
    };

    // Add document to Firestore collection
    const docRef = await addDoc(collection(db, "studentInterviews"), enhancedFormData);
    console.log("Document written with ID: ", docRef.id);
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: error.message };
  }
};

/**
 * Checks if the current user is an admin by verifying against the Firestore 'admins' collection.
 * This replaces the insecure localStorage check.
 * @returns {Promise<boolean>} - True if the user is an admin, false otherwise.
 */
const isAdmin = async () => {
  try {
    const user = getAuth().currentUser;
    if (!user) return false;

    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    return adminDoc.exists();
  } catch (error) {
    console.error("Error checking admin status: ", error);
    return false;
  }
};

/**
 * Fetches all student interview forms from Firestore.
 * Requires Firebase Auth admin verification.
 * @returns {Object} - Success status and forms or error message.
 */
export const getStudentInterviewForms = async () => {
  try {
    // Verify admin role via Firebase Auth + Firestore (not localStorage)
    const adminVerified = await isAdmin();

    if (!adminVerified) {
      console.log("Not admin - access denied");
      return {
        success: false,
        error: "Unauthorized access. Only administrators can view all forms."
      };
    }

    console.log("Admin access verified via Firestore, fetching forms...");

    try {
      const querySnapshot = await getDocs(collection(db, "studentInterviews"));

      const forms = [];
      querySnapshot.forEach((doc) => {
        forms.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`Successfully fetched ${forms.length} forms`);
      return { success: true, forms };
    } catch (fetchError) {
      console.error("Error in Firestore fetch operation:", fetchError);
      return {
        success: false,
        error: `Firestore fetch error: ${fetchError.message}`
      };
    }
  } catch (error) {
    console.error("Error getting documents: ", error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates the status and remarks of a student interview form in Firestore.
 * @param {string} formId - The ID of the form to update.
 * @param {string} status - The new status (e.g., "Reviewed", "Rescheduled").
 * @param {string} remarks - Additional remarks for the update.
 * @returns {Object} - Success status or error message.
 */
export const updateFormStatus = async (formId, status, remarks) => {
  try {
    // Check if the user is an admin
    if (!await isAdmin()) {
      return {
        success: false,
        error: "Unauthorized access. Only administrators can update forms."
      };
    }

    // Update the document in Firestore
    const formRef = doc(db, "studentInterviews", formId);
    await updateDoc(formRef, {
      status,
      remarks,
      updatedAt: new Date().toISOString() // Add update timestamp
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating document: ", error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates the consent status of a faculty referral for a student.
 * @param {string} formId - The ID of the form to update.
 * @param {boolean} consentGiven - True if consent is given, false if denied.
 * @returns {Object} - Success status or error message.
 */
export const updateConsentStatus = async (formId, consentGiven) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      return { success: false, error: "Must be logged in to update consent." };
    }

    const newStatus = consentGiven ? "Pending" : "Consent Denied";
    const remarks = consentGiven ? "Student has consented. Awaiting Admin schedule." : "Student declined the referral.";

    const formRef = doc(db, "studentInterviews", formId);
    const updateData = {
      status: newStatus,
      remarks: remarks,
      updatedAt: new Date().toISOString()
    };

    // When student consents, bind their UID to the document for relational integrity
    if (consentGiven) {
      updateData.studentUid = user.uid;
    }

    await updateDoc(formRef, updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating consent: ", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetches unavailable calendar dates for counseling.
 * @returns {Object} - Success status and array of unavailable dates.
 */
export const getUnavailableDates = async () => {
  try {
    // Placeholder for fetching unavailable dates from a 'settings' or 'unavailableDates' collection
    return { success: true, dates: [] };
  } catch (error) {
    console.error("Error fetching unavailable dates: ", error);
    return { success: false, error: error.message };
  }
};