// src/firebase/facultyReferralService.js

import { db, auth } from './firebase-config';
import { collection, addDoc, getDocs, getDoc, updateDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';

/**
 * Get all students for the autocomplete dropdown
 * @returns {Object} List of student options for react-select
 */
export const getAllStudents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    const students = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      students.push({
        value: doc.id,
        label: data.name || data.email,
        courseYearSection: `${data.course || ''} ${data.yearLevel || ''} ${data.section || ''}`.trim()
      });
    });

    return {
      success: true,
      students: students
    };
  } catch (error) {
    console.error("Error fetching students: ", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Submit a faculty referral form
 * @param {Object} formData - The referral form data
 * @returns {Object} Result of the submission
 */
export const submitFacultyReferral = async (formData) => {
  try {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get faculty information from Firestore
    const facultyDoc = await getDoc(doc(db, "faculty", user.uid));
    if (!facultyDoc.exists()) {
      return { success: false, error: "Faculty profile not found" };
    }

    const facultyData = facultyDoc.data();

    // Prepare the form data with additional fields
    const enhancedFormData = {
      // Student Information
      studentUid: '',
      studentName: formData.studentName || '',
      courseYearSection: formData.studentID || '',
      referralDate: formData.referralDate || new Date().toISOString().split('T')[0],
      submissionDate: new Date().toISOString(),

      // Faculty Information
      facultyId: user.uid,
      facultyName: facultyData.name || user.displayName || '',
      facultyEmail: user.email || '',
      referringFacultyEmail: user.email || '', // Matches the query field in facultydash.jsx

      // Format concerns into categories
      concerns: {
        personal: formData.concerns.filter(c =>
          ["Adjustment to college life", "Attitudes toward studies", "Financial problems",
            "Health", "Lack of self-confidence/Self-esteem", "Relationship with family/friends/BF/GF"]
            .includes(c)
        ),
        academic: formData.concerns.filter(c =>
          ["Unmet Subject requiremnts/projects", "attendance:absences/tardiness",
            "course choice: own/Sombody else", "failing grade", "school choice",
            "study habit", "time mgt./schedule"]
            .includes(c)
        )
      },

      // Additional Information
      otherConcerns: formData.otherConcerns || '',
      observations: formData.observations || '',
      referredBy: formData.referredBy || facultyData.name || user.displayName || '',

      // Administrative fields
      status: 'Pending', // Match typical statuses
      remarks: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Telemetry fields to match student submissions
      type: 'Referral',
      referral: 'Faculty',

      // Flag to identify as faculty referral
      isReferral: true
    };

    // Add the document to Firestore
    const docRef = await addDoc(collection(db, "studentInterviews"), enhancedFormData);
    console.log("Faculty referral submitted with ID: ", docRef.id);

    return {
      success: true,
      docId: docRef.id,
      message: "Referral submitted successfully"
    };
  } catch (error) {
    console.error("Error submitting faculty referral: ", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get faculty referrals submitted by the current faculty member
 * @returns {Object} Faculty referrals
 */
export const getFacultyReferrals = async () => {
  try {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Query referrals submitted by this faculty
    const q = query(
      collection(db, "studentInterviews"),
      where("facultyId", "==", user.uid),
      where("isReferral", "==", true)
    );

    const querySnapshot = await getDocs(q);
    const referrals = [];

    querySnapshot.forEach((doc) => {
      referrals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      referrals: referrals
    };
  } catch (error) {
    console.error("Error getting faculty referrals: ", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update a faculty referral
 * @param {string} referralId - ID of the referral to update
 * @param {Object} updateData - Data to update
 * @returns {Object} Result of the update
 */
export const updateFacultyReferral = async (referralId, updateData) => {
  try {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get the referral document
    const referralDoc = await getDoc(doc(db, "studentInterviews", referralId));

    // Check if the referral exists and belongs to this faculty
    if (!referralDoc.exists()) {
      return { success: false, error: "Referral not found" };
    }

    const referralData = referralDoc.data();
    if (referralData.facultyId !== user.uid) {
      return { success: false, error: "You don't have permission to update this referral" };
    }

    // Update the document
    await updateDoc(doc(db, "studentInterviews", referralId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: "Referral updated successfully"
    };
  } catch (error) {
    console.error("Error updating faculty referral: ", error);
    return {
      success: false,
      error: error.message
    };
  }
};
