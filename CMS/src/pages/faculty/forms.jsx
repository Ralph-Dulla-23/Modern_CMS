import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../ui/ProfileContext";
import FacultyNavbar from "../ui/facultynavbar";
import { submitFacultyReferral, searchStudents } from "../../firebase/facultyReferralService";
import { auth, db } from '../../firebase/firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';

const SelectionCard = ({ value, label, formData, handleCheckboxChange }) => {
  const isSelected = formData.concerns.includes(value);

  return (
    <div
      onClick={() => handleCheckboxChange(value)}
      className={`cursor-pointer p-5 rounded-[20px] border-2 transition-all duration-300 flex items-start gap-4
        ${isSelected
          ? 'border-[#3B021F] bg-[#3B021F]/5 shadow-sm'
          : 'border-slate-100 bg-slate-50/30 hover:border-[#E0BBD1]/50 hover:bg-white'
        }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300
        ${isSelected ? 'border-[#3B021F] bg-[#3B021F] rotate-0' : 'border-slate-300 rotate-45'}`}
      >
        {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
      </div>
      <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-[#3B021F]' : 'text-slate-600'}`}>
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
  const [studentOptions, setStudentOptions] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "", // SECURE BINDING
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

  useEffect(() => {
    // Note: Student options are now fetched dynamically via the searchStudents function 
    // in the react-select component below to handle prefix searching securely.
    setIsLoadingStudents(false);
  }, []);

  const steps = [
    { label: "Identification", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 0 00-7-7z" },
    { label: "Behavioral", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    { label: "Academic", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
    { label: "Signoff", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  ];

  const nextStep = () => {
    if (step === 0) {
      if (!formData.studentName.trim() || !formData.studentEmail) {
        toast.error("Please select a student from the directory.");
        return;
      }
    }
    if (step < steps.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleStudentSelect = (selectedOption) => {
    if (selectedOption) {
      setFormData({
        ...formData,
        studentName: selectedOption.label,
        studentEmail: selectedOption.email,
        courseYearSection: selectedOption.courseYearSection
      });
    }
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
        navigate('/Facultydash');
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
    <div className="min-h-screen bg-[#fcfafa] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <FacultyNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 relative">
        <div className="absolute top-0 left-0 -ml-32 mt-12 w-96 h-96 bg-[#3B021F]/5 rounded-full blur-[80px] -z-10"></div>

        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 uppercase tracking-[0.05em]">Academic Referral</h1>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Professional intervention request. All submissions are handled with institutional-grade confidentiality and reviewed by the Counseling Office.
          </p>
        </div>

        {/* Status Indicator - Professional Line Style */}
        <div className="mb-16">
          <div className="flex justify-between relative px-2 mb-4">
            {steps.map((s, i) => {
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <div key={i} className={`flex flex-col items-center relative z-10 w-1/4 transition-all duration-500 ${isActive || isCompleted ? "text-[#3B021F]" : "text-slate-300"}`}>
                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center mb-3 transition-all duration-500 
                    ${isActive ? "bg-[#3B021F] text-white shadow-lg shadow-[#3B021F]/20 scale-110" : isCompleted ? "bg-[#3B021F]/10 text-[#3B021F]" : "bg-white border border-slate-100"}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isCompleted ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />}
                    </svg>
                  </div>
                  <span className={`text-[10px] text-center hidden sm:block uppercase tracking-widest ${isActive ? 'font-black' : 'font-bold opacity-60'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="relative w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#3B021F] transition-all duration-700 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Main Form Area - Prestigious Structured Radius */}
        <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-slate-100 mb-10 min-h-[450px]">

          {/* STEP 0: STUDENT SELECTION */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-10 pb-4 border-b border-slate-50 flex items-center gap-4">
                <span className="w-2 h-6 bg-[#3B021F] rounded-full"></span>
                Official Identification
              </h2>

              <div className="space-y-10">
                <div>
                  <label className="block text-[10px] font-black text-[#3B021F] uppercase tracking-[0.2em] mb-3 ml-1">Student Directory Search</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={async (inputValue) => {
                      if (!inputValue || inputValue.length < 2) return [];
                      const result = await searchStudents(inputValue);
                      return result.success ? result.students : [];
                    }}
                    onChange={handleStudentSelect}
                    placeholder="Search by institutional name or email..."
                    className="text-sm"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '16px',
                        padding: '0.5rem',
                        border: '1px solid #f1f5f9',
                        backgroundColor: '#f8fafc',
                        boxShadow: 'none',
                        '&:hover': { border: '1px solid #3B021F' }
                      }),
                      placeholder: (base) => ({ ...base, color: '#cbd5e1', fontWeight: '500' }),
                    }}
                  />
                  <p className="text-[10px] text-slate-400 mt-4 px-1 font-medium italic">
                    Referrals must be bound to a unique university email for secure tracking.
                  </p>
                </div>

                {formData.studentName && (
                  <div className="p-8 bg-slate-50/50 rounded-[28px] border border-slate-100 animate-in fade-in zoom-in-95 flex justify-between items-center group">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#3B021F] rounded-[20px] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#3B021F]/10">
                           {formData.studentName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-[#3B021F] uppercase tracking-[0.2em]">Target Student</span>
                          <h4 className="font-black text-slate-900 text-xl mt-1 tracking-tight">{formData.studentName}</h4>
                          <p className="text-sm text-slate-500 font-medium">{formData.studentEmail}</p>
                          <p className="text-xs text-slate-400 mt-1 font-bold">{formData.courseYearSection}</p>
                        </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-emerald-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-slate-50">
                  <label className="block text-[10px] font-black text-[#3B021F] uppercase tracking-[0.2em] mb-3 ml-1">Referral Date</label>
                  <input
                    type="date"
                    name="referralDate"
                    value={formData.referralDate}
                    onChange={handleChange}
                    className="w-full sm:w-1/2 px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B021F]/10 focus:border-[#3B021F] transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: BEHAVIORAL INDICATORS */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-10 pb-4 border-b border-slate-50 flex items-center gap-4">
                <span className="w-2 h-6 bg-[#3B021F] rounded-full"></span>
                Psychosocial Indicators
              </h2>
              <p className="text-slate-400 text-sm font-medium mb-8 -mt-6">Select observable behavioral changes or personal struggles noticed in the student.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Adjustment to college life" label="Adjustment to College Life" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Attitudes toward studies" label="Attitudes Toward Studies" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Financial problems" label="Financial Hardship" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Health" label="Deteriorating Health/Hygiene" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Lack of self-confidence/Self-esteem" label="Lack of Self-Confidence" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Relationship with family/friends/BF/GF" label="Interpersonal Conflicts" />
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMIC INDICATORS */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-10 pb-4 border-b border-slate-50 flex items-center gap-4">
                <span className="w-2 h-6 bg-[#3B021F] rounded-full"></span>
                Academic Indicators
              </h2>
              <p className="text-slate-400 text-sm font-medium mb-8 -mt-6">Identify specific performance-related concerns that warrant intervention.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="Unmet Subject requiremnts/projects" label="Unmet Requirements/Projects" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="attendance:absences/tardiness" label="Chronic Absences/Tardiness" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="course choice: own/Sombody else" label="Course Choice Conflicts" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="failing grade" label="Risk of Failing Grades" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="school choice" label="Institutional Choice Doubts" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="study habit" label="Poor Study Habits" />
                <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} value="time mgt./schedule" label="Time Management Issues" />
              </div>
            </div>
          )}

          {/* STEP 3: CONTEXT & SIGNOFF */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-10 pb-4 border-b border-slate-50 flex items-center gap-4">
                <span className="w-2 h-6 bg-[#3B021F] rounded-full"></span>
                Contextual Signoff
              </h2>

              <div className="space-y-10">
                <div>
                  <label className="block text-[10px] font-black text-[#3B021F] uppercase tracking-[0.2em] mb-3 ml-1">Unlisted Indicators</label>
                  <textarea
                    name="otherConcerns"
                    value={formData.otherConcerns}
                    onChange={handleChange}
                    placeholder="Provide details on any indicators not covered by the check-list..."
                    rows="3"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[24px] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/10 focus:border-[#3B021F] transition-all resize-none placeholder:text-slate-300"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#3B021F] uppercase tracking-[0.2em] mb-3 ml-1">Qualitative Observations</label>
                  <textarea
                    name="observations"
                    value={formData.observations}
                    onChange={handleChange}
                    placeholder="Summarize key observations, incidents, or dialog that influenced this referral..."
                    rows="5"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[24px] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/10 focus:border-[#3B021F] transition-all resize-none placeholder:text-slate-300 leading-relaxed"
                  ></textarea>
                </div>

                <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-slate-900/10">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#E0BBD1]">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#E0BBD1]">Official Signoff</h3>
                  </div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-white/40 mb-3 ml-1">Referring Faculty Full Name</label>
                  <input
                    type="text"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Alejandro Santiago"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#E0BBD1]/20 focus:border-[#E0BBD1]/50 transition-all placeholder:text-white/20"
                  />
                  <p className="text-[10px] text-white/30 mt-4 font-medium italic">
                    By submitting, you confirm this referral is made for the student's wellbeing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation - Prestigious Pill Style */}
        <div className="flex justify-between items-center sm:px-6">
          <button
            onClick={prevStep}
            className={`px-8 py-4 rounded-2xl font-bold transition-all ${step === 0
              ? "opacity-0 pointer-events-none"
              : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100 hover:border-slate-200"
              }`}
            disabled={step === 0}
          >
            Go Back
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/Facultydash')}
              className="text-slate-300 font-black text-[10px] uppercase tracking-widest hover:text-[#3B021F] transition-colors"
            >
              Cancel
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-12 py-4 bg-[#3B021F] text-white rounded-2xl font-bold shadow-xl shadow-[#3B021F]/15 hover:bg-[#4B122F] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3"
              >
                <span>Continue</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-12 py-4 bg-[#E0BBD1] text-[#3B021F] rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#E0BBD1]/20 hover:bg-[#d5a8c2] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3
                  ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isSubmitting ? 'Processing...' : 'Submit Referral'}
                {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
