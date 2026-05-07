import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../ui/Studentnavbar";
import { auth, db } from "../../firebase/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { updateConsentStatus } from "../../firebase/firestoreService";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleConsent = async (interviewId, consentGiven) => {
    if (window.confirm(consentGiven ? "Are you sure you want to consent to this counseling referral?" : "Are you sure you want to decline this counseling referral?")) {
      const result = await updateConsentStatus(interviewId, consentGiven);
      if (!result.success) {
        toast.error("Failed to update consent: " + result.error);
      }
    }
  };

  useEffect(() => {
    let unsubscribeStudent = () => { };
    let unsubscribeInterviews = () => { };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 1. Listen to the student's profile for their real name
        unsubscribeStudent = onSnapshot(doc(db, "students", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setFullName(docSnap.data().name || docSnap.data().email);
          }
        });

        // 2. Listen to their submitted forms
        const q = query(collection(db, "studentInterviews"), where("studentUid", "==", user.uid));
        unsubscribeInterviews = onSnapshot(q, (snapshot) => {
          const forms = [];
          snapshot.forEach((doc) => {
            forms.push({ id: doc.id, ...doc.data() });
          });

          // Sort by newest first
          forms.sort((a, b) => {
            const dateA = a.submissionDate?.toDate ? a.submissionDate.toDate() : new Date(a.submissionDate);
            const dateB = b.submissionDate?.toDate ? b.submissionDate.toDate() : new Date(b.submissionDate);
            return dateB - dateA;
          });
          setInterviews(forms);
          setIsLoading(false);
        });
      } else {
        navigate("/login");
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeStudent();
      unsubscribeInterviews();
    };
  }, [navigate]);

  const pendingForms = interviews.filter(i => i.status?.toLowerCase().includes("pending"));
  const actionedForms = interviews.filter(i => !i.status?.toLowerCase().includes("pending"));

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 overflow-x-hidden">
      <StudentNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 relative">
        {/* Background Decorative Element - Soft Wash */}
        <div className="absolute top-0 right-0 -mr-24 mt-24 w-[500px] h-[500px] bg-[#E0BBD1]/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-24 mb-24 w-[400px] h-[400px] bg-[#3B021F]/5 rounded-full blur-[80px] -z-10"></div>

        {/* Welcome Section - Calm & Centered */}
        <div className="mb-16 max-w-[65ch]">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-[1.1]">
            Hello, <span className="text-[#3B021F]">{fullName || "Student"}</span>. 
            <span className="block text-slate-400 font-medium">This is your space.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
            Take a breath. We're here to support your journey and provide the care you deserve.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Primary Column */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Primary Action - The Gentle Nudge */}
            <div className="relative group">
              <div className="absolute inset-0 bg-[#3B021F]/5 rounded-[32px] translate-y-2 translate-x-1 group-hover:translate-y-3 group-hover:translate-x-2 transition-transform duration-500"></div>
              <div className="relative bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_50px_rgba(59,2,31,0.05)] border border-slate-100 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 shrink-0 bg-[#E0BBD1]/20 rounded-[24px] flex items-center justify-center text-[#3B021F] rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Speak with someone today</h2>
                  <p className="text-slate-500 mb-8 max-w-[50ch] leading-relaxed font-medium">
                    Whether it's a quick check-in or a deep conversation, our counselors are ready to listen in a safe, confidential space.
                  </p>
                  <button
                    onClick={() => navigate('/Request')}
                    className="group relative inline-flex items-center justify-center px-10 py-4 bg-[#3B021F] text-white rounded-full font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#3B021F]/20"
                  >
                    <span>Request a Session</span>
                    <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks & Pending Section - The Tonal Wash */}
            <div className="bg-[#E0BBD1]/15 rounded-[40px] p-8 md:p-10 border border-[#E0BBD1]/20">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold text-[#3B021F] flex items-center gap-3">
                  <span className="w-2 h-8 bg-[#3B021F] rounded-full"></span>
                  Active Care & Tasks
                </h3>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-white/50 rounded-3xl animate-pulse"></div>
                  ))}
                </div>
              ) : pendingForms.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-sm rounded-[32px] py-16 text-center border border-white/60">
                  <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg className="w-10 h-10 text-[#E0BBD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-slate-600 font-bold text-lg italic">Peace of mind.</p>
                  <p className="text-sm text-slate-400 mt-1 font-medium">No tasks require your attention right now.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pendingForms.map((interview) => (
                    <div key={interview.id} className="bg-white rounded-[28px] p-6 shadow-[0_10px_30px_rgba(59,2,31,0.03)] border border-white/80 group">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#fcfafa] flex items-center justify-center text-[#3B021F] border border-slate-50">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{interview.isReferral ? "Faculty Support Referral" : "Counseling Request"}</h4>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="px-2.5 py-1 bg-[#3B021F]/5 text-[#3B021F] text-[10px] font-bold rounded-lg uppercase tracking-wider border border-[#3B021F]/10">
                                {interview.status}
                              </span>
                              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                                {new Date(interview.submissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {interview.status === "Pending Student Consent" && (
                          <div className="flex gap-3 w-full md:w-auto">
                            <button
                              onClick={() => handleConsent(interview.id, true)}
                              className="flex-1 md:flex-none px-8 py-3 bg-[#3B021F] text-white text-sm font-bold rounded-2xl hover:bg-[#4B122F] transition-all"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleConsent(interview.id, false)}
                              className="flex-1 md:flex-none px-8 py-3 bg-slate-50 text-slate-500 text-sm font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Column - The Whisper Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Recent Activity - Minimalist Timeline */}
            <div className="px-4">
              <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                Recent Updates
              </h3>

              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div>
                      <div className="flex-1 h-4 bg-slate-50 rounded animate-pulse mt-2"></div>
                    </div>
                  ))}
                </div>
              ) : actionedForms.length === 0 ? (
                <p className="text-slate-400 text-sm font-medium italic">No recent updates.</p>
              ) : (
                <div className="space-y-10 relative before:absolute before:inset-0 before:left-[15px] before:w-px before:bg-slate-100 before:h-full">
                  {actionedForms.slice(0, 4).map((interview) => {
                    const isSuccess = ['Accepted', 'Scheduled', 'Completed'].includes(interview.status);
                    return (
                      <div key={interview.id} className="relative flex gap-6 items-start">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 z-10 transition-colors ${
                          isSuccess ? 'bg-[#3B021F] text-white ring-8 ring-[#fcfafa]' : 'bg-white text-slate-300 ring-8 ring-[#fcfafa] border border-slate-100'
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isSuccess ? "M5 13l4 4L19 7" : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}></path>
                          </svg>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h4 className="font-bold text-slate-900 text-sm">{isSuccess ? 'Session Approved' : 'Request Updated'}</h4>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                            {interview.status} • {new Date(interview.submissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          {interview.remarks && (
                            <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-50 text-slate-500 text-xs leading-relaxed shadow-sm italic">
                              "{interview.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Support Resources - Soft Surface */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Resources</h3>
              <div className="grid gap-4">
                {[
                  { label: "Wellness Guide", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
                  { label: "Emergency Contacts", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }
                ].map((item, i) => (
                  <a key={i} href="#" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#fcfafa] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#E0BBD1]/10 flex items-center justify-center text-[#3B021F] group-hover:bg-[#E0BBD1]/20 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon}></path>
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
