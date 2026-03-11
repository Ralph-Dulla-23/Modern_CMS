import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../ui/ProfileContext";
import FacultyNavbar from "../ui/facultynavbar";
import { submitFacultyReferral } from "../../firebase/facultyReferralService";
import { auth, db } from '../../firebase/firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const SelectionCard = ({ value, label, formData, handleCheckboxChange }) => {
  const isSelected = formData.concerns.includes(value);

  return (
    <div
      onClick={() => handleCheckboxChange(value)}
      className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3
        ${isSelected
          ? 'border-[#3B021F] bg-[#E0BBD1]/10 shadow-[0_0_0_2px_rgba(59,2,31,0.1)]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
        ${isSelected ? 'border-[#3B021F] bg-[#3B021F]' : 'border-slate-300'}`}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
      </div>
      <span className={`text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
        {label}
      </span>
    </div>
  );
};

export default function Forms() {
  const navigate = useNavigate();
  const { openProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    courseYearSection: "",
    referralDate: new Date().toISOString().split('T')[0],
    facultyName: "",
    department: "",
    referralReason: "",
    concerns: [],
    otherConcerns: "",
    observations: "",
    referredBy: ""
  });

  const steps = [
    { label: "Target Student", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 0 00-7-7z" },
    { label: "Primary Concerns", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    { label: "Academic Indicators", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
    { label: "Remarks & Signoff", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  ];

  const nextStep = () => {
    if (step === 0) {
      if (!formData.studentName.trim()) {
        toast.error("Please enter the student's name before continuing.");
        return;
      }
    }
    if (step < steps.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (value) => {
    setFormData((prevData) => {
      const isEditing = prevData.concerns.includes(value);
      const concerns = isEditing
        ? prevData.concerns.filter((c) => c !== value)
        : [...prevData.concerns, value];
      return { ...prevData, concerns };
    });
  };

  const handleSubmit = async () => {
    if (!formData.facultyName && !formData.referredBy) {
      toast.error("Please provide your name as the referring faculty member.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitFacultyReferral(formData);
      if (result.success) {
        toast.success("Referral submitted successfully. The student will be notified.");
        window.location.reload();
      } else {
        toast.error(`Failed to submit referral: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting referral:", error);
      toast.error("An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col">
      <FacultyNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Academic Referral Form</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Initiate a confidential request for student intervention. Ensure accuracy as the student will review this referral.</p>
        </div>

        {/* Status Indicator (Identical to Request.jsx) */}
        <div className="mb-12">
          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#3B021F] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Step Nodes */}
          <div className="flex justify-between relative">
            {steps.map((s, i) => {
              const isActive = i === step;
              const isCompleted = i < step;

              return (
                <div key={i} className={`flex flex-col items-center relative z-10 w-1/4 
                  ${isActive || isCompleted ? "text-[#3B021F]" : "text-slate-400"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm
                    ${isActive ? "bg-[#3B021F] text-white ring-4 ring-[#E0BBD1]/40" :
                      isCompleted ? "bg-[#3B021F] text-white" : "bg-white border-2 border-slate-200"}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isCompleted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
                      )}
                    </svg>
                  </div>
                  <span className={`text-xs text-center font-medium hidden sm:block ${isActive ? 'font-bold' : ''}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100/80 mb-8 min-h-[400px]">

          {/* STEP 0: STUDENT SELECTION */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-[#E0BBD1]/30 rounded-lg text-[#3B021F]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                Student Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client's Name <span className="text-[#3B021F]">*</span></label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Course / Year <span className="text-[#3B021F]">*</span></label>
                  <input
                    type="text"
                    name="courseYearSection"
                    value={formData.courseYearSection}
                    onChange={handleChange}
                    placeholder="Enter course/year/section"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Referral <span className="text-[#3B021F]">*</span></label>
                  <input
                    type="date"
                    name="referralDate"
                    value={formData.referralDate}
                    onChange={handleChange}
                    className="w-full sm:w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: PERSONAL & SOCIAL CONCERNS */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">Behavioral & Psychosocial Indicators</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Adjustment to college life" label="Adjustment to college life" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Attitudes toward studies" label="Attitudes toward studies" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Financial problems" label="Financial problems" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Health" label="Deteriorating Health / Hygiene" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Lack of self-confidence/Self-esteem" label="Lack of self-confidence or self-esteem" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Relationship with family/friends/BF/GF" label="Extracurricular Relationship Issues" />
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMIC CONCERNS */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">Academic & Institutional Indicators</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Unmet Subject requiremnts/projects" label="Unmet Subject Requirements/Projects" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="attendance:absences/tardiness" label="Chronic Absences / Tardiness" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="course choice: own/Sombody else" label="Course Choice Conflicts" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="failing grade" label="Risk of Failing Grades" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="school choice" label="School Choice Hesitancy" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="study habit" label="Poor Study Habits" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="time mgt./schedule" label="Poor Time Management" />
              </div>
            </div>
          )}

          {/* STEP 3: REMARKS & FACULTY SIGNOFF */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">Detailed Context & Signoff</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Unlisted Concerns</label>
                <textarea
                  name="otherConcerns"
                  value={formData.otherConcerns}
                  onChange={handleChange}
                  placeholder="Specify any other indicators not listed in the checkboxes..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all resize-y"
                ></textarea>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Qualitative Observations</label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  placeholder="Provide context on incidents, changes in behavior, or student dialog..."
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all resize-y"
                ></textarea>
              </div>

              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Faculty Signoff</h3>
                <label className="block text-sm font-medium text-blue-800 mb-2">Referred By (Full Name) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons (Identical to Request.jsx) */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${step === 0
              ? "opacity-50 cursor-not-allowed bg-slate-200 text-slate-400"
              : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
              }`}
            disabled={step === 0}
          >
            Go Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/Facultydash')}
              className="px-6 py-3 text-slate-500 font-medium hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-[#3B021F] text-white rounded-full font-semibold shadow-md shadow-[#3B021F]/20 hover:bg-[#4B122F] hover:-translate-y-0.5 transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-10 py-3 bg-[#E0BBD1] text-[#3B021F] rounded-full font-bold shadow-md shadow-[#E0BBD1]/20 hover:bg-[#d5a8c2] hover:-translate-y-0.5 transition-all flex items-center gap-2
                  ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isSubmitting ? 'Approving...' : 'Confirm Referral'}
                {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
