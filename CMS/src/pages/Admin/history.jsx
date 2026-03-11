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
        terminalRecords.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
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
    if (s.includes('completed') || s.includes('accepted') || s.includes('resolved')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s.includes('no-show') || s.includes('terminated')) return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  // Basic client-side filtering
  const filteredForms = forms.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Session Archive</h1>
            <p className="text-slate-500 mt-1">Permanent record of all resolved, completed, or terminated counseling sessions.</p>
          </div>

          {/* Search Table */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search history records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] shadow-sm transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white shadow-sm border border-slate-100/80 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Student Name</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Course & Year</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Type</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Final Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Archive Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">Loading archives...</td>
                  </tr>
                ) : filteredForms.length > 0 ? (
                  filteredForms.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      onClick={() => openModal(student)}
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900 group-hover:text-[#3B021F] transition-colors">{student.name}</td>
                      <td className="py-4 px-6">
                        <div className="text-slate-700 font-medium">{student.course}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Year: {student.year}</div>
                      </td>
                      <td className="py-4 px-6">
                        {student.isReferral ? (
                          <span className="flex items-center gap-1.5 text-sm text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-[#3B021F]"></span> Referral
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-[#E0BBD1]"></span> Walk-In
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${getStatusStyle(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">
                        {new Date(student.submissionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      </div>
                      <p className="text-slate-500 font-medium pt-2">No archived records found.</p>
                      <p className="text-slate-400 text-sm mt-1">Terminal state records will securely populate here.</p>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200">

            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Archived Session Node</h2>
                  <span className="text-sm font-semibold text-slate-500 mx-1">{selectedStudent.id}</span>
                </div>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Closing State</span>
                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getStatusStyle(selectedStudent.status)}`}>
                  {selectedStudent.status}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Audit Details</p>
                <div className="space-y-3 mt-4">
                  <p className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Student Signature:</span> <span className="text-slate-900 font-bold">{selectedStudent.name}</span></p>
                  <p className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Course Block:</span> <span className="text-slate-900 font-bold">{selectedStudent.course} {selectedStudent.year}</span></p>
                  <p className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Creation Vector:</span> <span className="text-slate-900 font-bold">{selectedStudent.type} ({selectedStudent.isReferral ? 'Referral' : 'Direct'})</span></p>
                  <p className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Timestamp:</span> <span className="text-slate-900 font-bold">{new Date(selectedStudent.submissionDate).toLocaleString()}</span></p>
                </div>
              </div>

              {selectedStudent.remarks && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Administrative Remarks Log</p>
                  <p className="text-sm text-blue-900 italic">"{selectedStudent.remarks}"</p>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 bg-slate-50 rounded-b-3xl border-t border-slate-100 flex justify-end">
              <button onClick={closeModal} className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold rounded-full text-sm transition-colors">Acknowledge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
