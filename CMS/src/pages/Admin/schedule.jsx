import React, { useState, useEffect } from 'react';
import AdminNavbar from '../ui/adminnavbar';
import { Calendar } from 'primereact/calendar';
import { db } from '../../firebase/firebase-config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function Schedule() {
  const [date, setDate] = useState(new Date());
  const [allSessions, setAllSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formattedDateLocale = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Normalize a date to YYYY-MM-DD string for comparison
  const toDateKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };

  const selectedDateKey = toDateKey(date);

  useEffect(() => {
    const q = query(collection(db, "studentInterviews"), orderBy("submissionDate", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const status = data.status?.toLowerCase() || '';

        // Only show sessions that are actionable (Accepted, Rescheduled, or Pending)
        if (status.includes('accepted') || status.includes('rescheduled') || status.includes('pending')) {
          sessions.push({ id: docSnap.id, ...data });
        }
      });
      setAllSessions(sessions);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter sessions for the selected date
  const sessionsForDate = allSessions.filter(session => {
    // 1. Check dateTime field (from student walk-in submissions)
    if (session.dateTime) {
      return toDateKey(session.dateTime) === selectedDateKey;
    }

    // 2. Check remarks for rescheduled date (format: "Rescheduled to YYYY-MM-DD at HH:MM")
    if (session.remarks?.startsWith('Rescheduled to ')) {
      const rescheduledDate = session.remarks.replace('Rescheduled to ', '').split(' at ')[0];
      return rescheduledDate === selectedDateKey;
    }

    // 3. Check submissionDate as fallback for accepted pending sessions
    if (session.submissionDate) {
      return toDateKey(session.submissionDate) === selectedDateKey;
    }

    return false;
  });

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('accepted')) return 'bg-emerald-100 text-emerald-800';
    if (s.includes('rescheduled')) return 'bg-blue-100 text-blue-800';
    if (s.includes('pending')) return 'bg-amber-100 text-amber-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-10 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Master Schedule</h1>
            <p className="text-slate-500 mt-1">Manage and view upcoming counseling appointments across the directory.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">Live Updates</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Calendar View */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-[#3B021F] flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Select Date
              </h3>
            </div>

            <div className="flex-grow flex justify-center w-full appointment-calendar-wrapper">
              <Calendar
                value={date}
                onChange={(e) => setDate(e.value || new Date())}
                inline
                showWeek
                className="w-full shadow-sm rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Day's Itinerary — Now live from Firestore */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col min-h-[500px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0BBD1]/10 rounded-bl-[100px] -mr-8 -mt-8"></div>

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 z-10 relative">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Day's Itinerary</h3>
                <p className="text-sm font-semibold text-[#3B021F] mt-1">{formattedDateLocale}</p>
              </div>
              <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {sessionsForDate.length} session{sessionsForDate.length !== 1 ? 's' : ''}
              </span>
            </div>

            {isLoading ? (
              <div className="flex-grow flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-[#3B021F]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : sessionsForDate.length > 0 ? (
              <div className="flex-grow overflow-y-auto space-y-3 z-10 relative">
                {sessionsForDate.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{session.studentName || 'Unknown Student'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{session.courseYearSection || ''}</p>
                      </div>
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusStyle(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {session.dateTime ? new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </span>
                      <span className="flex items-center gap-1">
                        {session.isReferral ? (
                          <><span className="w-1.5 h-1.5 rounded-full bg-[#3B021F]"></span> Referral</>
                        ) : (
                          <><span className="w-1.5 h-1.5 rounded-full bg-[#E0BBD1]"></span> Walk-In</>
                        )}
                      </span>
                    </div>
                    {session.remarks && (
                      <p className="text-xs text-slate-400 mt-2 italic">"{session.remarks}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center z-10 relative px-6">
                <div className="w-20 h-20 mb-6 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h4 className="text-xl font-bold text-slate-700 mb-2">No Scheduled Sessions</h4>
                <p className="text-slate-500 max-w-sm">There are no approved intake sessions or recurring meetings listed for this specific date.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default Schedule;
