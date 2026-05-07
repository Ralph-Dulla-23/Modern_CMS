import React, { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../ui/Studentnavbar";
import { submitStudentInterviewForm, getUnavailableDates } from '../../firebase/firestoreService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";

const InputField = ({ label, type = "text", name, placeholder, formData, handleChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-bold text-slate-800 mb-2.5 ml-1">{label}</label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/10 focus:border-[#3B021F] transition-all placeholder:text-slate-300"
    />
  </div>
);

const TextAreaField = ({ label, name, placeholder, formData, handleChange }) => (
  <div className="mb-8">
    <label className="block text-sm font-bold text-slate-800 mb-2.5 ml-1">{label}</label>
    <textarea
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
      rows="4"
      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[20px] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/10 focus:border-[#3B021F] transition-all resize-none placeholder:text-slate-300 leading-relaxed"
    ></textarea>
  </div>
);

const SelectionCard = ({ value, label, category, formData, handleCheckboxChange }) => {
  const isSelected = formData.areasOfConcern[category].includes(value);

  return (
    <div
      onClick={() => handleCheckboxChange(category, value)}
      className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 h-full
            ${isSelected ? 'border-[#3B021F] bg-[#3B021F]/5 shadow-sm' : 'border-slate-100 bg-slate-50/30 hover:border-[#E0BBD1]/50 hover:bg-white'}`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300
            ${isSelected ? 'border-[#3B021F] bg-[#3B021F] rotate-0' : 'border-slate-300 rotate-45'}`}
      >
        {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
      </div>
      <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-[#3B021F]' : 'text-slate-600'}`}>{label}</span>
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
    { label: "Identity", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Self", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
    { label: "World", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
    { label: "Needs", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
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
    <button type="button" className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/10 focus:border-[#3B021F] transition-all" onClick={onClick} ref={ref}>
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
    <div className="min-h-screen bg-[#fcfafa] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <StudentNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 relative">
        <div className="absolute top-0 right-0 -mr-32 mt-12 w-96 h-96 bg-[#E0BBD1]/10 rounded-full blur-[80px] -z-10"></div>

        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Initial Interview</h1>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Take your time. This information helps us provide you with the most supportive care possible. Your privacy is our absolute priority.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Progress Indicators - Sanctuary Style */}
        <div className="mb-12">
          <div className="flex justify-between relative px-2 mb-4">
            {steps.map((s, i) => {
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <div key={i} className={`flex flex-col items-center relative z-10 w-1/5 transition-all duration-500 ${isActive || isCompleted ? "text-[#3B021F]" : "text-slate-300"}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 
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
          <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#3B021F] transition-all duration-700 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Main Form Area - Large Organic Radius */}
        <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_15px_50px_rgba(59,2,31,0.03)] border border-slate-100 mb-10 min-h-[450px]">
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-2 h-6 bg-[#E0BBD1] rounded-full"></span>
                Trust & Privacy
              </h2>
              <div className="p-8 bg-[#fcfafa] rounded-[32px] border border-slate-100 mb-10 text-sm text-slate-600 leading-[1.8] font-medium italic">
                "I hereby give my consent to the University of the Immaculate Conception Counseling Office to collect, process, and store my personal and sensitive information for the purpose of counseling and academic support. I understand that all information shared will be kept strictly confidential as mandated by law."
              </div>

              <label className="flex items-center gap-5 cursor-pointer p-6 bg-white border-2 border-slate-50 rounded-[28px] hover:border-[#E0BBD1] hover:bg-[#E0BBD1]/5 transition-all group shadow-sm">
                <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${formData.consentGiven ? 'bg-[#3B021F] border-[#3B021F]' : 'border-slate-200 bg-white'}`}>
                    <input
                        type="checkbox"
                        checked={formData.consentGiven}
                        onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                        className="hidden"
                    />
                    {formData.consentGiven && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <span className="font-bold text-slate-800 text-base">I understand and agree to the terms above.</span>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-50">Personal Background</h2>
              <InputField formData={formData} handleChange={handleChange} label="Full Name" name="studentName" placeholder=" Juan Dela Cruz" />

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-800 mb-2.5 ml-1">Preferred Appointment</label>
                {isLoadingDates ? (
                  <div className="h-14 bg-slate-50 rounded-2xl animate-pulse"></div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
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
                        placeholderText="Choose a date..."
                        dateFormat="MMMM d, yyyy"
                        customInput={<CustomDateInput />}
                        wrapperClassName="w-full"
                        dayClassName={date => isDateUnavailable(date) ? "text-rose-400 line-through opacity-50" : undefined}
                      />
                    </div>
                    <div className="relative w-full sm:w-48">
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
                        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/10 focus:border-[#3B021F] transition-all"
                        />
                    </div>
                  </div>
                )}
                {dateError && <p className="text-rose-500 text-xs font-bold mt-2 ml-1">{dateError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2.5 ml-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/10 focus:border-[#3B021F] transition-all" />
                </div>
                <InputField formData={formData} handleChange={handleChange} label="Age & Gender" name="ageSex" placeholder="e.g. 20, Female" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField formData={formData} handleChange={handleChange} label="Contact Number" name="contactNo" placeholder="09XX-XXX-XXXX" />
                <InputField formData={formData} handleChange={handleChange} label="Course / Year & Section" name="courseYearSection" placeholder="e.g. BSCS 2A" />
              </div>

              <InputField formData={formData} handleChange={handleChange} label="Permanent Address" name="presentAddress" placeholder="Enter your full address" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50 mt-8">
                <InputField formData={formData} handleChange={handleChange} label="Emergency Contact Person" name="emergencyContactPerson" placeholder="Name of parent/guardian" />
                <InputField formData={formData} handleChange={handleChange} label="Emergency Contact Number" name="emergencyContactNo" placeholder="09XX-XXX-XXXX" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-50">Self Reflection</h2>
              <TextAreaField formData={formData} handleChange={handleChange} label="1. How would you describe yourself?" name="selfDescription" placeholder="Your personality, strengths, or how you see yourself..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="2. What are the most important things to you?" name="importantThings" placeholder="Values, people, or goals that matter most..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="3. Tell us about your friendships." name="friends" placeholder="The things you enjoy or find difficult in social circles..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="4. How do you feel about your classes?" name="classParticipation" placeholder="Your academic life and participation in campus activities..." />
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-50">Wider Context</h2>
              <TextAreaField formData={formData} handleChange={handleChange} label="5. Tell us about your family relationships." name="family" placeholder="How you relate to family members and the home environment..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="6. Who do you feel most comfortable sharing problems with?" name="comfortableConfidant" placeholder="Is there someone you currently trust or talk to?..." />
              <TextAreaField formData={formData} handleChange={handleChange} label="7. Anything else you'd like to share?" name="additionalComments" placeholder="Is there something we missed that you feel is important?..." />
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-50">Areas of Concern</h2>
              <p className="text-slate-400 text-sm font-medium mb-10 -mt-4">Select any topics you would like to discuss with a counselor. You can select multiple.</p>

              <div className="space-y-12">
                {[
                  { title: "Personal", cat: "personal", items: [
                    { v: "notConfident", l: "Confidence & Self-Esteem" },
                    { v: "hardTimeDecisions", l: "Difficulty Making Decisions" },
                    { v: "problemSleeping", l: "Sleep Issues" },
                    { v: "moodNotStable", l: "Mood Fluctuations" }
                  ]},
                  { title: "Interpersonal", cat: "interpersonal", items: [
                    { v: "beingBullied", l: "Bullying or Harassment" },
                    { v: "cannotHandlePeerPressure", l: "Peer Pressure" },
                    { v: "difficultyGettingAlong", l: "Social Difficulties" }
                  ]},
                  { title: "Academic", cat: "academic", items: [
                    { v: "overlyWorriedAcademic", l: "Academic Performance Anxiety" },
                    { v: "notMotivatedStudy", l: "Lack of Motivation" },
                    { v: "difficultyUnderstanding", l: "Academic Struggles" }
                  ]},
                  { title: "Family", cat: "family", items: [
                    { v: "hardTimeDealingParents", l: "Family Expectations" },
                    { v: "difficultyOpeningUp", l: "Communication at Home" },
                    { v: "financialConcerns", l: "Financial Stressors" }
                  ]}
                ].map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-xs font-black text-[#3B021F] uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                        <span className="w-6 h-px bg-[#E0BBD1]"></span>
                        {section.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.items.map((item, i) => (
                        <SelectionCard key={i} formData={formData} handleCheckboxChange={handleCheckboxChange} category={section.cat} value={item.v} label={item.l} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons - Refined Pill Style */}
        <div className="flex justify-between items-center sm:px-6">
          <button
            onClick={prevStep}
            className={`px-8 py-4 rounded-2xl font-bold transition-all ${step === 0
              ? "opacity-0 pointer-events-none"
              : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100 hover:border-slate-200"
              }`}
            disabled={step === 0 || isSubmitting}
          >
            Go Back
          </button>

          <button
            onClick={step === steps.length - 1 ? handleSubmit : nextStep}
            className={`px-12 py-4 bg-[#3B021F] hover:bg-[#4B122F] text-white rounded-2xl font-bold shadow-xl shadow-[#3B021F]/15 flex items-center gap-3 transition-all ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1 active:translate-y-0'
              }`}
            disabled={isSubmitting}
          >
            <span>{step === steps.length - 1 ? (isSubmitting ? "Submitting..." : "Submit Form") : "Continue"}</span>
            {step !== steps.length - 1 && <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
          </button>
        </div>
      </main>
    </div>
  );
}
