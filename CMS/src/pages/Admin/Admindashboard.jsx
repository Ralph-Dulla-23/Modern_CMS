import React, { useState, useEffect } from 'react';
import AdminNavbar from '../ui/adminnavbar';
import { Chart } from 'primereact/chart';
import { db } from '../../firebase/firebase-config';
import { collection, onSnapshot, query, orderBy, limit, getCountFromServer } from 'firebase/firestore';

function AdminDashboard() {
  const [studentsPerCollegeData, setStudentsPerCollegeData] = useState({});
  const [sessionTypesData, setSessionTypesData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    newRequests: 0,
    completedSessions: 0,
    noShows: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // 1. Fetch Total Students Count (Optimized to NOT download entire collection)
    const fetchTotalStudents = async () => {
      try {
        const coll = collection(db, "students");
        const snapshot = await getCountFromServer(coll);
        setMetrics(prev => ({ ...prev, totalStudents: snapshot.data().count }));
      } catch (error) {
        console.error("Error fetching student count:", error);
      }
    };

    // Call once on mount, or implement a low-frequency polling if live update is critical
    fetchTotalStudents();

    // (Note: Pie chart demographics data would normally be computed via a Cloud Function
    //  that maintains an aggregated metadata document. Temporarily omitting to save reads)
    setStudentsPerCollegeData({
      labels: ['Data requires aggregation function'],
      datasets: [{
        data: [1],
        backgroundColor: ['rgba(224, 187, 209, 0.4)'],
        borderColor: 'transparent',
      }],
    });

    // 2. Listen to Student Interviews for Metrics, Table & Bar Chart
    const q = query(collection(db, "studentInterviews"), orderBy("submissionDate", "desc"));
    const unsubscribeInterviews = onSnapshot(q, (snapshot) => {
      let pending = 0;
      let completed = 0;
      let noShowCount = 0;
      const sessionTypes = { 'Walk-in': 0, 'Referral': 0, 'Online': 0 };
      const activity = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const status = data.status?.toLowerCase() || "";

        // Metrics
        if (status.includes("pending")) pending++;
        if (status.includes("completed") || status.includes("resolved") || status.includes("terminated")) completed++;
        if (status.includes("no-show")) noShowCount++;

        // Types
        if (data.isReferral) {
          sessionTypes['Referral']++;
        } else if (data.type?.toLowerCase().includes("online")) {
          sessionTypes['Online']++;
        } else {
          sessionTypes['Walk-in']++;
        }

        // Catch newest 5 for Activity
        if (activity.length < 5) {
          activity.push({ id: docSnap.id, ...data });
        }
      });

      setMetrics(prev => ({ ...prev, newRequests: pending, completedSessions: completed, noShows: noShowCount }));
      setRecentActivity(activity);

      // Format Bar Chart
      setSessionTypesData({
        labels: Object.keys(sessionTypes),
        datasets: [{
          label: 'Total Sessions',
          data: Object.values(sessionTypes),
          backgroundColor: ['rgba(59, 2, 31, 0.85)', 'rgba(224, 187, 209, 0.85)', 'rgba(75, 18, 47, 0.85)'],
          borderRadius: 8,
          borderWidth: 0,
          barPercentage: 0.5
        }],
      });
    });

    const standardOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 24,
            font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600', size: 12 },
            color: '#64748b'
          }
        }
      },
      scales: {
        y: {
          display: true,
          grid: { display: true, color: 'rgba(241, 245, 249, 0.8)' }, 
          border: { display: false },
          ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" }, color: '#94a3b8' }
        },
        x: {
          display: true,
          grid: { display: false },
          border: { display: false },
          ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" }, color: '#94a3b8' }
        }
      }
    };

    setChartOptions(standardOptions);

    return () => {
      unsubscribeInterviews();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 overflow-x-hidden">
      <AdminNavbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-8 py-16 relative">
        {/* Decorative Brand Element */}
        <div className="absolute top-0 right-0 -mr-32 mt-24 w-[600px] h-[600px] bg-[#E0BBD1]/5 rounded-full blur-[120px] -z-10"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-[#3B021F] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-[#3B021F]/10">Command Center</span>
               <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Clinical Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
               System <span className="text-[#3B021F]">Intelligence</span>
            </h1>
            <p className="text-slate-500 mt-4 text-lg font-medium max-w-[60ch]">
              Monitoring institutional wellbeing through real-time data and clinical metrics.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Sync</span>
             </div>
          </div>
        </div>

        {/* Global Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: "Active Students", value: metrics.totalStudents, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "slate" },
            { label: "Awaiting Action", value: metrics.newRequests, icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", color: "amber", sub: "New" },
            { label: "Completed", value: metrics.completedSessions, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "emerald" },
            { label: "Attendance Gap", value: metrics.noShows, icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "rose" }
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-[#E0BBD1]/30 hover:shadow-lg transition-all duration-500 group">
              <div className={`w-14 h-14 bg-${item.color}-50 rounded-2xl mb-8 flex items-center justify-center text-${item.color}-600 border border-${item.color}-100 transition-transform group-hover:scale-110 duration-500`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{item.value}</h2>
                {item.sub && <span className={`text-[10px] font-black text-${item.color}-600 uppercase tracking-widest px-2 py-0.5 bg-${item.color}-50 rounded-lg`}>{item.sub}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Core Analytics & Activity */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Chart Surface */}
            <div className="bg-white p-10 rounded-[40px] shadow-[0_4px_30px_rgba(0,0,0,0.01)] border border-slate-100">
              <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Session Dynamics</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Institutional session distribution</p>
                </div>
                <div className="flex gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#3B021F]"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-[#E0BBD1]"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                </div>
              </div>
              <div className="h-[360px] w-full">
                <Chart type="bar" data={sessionTypesData} options={chartOptions} className="h-full" />
              </div>
            </div>

            {/* Table Surface */}
            <div className="bg-white rounded-[40px] p-10 shadow-[0_4px_30px_rgba(0,0,0,0.01)] border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 pb-6 border-b border-slate-50 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Real-time Activity</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Live feed of student interactions</p>
                </div>
                <button
                  onClick={() => navigate('/SubmittedFormsManagement')}
                  className="px-8 py-3.5 bg-slate-50 hover:bg-slate-100 text-[#3B021F] rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-100 flex items-center gap-3 group"
                >
                  View Archive 
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
              </div>

              <div className="overflow-x-auto">
                {recentActivity.length === 0 ? (
                  <div className="py-24 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                    <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                       <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="text-slate-400 font-bold text-lg italic">System idle. No recent activity.</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">
                        <th className="pb-8 font-black">Student Case</th>
                        <th className="pb-8 font-black">Context</th>
                        <th className="pb-8 font-black text-center">Protocol Date</th>
                        <th className="pb-8 font-black text-right">Current Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentActivity.map((activity, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-all group">
                          <td className="py-7">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 group-hover:bg-[#3B021F] group-hover:text-white transition-colors">
                                  {activity.studentName?.charAt(0)}
                               </div>
                               <div>
                                  <span className="font-black text-slate-900 block text-sm tracking-tight">{activity.studentName}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activity.studentEmail}</span>
                               </div>
                            </div>
                          </td>
                          <td className="py-7">
                            {activity.isReferral ? (
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2 mb-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  Faculty Referral
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold italic">Source: {activity.referredBy}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Student Request
                              </span>
                            )}
                          </td>
                          <td className="py-7 text-center">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              {activity.submissionDate?.toDate 
                                ? activity.submissionDate.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
                                : activity.submissionDate ? new Date(activity.submissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                            </span>
                          </td>
                          <td className="py-7 text-right">
                            <span className={`inline-block px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border transition-all
                              ${activity.status?.toLowerCase().includes('pending') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                activity.status?.toLowerCase().includes('completed') || activity.status?.toLowerCase().includes('accepted') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  'bg-white text-slate-500 border-slate-200'
                              }
                            `}>
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Strategy & Hub Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Demographics Surface */}
            <div className="bg-white p-10 rounded-[40px] shadow-[0_4px_30px_rgba(0,0,0,0.01)] border border-slate-100">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                <h3 className="text-xl font-bold text-slate-900">Student Cohort</h3>
              </div>
              <div className="h-[300px] w-full flex items-center justify-center relative">
                 <div className="absolute inset-0 flex flex-col items-center justify-center -z-0 opacity-5">
                    <svg className="w-32 h-32 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                 </div>
                <Chart type="doughnut" data={studentsPerCollegeData} options={{ ...chartOptions, cutout: '80%' }} className="h-full z-10" />
              </div>
            </div>

            {/* Management Hub Surface */}
            <div className="bg-[#3B021F] p-10 rounded-[40px] text-white shadow-2xl shadow-[#3B021F]/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-[150px] -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-1000"></div>
              
              <div className="flex items-center gap-4 mb-10 relative z-10">
                 <div className="p-3 bg-white/10 rounded-2xl text-[#E0BBD1] backdrop-blur-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-[0.1em]">Management Hub</h3>
              </div>

              <div className="space-y-6 relative z-10">
                <a href="/SubmittedFormsManagement" className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/link">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#E0BBD1] border border-white/10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <span className="font-black text-white text-xs uppercase tracking-widest block">Submissions</span>
                        <span className="text-[10px] text-white/40 font-bold uppercase mt-1 block">Full Case History</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/20 group-hover/link:text-[#E0BBD1] group-hover/link:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                </a>

                <a href="/Schedule" className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/link">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#E0BBD1] border border-white/10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <span className="font-black text-white text-xs uppercase tracking-widest block">Clinical Calendar</span>
                        <span className="text-[10px] text-white/40 font-bold uppercase mt-1 block">Session Scheduling</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/20 group-hover/link:text-[#E0BBD1] group-hover/link:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                </a>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Institutional Access Level 4</p>
                 <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
