import React, { useState, useEffect } from 'react';
import AdminNavbar from '../ui/adminnavbar';
import { getStudentInterviewForms } from '../../firebase/firestoreService';

function History() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const result = await getStudentInterviewForms();

      if (result.success) {
        const processedForms = result.forms.map(form => {
          let course = 'Unknown';
          let year = 'Unknown';

          if (form.courseYearSection) {
            const parts = form.courseYearSection.split(' ');
            if (parts.length > 0) {
              course = parts[0];
              const yearMatch = form.courseYearSection.match(/(\d+)[a-zA-Z]{2}/);
              if (yearMatch) {
                year = yearMatch[0];
              } else if (parts.length > 1) {
                year = parts[1];
              }
            }
          }

          return {
            id: form.id,
            name: form.studentName || 'Unknown',
            course: course,
            year: year,
            type: form.type || 'Walk-in',
            status: form.status || 'Pending',
            remarks: form.remarks || '',
            isReferral: form.isReferral || false,
            submissionDate: form.submissionDate,
            details: form.details, // Used in the future if details are needed
          };
        });

        // ONLY keep terminal state requests in "History" (e.g. Completed, Resolved, Terminated, No-Show)
        const terminalRecords = processedForms.filter(f => {
          const s = f.status?.toLowerCase() || '';
          return s.includes('complete') || s.includes('resolve') || s.includes('terminate') || s.includes('no-show') || s.includes('accept');
        });

        // Sort by newest first
        terminalRecords.sort((a, b) => {
          const dateA = a.submissionDate?.toDate ? a.submissionDate.toDate() : new Date(a.submissionDate);
          const dateB = b.submissionDate?.toDate ? b.submissionDate.toDate() : new Date(b.submissionDate);
          return dateB - dateA;
        });
        setForms(terminalRecords);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('completed') || s.includes('accepted') || s.includes('resolved')) return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    if (s.includes('no-show') || s.includes('terminated')) return 'bg-rose-50 text-rose-800 border border-rose-200';
    return 'bg-white text-slate-500 border border-slate-200';
  };

  // Basic client-side filtering
  const filteredForms = forms.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      <AdminNavbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-8 py-16 relative">
        <div className="absolute top-0 right-0 -mr-32 mt-24 w-[600px] h-[600px] bg-[#E0BBD1]/5 rounded-full blur-[120px] -z-10"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-[#3B021F] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-[#3B021F]/10">Data Vault</span>
               <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Archived Records</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Session <span className="text-[#3B021F]">Archive</span>
            </h1>
            <p className="text-slate-500 mt-4 text-lg font-medium max-w-[60ch]">Permanent record of all resolved, completed, or terminated counseling sessions.</p>
          </div>

          {/* Search Table */}
          <div className="relative w-full md:w-96 shrink-0">
            <input
              type="text"
              placeholder="Search history records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 bg-white border border-slate-100 rounded-full text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] shadow-[0_4px_30px_rgba(0,0,0,0.01)] transition-all placeholder:text-slate-300"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[40px] shadow-[0_4px_30px_rgba(0,0,0,0.01)] border border-slate-100 overflow-hidden relative z-10">
          <div className="overflow-x-auto min-h-[400px] p-4 sm:p-10">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">
                  <th className="py-6 px-6 border-b border-slate-50 w-1/4">Student Name</th>
                  <th className="py-6 px-6 border-b border-slate-50">Course & Year</th>
                  <th className="py-6 px-6 border-b border-slate-50">Type</th>
                  <th className="py-6 px-6 border-b border-slate-50">Final Status</th>
                  <th className="py-6 px-6 border-b border-slate-50 text-right">Archive Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-bold tracking-widest text-[10px] uppercase">Loading archives...</td>
                  </tr>
                ) : filteredForms.length > 0 ? (
                  filteredForms.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      onClick={() => openModal(student)}
                    >
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 group-hover:bg-[#3B021F] group-hover:text-white transition-colors shrink-0">
                              {student.name?.charAt(0)}
                           </div>
                           <div>
                              <span className="font-black text-slate-900 block text-sm tracking-tight">{student.name}</span>
                           </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="text-slate-700 font-bold text-sm">{student.course}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Year {student.year}</div>
                      </td>
                      <td className="py-6 px-6">
                        {student.isReferral ? (
                          <span className="flex items-center gap-2 text-[10px] font-black text-blue-700 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Referral
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Walk-In
                          </span>
                        )}
                      </td>
                      <td className="py-6 px-6">
                        <span className={`inline-block px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-full transition-all ${getStatusStyle(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-6 px-6 text-[11px] font-bold text-slate-500 text-right">
                        {new Date(student.submissionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      </div>
                      <p className="text-slate-900 text-2xl font-bold pt-2 mb-2">No archived records found.</p>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">Terminal state records will securely populate here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Snapshot Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

            <div className="p-8 sm:p-10 border-b border-slate-50 bg-slate-50/30">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Archived Node</h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedStudent.id}</span>
                </div>
                <button onClick={closeModal} className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#3B021F] hover:text-white transition-all shadow-sm shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            <div className="p-8 sm:p-10 space-y-8">
              <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                <span className="font-black text-[#3B021F] uppercase tracking-[0.2em] text-[10px]">Closing State</span>
                <span className={`inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-full ${getStatusStyle(selectedStudent.status)}`}>
                  {selectedStudent.status}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Audit Details</p>
                <div className="space-y-4">
                  <p className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Student Signature:</span> <span className="text-slate-900 font-black">{selectedStudent.name}</span></p>
                  <p className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Course Block:</span> <span className="text-slate-900 font-black">{selectedStudent.course} {selectedStudent.year}</span></p>
                  <p className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Creation Vector:</span> <span className="text-slate-900 font-black">{selectedStudent.type} ({selectedStudent.isReferral ? 'Referral' : 'Direct'})</span></p>
                  <p className="flex justify-between text-sm"><span className="text-slate-500 font-bold">Timestamp:</span> <span className="text-slate-900 font-black">{new Date(selectedStudent.submissionDate).toLocaleString()}</span></p>
                </div>
              </div>

              {selectedStudent.remarks && (
                <div className="p-6 bg-blue-50 border border-blue-100/50 rounded-3xl">
                  <p className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em] mb-3">Administrative Remarks Log</p>
                  <p className="text-sm text-blue-900 font-bold italic">"{selectedStudent.remarks}"</p>
                </div>
              )}
            </div>

            <div className="p-8 sm:p-10 bg-slate-50/50 border-t border-slate-50 flex justify-end">
              <button onClick={closeModal} className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-[#3B021F] font-black text-[11px] uppercase tracking-widest rounded-full transition-all shadow-sm">Acknowledge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
