import React, { useState, useEffect } from 'react';
import AdminNavbar from '../ui/adminnavbar';
import { getStudentInterviewForms, updateFormStatus } from '../../firebase/firestoreService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const mapConcernAreasToText = (concerns, category) => {
  if (!concerns || !Array.isArray(concerns) || concerns.length === 0) {
    return ['None'];
  }

  const mappings = {
    personal: {
      'notConfident': 'I do not feel confident about myself',
      'hardTimeDecisions': 'I have a hard time making decisions',
      'problemSleeping': 'I have a problem with sleeping',
      'moodNotStable': 'I have noticed that my mood is not stable'
    },
    interpersonal: {
      'beingBullied': 'I am being bullied',
      'cannotHandlePeerPressure': 'I cannot handle peer pressure',
      'difficultyGettingAlong': 'I have difficulty getting along with others'
    },
    academic: {
      'overlyWorriedAcademic': 'I am overly worried about my academic performance',
      'notMotivatedStudy': 'I am not motivated to study',
      'difficultyUnderstanding': 'I have difficulty understanding the class lessons'
    },
    family: {
      'hardTimeDealingParents': 'I have a hard time dealing with my parents/guardian\'s expectations and demands',
      'difficultyOpeningUp': 'I have difficulty opening up to family member/s',
      'financialConcerns': 'Our family is having financial concerns'
    }
  };

  return concerns.map(concern => mappings[category][concern] || concern);
};

function SubmittedFormsManagement() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchForms = async () => {
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

          const areasOfConcern = form.areasOfConcern || {};

          return {
            id: form.id,
            name: form.studentName || 'Unknown',
            course: course,
            year: year,
            type: form.type || 'Walk-in',
            referral: form.referral || 'Self',
            status: form.status || 'Pending',
            remarks: form.remarks || '',
            isReferral: form.isReferral || false,
            submissionDate: form.submissionDate,
            details: {
              mode: form.isReferral ? 'Referral' : 'Non-Referral',
              fullName: form.studentName || 'Unknown',
              email: form.email || 'Unknown',
              courseYear: form.courseYearSection || 'Unknown',
              department: form.department || 'Unknown',
              id: form.studentId || form.studentUid || 'Unknown',
              dob: form.dateOfBirth || 'Unknown',
              ageSex: form.ageSex || 'Unknown',
              contact: form.contactNo || 'Unknown',
              address: form.presentAddress || 'Unknown',
              emergencyContact: `${form.emergencyContactPerson || 'Unknown'} - ${form.emergencyContactNo || 'Unknown'}`,
              date: form.dateTime ? new Date(form.dateTime).toLocaleDateString() : 'Unknown',
              time: form.dateTime ? new Date(form.dateTime).toLocaleTimeString() : 'Unknown',
              personal: mapConcernAreasToText(areasOfConcern.personal, 'personal'),
              interpersonal: mapConcernAreasToText(areasOfConcern.interpersonal, 'interpersonal'),
              grief: ['None'],
              academics: mapConcernAreasToText(areasOfConcern.academic, 'academic'),
              family: mapConcernAreasToText(areasOfConcern.family, 'family'),
              selfDescription: form.selfDescription,
              importantThings: form.importantThings,
              friends: form.friends,
              classParticipation: form.classParticipation,
              familyRef: form.family,
              comfortableConfidant: form.comfortableConfidant,
              additionalComments: form.additionalComments
            }
          };
        });

        // Sort by newest first
        processedForms.sort((a, b) => {
          const dateA = a.submissionDate?.toDate ? a.submissionDate.toDate() : new Date(a.submissionDate);
          const dateB = b.submissionDate?.toDate ? b.submissionDate.toDate() : new Date(b.submissionDate);
          return dateB - dateA;
        });

        setForms(processedForms);
      } else {
        setError(result.error || "Failed to fetch forms. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      setError("Failed to fetch forms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const openRescheduleModal = () => {
    setIsModalOpen(false);
    setIsRescheduleModalOpen(true);

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const formattedDate = nextWeek.toISOString().split('T')[0];

    setRescheduleDate(formattedDate);
    setRescheduleTime('10:00');
  };

  const closeRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setIsModalOpen(true);
  };

  const handleAccept = async () => {
    if (!selectedStudent) return;
    try {
      const result = await updateFormStatus(selectedStudent.id, 'Accepted', 'Session Approved by Admin');
      if (result.success) {
        setForms(forms.map(form =>
          form.id === selectedStudent.id
            ? { ...form, status: 'Accepted', remarks: 'Session Approved by Admin' }
            : form
        ));
        closeModal();
      } else {
        toast.error("Failed to update session status.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleCompleted = async () => {
    if (!selectedStudent) return;
    try {
      const result = await updateFormStatus(selectedStudent.id, 'Completed', 'Student attended the session');
      if (result.success) {
        setForms(forms.map(form =>
          form.id === selectedStudent.id
            ? { ...form, status: 'Completed', remarks: 'Student attended the session' }
            : form
        ));
        closeModal();
      } else {
        toast.error("Failed to mark as completed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleNoShow = async () => {
    if (!selectedStudent) return;
    try {
      const result = await updateFormStatus(selectedStudent.id, 'No-Show', 'Student did not attend');
      if (result.success) {
        setForms(forms.map(form =>
          form.id === selectedStudent.id
            ? { ...form, status: 'No-Show', remarks: 'Student did not attend' }
            : form
        ));
        closeModal();
      } else {
        toast.error("Failed to mark as no-show. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedStudent || !rescheduleDate || !rescheduleTime) {
      toast.warning("Please select both date and time for rescheduling.");
      return;
    }

    try {
      const formattedDateTime = `${rescheduleDate} at ${rescheduleTime}`;
      const remarks = `Rescheduled to ${formattedDateTime}`;

      const result = await updateFormStatus(selectedStudent.id, 'Rescheduled', remarks);

      if (result.success) {
        setForms(forms.map(form =>
          form.id === selectedStudent.id
            ? { ...form, status: 'Rescheduled', remarks: remarks }
            : form
        ));
        setRescheduleDate('');
        setRescheduleTime('');
        setIsRescheduleModalOpen(false);
        setSelectedStudent(null);
      } else {
        toast.error("Failed to reschedule session.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const nonReferralForms = forms.filter(form => !form.isReferral);
  const referralForms = forms.filter(form => form.isReferral);

  const displayForms = activeTab === 'walk-in' ? nonReferralForms :
    activeTab === 'referral' ? referralForms : forms;

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('pending')) return 'bg-amber-50 text-amber-800 border border-amber-200';
    if (s.includes('completed') || s.includes('accepted')) return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    if (s.includes('no-show') || s.includes('terminated')) return 'bg-rose-50 text-rose-800 border border-rose-200';
    if (s.includes('reschedule')) return 'bg-blue-50 text-blue-800 border border-blue-200';
    return 'bg-white text-slate-500 border border-slate-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfafa] flex flex-col">
        <AdminNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-[#3B021F]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-500 font-medium">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      <AdminNavbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-8 py-16 relative">
        <div className="absolute top-0 right-0 -mr-32 mt-24 w-[600px] h-[600px] bg-[#E0BBD1]/5 rounded-full blur-[120px] -z-10"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-[#3B021F] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-[#3B021F]/10">Clinical Data</span>
               <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Intake Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
               Form <span className="text-[#3B021F]">Submissions</span>
            </h1>
            <p className="text-slate-500 mt-4 text-lg font-medium max-w-[60ch]">Manage, approve, and track all incoming student intake forms.</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p>{error}</p>
            <button onClick={fetchForms} className="font-semibold underline ml-2 hover:text-rose-900">Try Again</button>
          </div>
        )}

        {/* Filters and Table Container */}
        <div className="bg-white rounded-[40px] shadow-[0_4px_30px_rgba(0,0,0,0.01)] border border-slate-100 overflow-hidden relative z-10">

          {/* Tabs */}
          <div className="p-6 sm:px-10 border-b border-slate-50">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'all' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                onClick={() => setActiveTab('all')}
              >
                All Submissions <span className="py-0.5 px-2 bg-white rounded-full text-[10px] border border-slate-200">{forms.length}</span>
              </button>
              <button
                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'walk-in' ? 'bg-[#E0BBD1]/20 text-[#3B021F] shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                onClick={() => setActiveTab('walk-in')}
              >
                Walk-in <span className="py-0.5 px-2 bg-white rounded-full text-[10px] border border-slate-200">{nonReferralForms.length}</span>
              </button>
              <button
                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'referral' ? 'bg-[#3B021F]/10 text-[#3B021F] shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                onClick={() => setActiveTab('referral')}
              >
                Faculty Referrals <span className="py-0.5 px-2 bg-white rounded-full text-[10px] border border-slate-200">{referralForms.length}</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto p-4 sm:px-10 pb-10 pt-2">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">
                  <th className="py-6 px-6 border-b border-slate-50 w-1/4">Student Name</th>
                  <th className="py-6 px-6 border-b border-slate-50">Course & Year</th>
                  <th className="py-6 px-6 border-b border-slate-50">Type</th>
                  <th className="py-6 px-6 border-b border-slate-50">Status</th>
                  <th className="py-6 px-6 border-b border-slate-50 text-right">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayForms.length > 0 ? (
                  displayForms.map((student) => (
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
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.details.email}</span>
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
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Faculty Referral
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Walk-In
                          </span>
                        )}
                      </td>
                      <td className="py-6 px-6">
                        <span className={`inline-block px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-full transition-all ${getStatusStyle(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-6 px-6 text-[11px] font-bold text-slate-500 text-right">
                        {new Date(student.submissionDate?.toDate ? student.submissionDate.toDate() : student.submissionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <p className="text-slate-500 font-medium">No submissions found in this category.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 sm:p-10 border-b border-slate-50 bg-slate-50/30">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Student Intake Profile</h2>
                <div className="flex items-center gap-4">
                  <span className={`inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-full transition-all ${getStatusStyle(selectedStudent.status)}`}>
                    {selectedStudent.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submitted: {new Date(selectedStudent.submissionDate).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#3B021F] hover:text-white hover:border-[#3B021F] transition-all shadow-sm shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: Demographics */}
                <div className="lg:col-span-1 border-r border-slate-50 pr-0 lg:pr-10">
                  <h3 className="text-[10px] font-black text-[#3B021F] uppercase tracking-[0.2em] mb-6">Demographics</h3>
                  <div className="space-y-6">
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</span>
                      <span className="text-slate-900 font-bold text-sm">{selectedStudent.details.fullName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</span>
                      <span className="text-slate-900 font-bold text-sm">{selectedStudent.details.email}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course/Yr/Sec</span>
                      <span className="text-slate-900 font-bold text-sm">{selectedStudent.details.courseYear}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age/Sex</span>
                        <span className="text-slate-900 font-bold text-sm">{selectedStudent.details.ageSex}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DOB</span>
                        <span className="text-slate-900 font-bold text-sm">{selectedStudent.details.dob}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact No.</span>
                      <span className="text-slate-900 font-bold text-sm">{selectedStudent.details.contact}</span>
                    </div>
                    <div className="p-6 bg-rose-50 rounded-2xl mt-8 border border-rose-100/50">
                      <span className="block text-[10px] font-black text-rose-800 uppercase tracking-[0.2em] mb-3">Emergency Contact</span>
                      <span className="block text-slate-900 font-bold text-sm mb-1">{selectedStudent.details.emergencyContact.split(' - ')[0]}</span>
                      <span className="block text-rose-700 font-bold text-sm">{selectedStudent.details.emergencyContact.split(' - ')[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Right Area: Concerns & Details */}
                <div className="lg:col-span-2">
                  <h3 className="text-[10px] font-black text-[#3B021F] uppercase tracking-[0.2em] mb-6">Identified Concerns</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {['personal', 'interpersonal', 'academics', 'family'].map((cat) => {
                      const items = selectedStudent.details[cat];
                      if (!items || items.length === 0 || (items.length === 1 && items[0] === 'None')) return null;

                      return (
                        <div key={cat} className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                          <h4 className="font-bold text-slate-900 capitalize mb-3">{cat}</h4>
                          <ul className="space-y-2">
                            {items.map((item, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2 font-medium">
                                <span className="text-[#E0BBD1] mt-0.5 font-black">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <h3 className="text-[10px] font-black text-[#3B021F] uppercase tracking-[0.2em] mb-6">Self-Reported Qualitative Data</h3>
                  <div className="space-y-6">
                    {selectedStudent.details.selfDescription && (
                      <div>
                        <span className="block text-xs font-bold text-slate-900 mb-2">Self Description</span>
                        <p className="text-slate-600 text-sm bg-white p-5 rounded-2xl border border-slate-100 font-medium leading-relaxed">{selectedStudent.details.selfDescription}</p>
                      </div>
                    )}
                    {selectedStudent.details.importantThings && (
                      <div>
                        <span className="block text-xs font-bold text-slate-900 mb-2">Important Things</span>
                        <p className="text-slate-600 text-sm bg-white p-5 rounded-2xl border border-slate-100 font-medium leading-relaxed">{selectedStudent.details.importantThings}</p>
                      </div>
                    )}
                    {selectedStudent.details.comfortableConfidant && (
                      <div>
                        <span className="block text-xs font-bold text-slate-900 mb-2">Comfortable Confidant</span>
                        <p className="text-slate-600 text-sm bg-white p-5 rounded-2xl border border-slate-100 font-medium leading-relaxed">{selectedStudent.details.comfortableConfidant}</p>
                      </div>
                    )}
                    {selectedStudent.remarks && (
                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100/50 mt-8">
                        <span className="block text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          System / Admin Remarks
                        </span>
                        <p className="text-amber-900 text-sm font-bold italic">"{selectedStudent.remarks}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-8 sm:p-10 border-t border-slate-50 bg-white/50 max-h-[250px] overflow-y-auto">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <svg className="w-5 h-5 text-[#3B021F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                Session Resolution Actions
              </h3>

              <div className="flex flex-wrap gap-4">
                {/* Pending State Actions */}
                {(selectedStudent.status?.toLowerCase().includes('pending') || selectedStudent.status?.toLowerCase().includes('rescheduled request')) && (
                  <>
                    <button
                      onClick={handleAccept}
                      className="px-8 py-3.5 bg-[#3B021F] text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-[#4B122F] transition-all shadow-md hover:shadow-lg"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={openRescheduleModal}
                      className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-[#3B021F] text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-slate-50 transition-all shadow-sm"
                    >
                      Reschedule
                    </button>
                  </>
                )}

                {/* Non-Terminal State Action */}
                {!(selectedStudent.status?.toLowerCase().includes('completed') || selectedStudent.status?.toLowerCase().includes('no-show') || selectedStudent.status?.toLowerCase().includes('terminated')) && (
                  <div className="flex gap-4 ml-auto">
                    <button
                      onClick={handleCompleted}
                      className="px-6 py-3.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 border border-emerald-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      Complete
                    </button>
                    <button
                      onClick={handleNoShow}
                      className="px-6 py-3.5 bg-rose-50 text-rose-800 hover:bg-rose-100 text-[11px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 border border-rose-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                      No-Show
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Reschedule <span className="text-[#3B021F]">Session</span></h2>

            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={closeRescheduleModal}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="flex-1 py-4 bg-[#3B021F] text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#4B122F] transition-all shadow-md hover:shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmittedFormsManagement;