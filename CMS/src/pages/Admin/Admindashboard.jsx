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
        backgroundColor: ['rgba(148, 163, 184, 0.5)'],
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
          backgroundColor: ['rgba(59, 2, 31, 0.8)', 'rgba(224, 187, 209, 0.8)', 'rgba(75, 18, 47, 0.8)'],
          borderRadius: 6,
          borderWidth: 0,
          barPercentage: 0.6
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
            padding: 20,
            font: { family: "'Plus Jakarta Sans', sans-serif" }
          }
        }
      },
      scales: {
        y: {
          display: true,
          grid: { display: true, color: 'rgba(241, 245, 249, 1)' }, // slate-100
          border: { display: false }
        },
        x: {
          display: true,
          grid: { display: false },
          border: { display: false }
        }
      }
    };

    setChartOptions(standardOptions);

    return () => {
      unsubscribeInterviews();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
            <p className="text-slate-500 mt-1">Real-time metrics and platform activity monitoring.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">Live Updates Enabled</span>
          </div>
        </div>

        {/* Global Key Metrics / Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 relative overflow-hidden group hover:border-[#E0BBD1] transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E0BBD1]/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="w-12 h-12 bg-[#f8f9fa] rounded-xl mb-4 flex items-center justify-center text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Active Students</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{metrics.totalStudents}</h2>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 relative overflow-hidden group hover:border-amber-200 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl mb-4 flex items-center justify-center text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Awaiting Attention</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{metrics.newRequests}</h2>
              <span className="text-sm font-medium text-amber-600 mb-1.5 flex items-center gap-1">New requests</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl mb-4 flex items-center justify-center text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Completed Sessions</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{metrics.completedSessions}</h2>
              <span className="text-sm font-medium text-emerald-600 mb-1.5 flex items-center gap-1">All time</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 relative overflow-hidden group hover:border-rose-200 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl mb-4 flex items-center justify-center text-rose-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">No-Shows</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{metrics.noShows}</h2>
              <span className="text-sm font-medium text-rose-500 mb-1.5 flex items-center gap-1">Missed Appts</span>
            </div>
          </div>
        </div>

        {/* Primary Dash Space */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Chart Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Session Breakdown by Type</h3>
                <span className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">All Time</span>
              </div>
              <div className="h-[300px] w-full">
                <Chart type="bar" data={sessionTypesData} options={chartOptions} className="h-full" />
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <h3 className="text-xl font-bold text-slate-900">Recent Platform Activity</h3>
                <a href="/SubmittedFormsManagement" className="text-sm font-semibold text-[#3B021F] hover:text-[#4B122F] transition-colors">
                  View full history &rarr;
                </a>
              </div>

              <div className="overflow-x-auto">
                {recentActivity.length === 0 ? (
                  <p className="py-10 text-center text-slate-500 font-medium">No recent activity found.</p>
                ) : (
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="pb-4 border-b border-slate-100">Student Name</th>
                        <th className="pb-4 border-b border-slate-100">Type / Origin</th>
                        <th className="pb-4 border-b border-slate-100">Submission Date</th>
                        <th className="pb-4 border-b border-slate-100">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentActivity.map((activity, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 font-semibold text-slate-900">{activity.studentName}</td>
                          <td className="py-4 text-slate-500">
                            {activity.isReferral ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Faculty Referral
                                <span className="text-xs text-slate-400">({activity.referredBy})</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Direct Walk-In
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-slate-500">{new Date(activity.submissionDate).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md
                              ${activity.status?.toLowerCase().includes('pending') ? 'bg-amber-100 text-amber-800' :
                                activity.status?.toLowerCase().includes('completed') || activity.status?.toLowerCase().includes('accepted') ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-slate-100 text-slate-800'
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

          {/* Side Column (Pie Chart & Quick Actions) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Demographics</h3>
              </div>
              <div className="h-[250px] w-full flex items-center justify-center">
                <Chart type="doughnut" data={studentsPerCollegeData} options={{ ...chartOptions, cutout: '70%' }} className="h-full" />
              </div>
            </div>

            <div className="bg-[#E0BBD1]/10 p-6 rounded-2xl border border-[#E0BBD1]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B021F]/5 rounded-bl-[100px] -mr-8 -mt-8"></div>
              <h3 className="text-lg font-bold text-[#3B021F] mb-4">Quick Links</h3>
              <div className="space-y-3 relative z-10">
                <a href="/SubmittedFormsManagement" className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-[#3B021F]/30 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#E0BBD1]/30 rounded-lg text-[#3B021F]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-[#3B021F] transition-colors">Manage Submissions</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-[#3B021F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </a>

                <a href="/Schedule" className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-[#3B021F]/30 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#E0BBD1]/30 rounded-lg text-[#3B021F]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-[#3B021F] transition-colors">Master Calendar</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-[#3B021F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </a>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
