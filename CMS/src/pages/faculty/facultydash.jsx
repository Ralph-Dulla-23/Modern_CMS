import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FacultyNavbar from "../ui/facultynavbar";
import { auth, db } from "../../firebase/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFaculty = () => { };
    let unsubscribeReferrals = () => { };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch real faculty name
        unsubscribeFaculty = onSnapshot(doc(db, "faculty", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setFullName(docSnap.data().name || docSnap.data().email.split('@')[0]);
            setDepartment(docSnap.data().department || "");
          } else {
            // fallback
            setFullName("Faculty Member");
          }
        });

        // Fetch their submitted referrals
        // Since we didn't firmly establish facultyUid in all legacy forms, we'll try to match by email first
        const q = query(
          collection(db, "studentInterviews"),
          where("referringFacultyEmail", "==", user.email)
        );

        unsubscribeReferrals = onSnapshot(q, (snapshot) => {
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
          setReferrals(forms);
          setIsLoading(false);
        });
      } else {
        navigate("/login");
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFaculty();
      unsubscribeReferrals();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 overflow-x-hidden">
      <FacultyNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16">
        {/* Welcome Section - Institutional Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200/60 pb-12">
          <div className="max-w-[65ch]">
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-[#3B021F] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md">University Faculty</span>
               {department && <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">{department}</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Welcome, <span className="text-[#3B021F]">{fullName}</span>.
            </h1>
            <p className="text-slate-500 text-lg font-medium mt-4 leading-relaxed">
              Managing student wellness and academic referrals with institutional excellence.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E0BBD1]/20 rounded-xl flex items-center justify-center text-[#3B021F]">
                  <span className="text-xl font-black">{referrals.length}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                  <p className="text-sm font-bold text-slate-900">Referrals</p>
                </div>
             </div>
          </div>
        </div>

        {/* Primary Action Card - Professional & Direct */}
        <div className="relative mb-16 group">
          <div className="absolute inset-0 bg-[#3B021F] rounded-[32px] translate-y-2 opacity-5"></div>
          <div className="relative bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row items-center gap-12">
            <div className="w-24 h-24 shrink-0 bg-[#3B021F] rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-[#3B021F]/20">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Initiate Student Referral</h2>
              <p className="text-slate-500 mb-8 max-w-[55ch] leading-relaxed font-medium">
                Submit a confidential referral for students requiring professional counseling or academic intervention. All requests are processed with strict adherence to privacy protocols.
              </p>
              <button
                onClick={() => navigate('/Forms')}
                className="px-10 py-4 bg-[#3B021F] hover:bg-[#4B122F] text-white rounded-2xl font-bold shadow-xl shadow-[#3B021F]/20 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Create New Referral
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Column - Referral Pipeline */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-slate-100">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                  </div>
                  Referral Pipeline
                </h3>
              </div>

              <div className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>
                    ))}
                  </div>
                ) : referrals.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50/50 rounded-[28px] border border-dashed border-slate-200">
                    <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <p className="text-slate-400 font-bold text-lg italic">No active referrals recorded.</p>
                  </div>
                ) : (
                  referrals.map((referral) => (
                    <div key={referral.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[24px] border border-slate-100 bg-white hover:border-[#E0BBD1] hover:shadow-lg hover:shadow-[#3B021F]/5 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 shrink-0 rounded-[18px] bg-slate-50 flex items-center justify-center text-[#3B021F] border border-slate-100 font-black text-xl">
                          {referral.studentName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg leading-tight">{referral.studentName}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#3B021F]/60">ID: {referral.id.slice(-6)}</span>
                             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                               Submitted {new Date(referral.submissionDate).toLocaleDateString()}
                             </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                          referral.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-[#3B021F] border-slate-100 group-hover:bg-[#E0BBD1]/10 group-hover:border-[#E0BBD1]/20'
                        }`}>
                          {referral.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Official Guidelines */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#3B021F] rounded-[32px] p-8 text-white shadow-xl shadow-[#3B021F]/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
               <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                 <svg className="w-6 h-6 text-[#E0BBD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                 </svg>
                 Guidelines
               </h3>

               <div className="space-y-6 relative z-10">
                 {[
                   { title: "Indicators for Referral", desc: "Sudden academic decline, signs of distress, or prolonged absences." },
                   { title: "Strict Confidentiality", desc: "Referrals are handled with institutional-grade privacy protocols." },
                   { title: "Urgent Protocols", desc: "Contact Campus Security immediately if a student is in direct danger." }
                 ].map((item, i) => (
                   <div key={i} className="pb-6 border-b border-white/10 last:border-0 last:pb-0">
                     <h4 className="font-bold text-[#E0BBD1] text-xs uppercase tracking-[0.2em] mb-2">{item.title}</h4>
                     <p className="text-white/70 text-sm leading-relaxed font-medium">{item.desc}</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
               <h3 className="text-lg font-bold text-slate-900 mb-6">Support Contacts</h3>
               <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Guidance Director</p>
                     <p className="text-sm font-bold text-[#3B021F]">ext. 4402</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Health Services</p>
                     <p className="text-sm font-bold text-[#3B021F]">ext. 4405</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
