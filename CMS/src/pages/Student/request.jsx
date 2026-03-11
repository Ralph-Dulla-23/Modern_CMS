import React, { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../ui/Studentnavbar";
import { submitStudentInterviewForm, getUnavailableDates } from '../../firebase/firestoreService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";

const InputField = ({ label, type = "text", name, placeholder, formData, handleChange }) => (
  <div className="mb-5">
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
    />
  </div>
);

const TextAreaField = ({ label, name, placeholder, formData, handleChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
      rows="4"
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all resize-none"
    ></textarea>
  </div>
);

const SelectionCard = ({ value, label, category, formData, handleCheckboxChange }) => {
  const isSelected = formData.areasOfConcern[category].includes(value);

  return (
    <div
      onClick={() => handleCheckboxChange(category, value)}
      className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 h-full
            ${isSelected ? 'border-[#3B021F] bg-[#E0BBD1]/10 shadow-[0_0_0_2px_rgba(59,2,31,0.1)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
            ${isSelected ? 'border-[#3B021F] bg-[#3B021F]' : 'border-slate-300'}`}
      >
        {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
      </div>
      <span className={`text-sm font-medium leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{label}</span>
    </div>
  );
};

export default function Request() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    consentGiven: false,
    studentName: "",
    dateTime: "",
    dateOfBirth: "",
    contactNo: "",
    courseYearSection: "",
    ageSex: "",
    presentAddress: "",
    emergencyContactPerson: "",
    emergencyContactNo: "",
    selfDescription: "",
    importantThings: "",
    friends: "",
    classParticipation: "",
    family: "",
    comfortableConfidant: "",
    additionalComments: "",
    areasOfConcern: {
      personal: [],
      interpersonal: [],
      academic: [],
      family: []
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [dateError, setDateError] = useState('');

  const steps = [
    { label: "Consent", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Personal Information", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Self-Assessment", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
    { label: "Additional Information", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
    { label: "Concern", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setIsLoadingDates(true);
        const result = await getUnavailableDates();
        if (result.success) {
          const dateStrings = result.dates.map(item => item.date);
          setUnavailableDates(dateStrings);
        }
      } catch (error) {
        console.error("Error fetching unavailable dates:", error);
      } finally {
        setIsLoadingDates(false);
      }
    };
    fetchUnavailableDates();
  }, []);

  const handleCheckboxChange = (category, value) => {
    const currentValues = formData.areasOfConcern[category];
    setFormData({
      ...formData,
      areasOfConcern: {
        ...formData.areasOfConcern,
        [category]: currentValues.includes(value)
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value]
      }
    });
  };

  const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <button type="button" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all" onClick={onClick} ref={ref}>
      {value || placeholder || "Select a date"}
    </button>
  ));
  CustomDateInput.displayName = "CustomDateInput";

  const isDateUnavailable = (date) => {
    if (!date || unavailableDates.length === 0) return false;
    const dateStr = date.toISOString().split('T')[0];
    return unavailableDates.includes(dateStr);
  };

  const filterAvailableDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    return !isDateUnavailable(date);
  };

  const nextStep = () => {
    if (step === 0 && !formData.consentGiven) {
      toast.error("You must provide consent before proceeding.");
      return;
    }

    if (step === 1) {
      if (!formData.studentName) {
        setError("Please enter your name");
        return;
      }
      if (!formData.dateTime) {
        setDateError("Please select a date and time for your counseling session");
        setError("Please select a date and time for your counseling session");
        return;
      }
      const dateStr = formData.dateTime.split('T')[0];
      if (unavailableDates.includes(dateStr)) {
        setDateError("The selected date is not available. Please select another date.");
        setError("The selected date is not available. Please select another date.");
        return;
      }
      setDateError('');
      setError(null);
    }

    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await submitStudentInterviewForm(formData);

      if (result.success) {
        toast.success("Form submitted successfully!");
        navigate('/Dashboard');
      } else {
        setError(result.error || "Failed to submit form");
        toast.error("Failed to submit form: " + (result.error || "Please try again."));
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col">
      <StudentNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Student Initial/Routine Interview</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm">Please answer the following questions truthfully. All information is confidential.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Progress Indicators */}
        <div className="mb-10">
          <div className="relative w-full h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#3B021F] transition-all duration-500 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
          </div>

          <div className="flex justify-between relative px-2">
            {steps.map((s, i) => {
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <div key={i} className={`flex flex-col items-center relative z-10 w-1/5 ${isActive || isCompleted ? "text-[#3B021F]" : "text-slate-400"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300 
                                        ${isActive ? "bg-[#3B021F] text-white ring-4 ring-[#E0BBD1]/40" : isCompleted ? "bg-[#3B021F] text-white" : "bg-white border-2 border-slate-200"}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isCompleted ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />}
                    </svg>
                  </div>
                  <span className={`text-[10px] text-center hidden sm:block ${isActive ? 'font-bold' : 'font-medium'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Form Area */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100/80 mb-6 min-h-[400px]">
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Consent Form</h2>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-sm text-slate-700 leading-relaxed">
                I hereby give my consent to the University of the Immaculate Conception Counseling Office to collect, process, and store my personal and sensitive information for the purpose of counseling and academic support. I understand that all information shared will be kept strictly confidential as mandated by law.
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                  className="w-5 h-5 text-[#3B021F] rounded border-slate-300 focus:ring-[#3B021F]"
                />
                <span className="font-semibold text-slate-800">I understand and agree to the terms above.</span>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Personal Information</h2>
              <InputField formData={formData} handleChange={handleChange} label="Full Name" name="studentName" placeholder="Juan Dela Cruz" />

              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Schedule Date & Time</label>
                {isLoadingDates ? (
                  <p className="text-sm text-slate-500 animate-pulse">Loading available dates...</p>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative z-50">
                      <DatePicker
                        selected={formData.dateTime ? new Date(formData.dateTime) : null}
                        onChange={(date) => {
                          if (date) {
                            setDateError('');
                            const time = formData.dateTime ? formData.dateTime.split('T')[1] : '09:00';
                            const dateStr = date.toISOString().split('T')[0];
                            setFormData({ ...formData, dateTime: `${dateStr}T${time}` });
                          }
                        }}
                        filterDate={filterAvailableDates}
                        minDate={new Date()}
                        placeholderText="Select date..."
                        dateFormat="MMMM d, yyyy"
                        customInput={<CustomDateInput />}
                        wrapperClassName="w-full"
                        dayClassName={date => isDateUnavailable(date) ? "text-rose-400 line-through opacity-50" : undefined}
                      />
                    </div>
                    <input
                      type="time"
                      name="dateTimeTime"
                      value={formData.dateTime ? formData.dateTime.split('T')[1] : ''}
                      onChange={(e) => {
                        if (!formData.dateTime || !formData.dateTime.includes('T')) {
                          setDateError('Please select a date first');
                          return;
                        }
                        const date = formData.dateTime.split('T')[0];
                        setFormData({ ...formData, dateTime: `${date}T${e.target.value}` });
                      }}
                      className="w-full sm:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                    />
                  </div>
                )}
                {dateError && <p className="text-rose-500 text-sm mt-2">{dateError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all" />
                </div>
                <InputField formData={formData} handleChange={handleChange} label="Age/Sex" name="ageSex" placeholder="E.g., 21/M" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <InputField formData={formData} handleChange={handleChange} label="Contact Number" name="contactNo" placeholder="09XX-XXX-XXXX" />
                <InputField formData={formData} handleChange={handleChange} label="Course / Year & Section" name="courseYearSection" placeholder="BSIT 3A" />
              </div>

              <InputField formData={formData} handleChange={handleChange} label="Present Address" name="presentAddress" placeholder="Full residential address" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField formData={formData} handleChange={handleChange} label="Emergency Contact Person" name="emergencyContactPerson" placeholder="Name of parent/guardian" />
                <InputField formData={formData} handleChange={handleChange} label="Emergency Contact Number" name="emergencyContactNo" placeholder="09XX-XXX-XXXX" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Self Assessment</h2>
              <TextAreaField formData={formData} handleChange={handleChange} label="1. What do you think of yourself? How do you describe yourself?" name="selfDescription" placeholder="Enter your answer here..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="2. What are the most important things to you?" name="importantThings" placeholder="Enter your answer here..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="3. Tell me about your friends. What are the things you like or dislike doing with them?" name="friends" placeholder="Enter your answer here..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="4. What do you like or dislike about your class? Describe your participation in class activities." name="classParticipation" placeholder="Enter your answer here..." />
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Additional Information</h2>
              <TextAreaField formData={formData} handleChange={handleChange} label="5. Tell me about your family. How is your relationship with each member of the family? Who do you like or dislike among them? Why?" name="family" placeholder="Enter your answer here..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="6. To whom do you feel comfortable sharing your problems? Why?" name="comfortableConfidant" placeholder="Enter your answer here..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="7. Is there anything I haven't asked that you like to tell me?" name="additionalComments" placeholder="Enter your answer here..." />
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Areas of Concern</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-[#E0BBD1] uppercase tracking-widest bg-[#3B021F] inline-block px-3 py-1 rounded-md mb-4">Personal</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="personal" value="notConfident" label="I do not feel confident about myself" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="personal" value="hardTimeDecisions" label="I have a hard time making decisions" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="personal" value="problemSleeping" label="I have a problem with sleeping" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="personal" value="moodNotStable" label="I have noticed that my mood is not stable" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#E0BBD1] uppercase tracking-widest bg-[#3B021F] inline-block px-3 py-1 rounded-md mb-4">Interpersonal</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="interpersonal" value="beingBullied" label="I am being bullied" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="interpersonal" value="cannotHandlePeerPressure" label="I cannot handle peer pressure" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="interpersonal" value="difficultyGettingAlong" label="I have difficulty getting along with others" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#E0BBD1] uppercase tracking-widest bg-[#3B021F] inline-block px-3 py-1 rounded-md mb-4">Academic</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="academic" value="overlyWorriedAcademic" label="I am overly worried about my academic performance" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="academic" value="notMotivatedStudy" label="I am not motivated to study" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="academic" value="difficultyUnderstanding" label="I have difficulty understanding the class lessons" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#E0BBD1] uppercase tracking-widest bg-[#3B021F] inline-block px-3 py-1 rounded-md mb-4">Family</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="family" value="hardTimeDealingParents" label="I have a hard time dealing with my parents/guardian's expectations" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="family" value="difficultyOpeningUp" label="I have difficulty opening up to family member/s" />
                    <SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} category="family" value="financialConcerns" label="Our family is having financial concerns" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center sm:px-4">
          <button
            onClick={prevStep}
            className={`px-6 py-3 rounded-full font-semibold transition-all shadow-sm ${step === 0
              ? "opacity-50 cursor-not-allowed bg-slate-200 text-slate-400"
              : "bg-white border text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            disabled={step === 0 || isSubmitting}
          >
            Go Back
          </button>

          <button
            onClick={step === steps.length - 1 ? handleSubmit : nextStep}
            className={`px-8 py-3 bg-[#3B021F] hover:bg-[#4B122F] text-white rounded-full font-semibold shadow-md shadow-[#3B021F]/20 flex items-center transition-all ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'
              }`}
            disabled={isSubmitting}
          >
            {step === steps.length - 1 ? (isSubmitting ? "Submitting..." : "Submit Form") : "Continue"}
            {step !== steps.length - 1 && <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
          </button>
        </div>
      </main>
    </div>
  );
}
