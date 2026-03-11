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
          forms.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
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
    <div className="min-h-screen bg-[#fcfafa] flex flex-col">
      <StudentNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Welcome back, <span className="text-[#3B021F]">{fullName || "Student"}</span>
          </h1>
          <p className="text-slate-500 text-lg">How are you feeling today? We're here to support your mental well-being.</p>
        </div>

        {/* Primary Action Card (Quick Schedule) */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-10 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-24 h-24 shrink-0 bg-[#E0BBD1]/30 rounded-full flex items-center justify-center text-[#3B021F]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">Request Counseling Session</h2>
              <span className="hidden sm:inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Available Now</span>
            </div>
            <p className="text-slate-500 mb-6 max-w-2xl leading-relaxed">Connect with a professional counselor for a personalized 1:1 session. We offer both in-person and virtual appointments tailored to your schedule.</p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              <button
                onClick={() => navigate('/Request')}
                className="px-6 py-3 bg-[#3B021F] hover:bg-[#4B122F] text-white rounded-full font-semibold shadow-md shadow-[#3B021F]/20 transition-all hover:-translate-y-0.5"
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - Upcoming / Pending */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Action Required & Pending
                </h3>
              </div>

              {isLoading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ) : pendingForms.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p className="text-slate-500 font-medium">You're all caught up!</p>
                  <p className="text-sm text-slate-400 mt-1">No pending requests at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingForms.map((interview) => (
                    <div key={interview.id} className="flex flex-col sm:flex-row justify-between p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                      <div className="flex items-start gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{interview.isReferral ? "Faculty Referral" : "Counseling Request"}</h4>
                          <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            Submitted {new Date(interview.submissionDate).toLocaleDateString()}
                          </p>
                          <span className="inline-block mt-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-[4px] uppercase tracking-wide">
                            {interview.status}
                          </span>
                        </div>
                      </div>

                      {/* Explicit Consent Action Loop */}
                      {interview.status === "Pending Student Consent" && (
                        <div className="flex gap-2 sm:self-center items-center">
                          <button
                            onClick={() => handleConsent(interview.id, true)}
                            className="px-5 py-2.5 bg-[#3B021F] text-white text-sm font-semibold rounded-full hover:bg-[#4B122F] transition-all shadow-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleConsent(interview.id, false)}
                            className="px-5 py-2.5 bg-slate-200 text-slate-700 text-sm font-semibold rounded-full hover:bg-slate-300 transition-all shadow-sm"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column - Notifications & History */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#E0BBD1]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6h-.001zm0 14h-.001a1 1 0 010 2h.001a1 1 0 010-2z" /></svg>
                Notifications
              </h3>

              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-slate-100 rounded"></div>
                  <div className="h-10 bg-slate-100 rounded"></div>
                </div>
              ) : actionedForms.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-500 text-sm">No recent activity.</p>
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {actionedForms.slice(0, 5).map((interview) => {
                    const isSuccess = interview.status === 'Accepted' || interview.status === 'Scheduled' || interview.status === 'Completed';

                    return (
                      <div key={interview.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${isSuccess ? 'bg-[#3B021F] text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                          {isSuccess ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          )}
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-900 text-sm">{isSuccess ? 'Session Approved' : 'Session Updated'}</h4>
                          </div>
                          <span className={`inline-block mb-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {interview.status}
                          </span>
                          {interview.remarks && (
                            <p className="text-slate-500 text-xs italic bg-slate-50 p-2 rounded mt-1 border border-slate-100">"{interview.remarks}"</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Links / Info Card */}
            <div className="bg-[#E0BBD1]/20 rounded-2xl p-6 border border-[#E0BBD1]/30">
              <h3 className="text-lg font-bold text-[#3B021F] mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-[#3B021F] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    University Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-[#3B021F] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Anonymous Peer Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
