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

          // Sort by newest
          forms.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
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
    <div className="min-h-screen bg-[#fcfafa] flex flex-col">
      <FacultyNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Welcome, <span className="text-[#3B021F]">{fullName}</span>
          </h1>
          <p className="text-slate-500 text-lg">
            {department ? `${department} Department` : 'University Faculty'}
          </p>
        </div>

        {/* Primary Action Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-10 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-24 h-24 shrink-0 bg-[#3B021F]/10 rounded-full flex items-center justify-center text-[#3B021F]">
            <svg className="w-10 h-10 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">Refer a Student</h2>
            </div>
            <p className="text-slate-500 mb-6 max-w-2xl leading-relaxed">
              If you identify a student who may benefit from professional academic or personal counseling, you can initiate a confidential referral request here.
            </p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              <button
                onClick={() => navigate('/Forms')}
                className="px-6 py-3 bg-[#3B021F] hover:bg-[#4B122F] text-white rounded-full font-semibold shadow-md shadow-[#3B021F]/20 transition-all hover:-translate-y-0.5"
              >
                Create Referral Form
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tracking / History */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                Your Submitted Referrals
              </h3>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-slate-100 rounded-xl"></div>
                  <div className="h-20 bg-slate-100 rounded-xl"></div>
                </div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p className="text-slate-500 font-medium">No active referrals.</p>
                  <p className="text-sm text-slate-400 mt-1">You haven't submitted any forms yet.</p>
                </div>
              ) : (
                referrals.map((referral) => (
                  <div key={referral.id} className="flex flex-col sm:flex-row justify-between p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors">
                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                      <div className="w-10 h-10 mt-0.5 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <span className="font-bold text-lg">{referral.studentName?.charAt(0) || '?'}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{referral.studentName}</h4>
                        <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          Referred on {new Date(referral.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="sm:self-center">
                      <span className={`inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md
                          ${referral.status?.toLowerCase().includes('pending') ? 'bg-amber-100 text-amber-800' :
                          referral.status?.toLowerCase().includes('completed') || referral.status?.toLowerCase().includes('accepted') ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-200 text-slate-800'
                        }
                       `}>
                        {referral.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Guidelines / Info */}
          <div className="bg-[#E0BBD1]/20 rounded-2xl p-6 sm:p-8 border border-[#E0BBD1]/30 self-start">
            <h3 className="text-xl font-bold text-[#3B021F] mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Faculty Guidelines
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                <h4 className="font-semibold text-slate-900 mb-1">When to Refer</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Refer students who display sudden drops in academic performance, signs of extreme distress, prolonged absences, or directly express a need for professional counseling.</p>
              </div>

              <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                <h4 className="font-semibold text-slate-900 mb-1">Confidentiality</h4>
                <p className="text-slate-600 text-sm leading-relaxed">All referrals are handled highly confidentially. The student will be notified of your request and must provide consent to the counseling office before any sessions commence.</p>
              </div>

              <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                <h4 className="font-semibold text-slate-900 mb-1">Urgent Interventions</h4>
                <p className="text-slate-600 text-sm leading-relaxed">If you believe a student is in immediate danger to themselves or others, do not use this form. Please contact Campus Security or the Dean's Office immediately.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
