import React, { useState, useEffect } from 'react';
import AdminNavbar from '../ui/adminnavbar';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { db } from '../../firebase/firebase-config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { toast } from 'sonner';

function Reports() {
  const [studentsPerCollegeData, setStudentsPerCollegeData] = useState({});
  const [sessionTypesData, setSessionTypesData] = useState({});
  const [counselingSessionsData, setCounselingSessionsData] = useState({});
  const [yearPerCollegesData, setYearPerCollegesData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');

  const [summaryStats, setSummaryStats] = useState({
    totalSessions: 0,
    avgSessionsPerDay: 0,
    mostActiveCollege: 'N/A',
    leastActiveCollege: 'N/A',
    mostCommonReasons: 'N/A'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [rawSessions, setRawSessions] = useState([]);

  // Brand Palette defined in design_system_and_guidelines.md
  const brandColors = [
    'rgba(59, 2, 31, 0.85)',    // Maroon #3B021F
    'rgba(224, 187, 209, 0.85)', // Mauve #E0BBD1
    'rgba(75, 18, 47, 0.85)',    // Darker Maroon #4B122F
    'rgba(148, 163, 184, 0.85)', // Slate
    'rgba(100, 116, 139, 0.85)'  // Darker Slate
  ];

  useEffect(() => {
    // 1. Listen to Students for College & Year Metrics
    const unsubscribeStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      const collegeCounts = {};
      const yearCounts = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0, 'Other': 0 };

      snapshot.forEach(doc => {
        const data = doc.data();

        // Filter by college if selected
        if (selectedCollege !== 'all') {
          // Very basic filtering based on dropdown value matching course substring
          if (!data.course?.toLowerCase().includes(selectedCollege.toLowerCase())) return;
        }

        const course = data.course || "Unknown";
        collegeCounts[course] = (collegeCounts[course] || 0) + 1;

        // Try to parse year
        const cy = data.courseYearSection || "";
        if (cy.includes("1")) yearCounts['1st Year']++;
        else if (cy.includes("2")) yearCounts['2nd Year']++;
        else if (cy.includes("3")) yearCounts['3rd Year']++;
        else if (cy.includes("4") || cy.includes("5")) yearCounts['4th Year']++;
        else yearCounts['Other']++;
      });

      // Pie Chart
      const pieLabels = Object.keys(collegeCounts);
      const pieData = Object.values(collegeCounts);

      setStudentsPerCollegeData({
        labels: pieLabels.length > 0 ? pieLabels : ['No Data'],
        datasets: [{
          data: pieData.length > 0 ? pieData : [1],
          backgroundColor: pieLabels.map((_, i) => brandColors[i % brandColors.length]),
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 4
        }],
      });

      // Bar Chart - Years
      const yearLabels = Object.keys(yearCounts).filter(k => yearCounts[k] > 0);
      const yearData = yearLabels.map(k => yearCounts[k]);

      setYearPerCollegesData({
        labels: yearLabels.length > 0 ? yearLabels : ['No Data'],
        datasets: [{
          label: 'Students by Year Level',
          data: yearData.length > 0 ? yearData : [0],
          backgroundColor: 'rgba(224, 187, 209, 0.8)', // Mauve
          borderRadius: 6,
          borderWidth: 0,
          barPercentage: 0.6
        }],
      });

      // Calc summary stats (Colleges)
      if (pieLabels.length > 0) {
        const sortedColleges = Object.entries(collegeCounts).sort((a, b) => b[1] - a[1]);
        setSummaryStats(prev => ({
          ...prev,
          mostActiveCollege: sortedColleges[0][0],
          leastActiveCollege: sortedColleges[sortedColleges.length - 1][0]
        }));
      }
    });

    // 2. Listen to Interviews for Types & Trends
    let q = query(collection(db, "studentInterviews"), orderBy("submissionDate", "asc"));

    // Simplistic date filtering
    if (selectedMonth !== 'all') {
      const now = new Date();
      let startDate = new Date();

      if (selectedMonth === 'thisMonth') {
        startDate.setDate(1); // 1st of current month
      } else if (selectedMonth === 'lastMonth') {
        startDate.setMonth(now.getMonth() - 1);
        startDate.setDate(1);
      } else if (selectedMonth === 'past3Months') {
        startDate.setMonth(now.getMonth() - 3);
      }

      q = query(collection(db, "studentInterviews"), where("submissionDate", ">=", startDate.toISOString()), orderBy("submissionDate", "asc"));
    }

    const unsubscribeInterviews = onSnapshot(q, (snapshot) => {
      const sessionTypes = { 'Walk-in': 0, 'Referral': 0, 'Online': 0 };
      const dateCounts = {};
      const concernFreq = {};
      let totalSessions = 0;
      const sessionsForExport = [];

      snapshot.forEach(docSnap => {
        const docId = docSnap.id;
        totalSessions++;
        const data = docSnap.data();

        // Collect raw data for CSV export
        sessionsForExport.push({
          id: docId,
          studentName: data.studentName || '',
          courseYearSection: data.courseYearSection || '',
          status: data.status || '',
          type: data.isReferral ? 'Referral' : (data.type || 'Walk-in'),
          submissionDate: data.submissionDate || '',
          email: data.email || '',
          referredBy: data.referredBy || ''
        });

        // Types
        if (data.isReferral) sessionTypes['Referral']++;
        else if (data.type?.toLowerCase().includes("online")) sessionTypes['Online']++;
        else sessionTypes['Walk-in']++;

        // Trend over time (group by YYYY-MM-DD)
        if (data.submissionDate) {
          const dateStr = data.submissionDate.split('T')[0];
          dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        }

        // Tally concerns to find the most common ones
        const ac = data.areasOfConcern || {};
        ['personal', 'interpersonal', 'academic', 'family'].forEach(cat => {
          if (ac[cat] && Array.isArray(ac[cat])) {
            ac[cat].forEach(c => concernFreq[c] = (concernFreq[c] || 0) + 1);
          }
        });
      });

      // Session Types Bar Chart
      setSessionTypesData({
        labels: Object.keys(sessionTypes),
        datasets: [{
          label: 'Session Types',
          data: Object.values(sessionTypes),
          backgroundColor: ['rgba(59, 2, 31, 0.8)', 'rgba(224, 187, 209, 0.8)', 'rgba(75, 18, 47, 0.8)'],
          borderRadius: 6,
          borderWidth: 0,
          barPercentage: 0.6
        }],
      });

      // Line Chart for Trends
      const trendLabels = Object.keys(dateCounts).sort();
      const trendData = trendLabels.map(l => dateCounts[l]);

      setCounselingSessionsData({
        labels: trendLabels.length > 0 ? trendLabels : ['No Data'],
        datasets: [{
          label: 'New Intake Submissions',
          data: trendData.length > 0 ? trendData : [0],
          fill: true,
          backgroundColor: 'rgba(59, 2, 31, 0.05)',
          borderColor: '#3B021F',
          tension: 0.4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#3B021F',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }],
      });

      // Calculate Summary Stats
      let mostCommon = 'N/A';
      if (Object.keys(concernFreq).length > 0) {
        const sortedConcerns = Object.entries(concernFreq).sort((a, b) => b[1] - a[1]);
        // Clean up camelCase strings roughly for display
        mostCommon = sortedConcerns[0][0].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      }

      const uniqueDays = Object.keys(dateCounts).length;
      const avg = uniqueDays > 0 ? (totalSessions / uniqueDays).toFixed(1) : 0;

      setSummaryStats(prev => ({
        ...prev,
        totalSessions,
        avgSessionsPerDay: avg,
        mostCommonReasons: mostCommon
      }));

      setRawSessions(sessionsForExport);
      setIsLoading(false);
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
          grid: { display: true, color: 'rgba(241, 245, 249, 1)' },
          border: { display: false },
          beginAtZero: true
        },
        x: {
          display: true,
          grid: { display: false },
          border: { display: false }
        }
      }
    };

    // Override pie chart options
    const pieOptions = { ...standardOptions };
    pieOptions.scales = { x: { display: false }, y: { display: false } };

    setChartOptions({ bar: standardOptions, pie: pieOptions });

    return () => {
      unsubscribeStudents();
      unsubscribeInterviews();
    };
  }, [selectedMonth, selectedCollege]);

  const monthOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Past 3 Months', value: 'past3Months' },
  ];

  const collegeOptions = [
    { label: 'All Colleges', value: 'all' },
    { label: 'Engineering', value: 'engineering' },
    { label: 'Computer Studies', value: 'computer' },
    { label: 'Business', value: 'business' },
    { label: 'Arts & Humanities', value: 'arts' }
  ];

  const exportCSV = () => {
    if (rawSessions.length === 0) {
      toast.info('No data to export.');
      return;
    }

    const headers = ['Student Name', 'Course/Year/Section', 'Status', 'Type', 'Submission Date', 'Email', 'Referred By'];
    const rows = rawSessions.map(s => [
      `"${(s.studentName || '').replace(/"/g, '""')}"`,
      `"${(s.courseYearSection || '').replace(/"/g, '""')}"`,
      `"${s.status}"`,
      `"${s.type}"`,
      `"${s.submissionDate ? new Date(s.submissionDate).toLocaleDateString() : ''}"`,
      `"${s.email}"`,
      `"${(s.referredBy || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cms_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fcfafa] flex flex-col">
      <AdminNavbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-10 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Reports & Analytics</h1>
            <p className="text-slate-500 mt-1">Visualize student demographics, session trends, and active caseloads.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white rounded-full border border-slate-200 px-4 py-1.5 shadow-sm text-sm font-semibold flex items-center gap-2">
              <span className="text-slate-500">Timeline:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-[#3B021F] font-bold p-0 cursor-pointer outline-none"
              >
                {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-full border border-slate-200 px-4 py-1.5 shadow-sm text-sm font-semibold flex items-center gap-2">
              <span className="text-slate-500">College:</span>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-[#3B021F] font-bold p-0 cursor-pointer outline-none"
              >
                {collegeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <button
              onClick={exportCSV}
              className="px-5 py-2 bg-[#E0BBD1] text-[#3B021F] hover:bg-[#d5a8c2] rounded-full font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Loading State Overlay */}
        {isLoading && (
          <div className="w-full h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-100/80 mb-8 shadow-sm">
            <svg className="animate-spin h-8 w-8 text-[#3B021F]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Submissions</p>
                <h2 className="text-3xl font-extrabold text-[#3B021F]">{summaryStats.totalSessions}</h2>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Daily Avg</p>
                <h2 className="text-3xl font-extrabold text-slate-900">{summaryStats.avgSessionsPerDay}</h2>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Most Active</p>
                <h2 className="text-xl font-bold text-slate-900 truncate" title={summaryStats.mostActiveCollege}>{summaryStats.mostActiveCollege}</h2>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Least Active</p>
                <h2 className="text-xl font-bold text-slate-900 truncate" title={summaryStats.leastActiveCollege}>{summaryStats.leastActiveCollege}</h2>
              </div>
              <div className="bg-[#3B021F] p-5 rounded-2xl shadow-sm border border-[#3B021F] col-span-2 md:col-span-1">
                <p className="text-xs font-bold text-[#E0BBD1] uppercase tracking-wider mb-1">Primary Concern</p>
                <h2 className="text-lg font-bold text-white leading-tight capitalize">{summaryStats.mostCommonReasons}</h2>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Line Chart (Full width on top) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 lg:col-span-3">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Intake Submissions Over Time</h3>
                </div>
                <div className="h-[250px] w-full">
                  {chartOptions.bar && <Chart type="line" data={counselingSessionsData} options={chartOptions.bar} style={{ width: '100%', height: '100%' }} />}
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Demographics by College</h3>
                </div>
                <div className="h-[250px] w-full flex items-center justify-center">
                  {chartOptions.pie && <Chart type="doughnut" data={studentsPerCollegeData} options={{ ...chartOptions.pie, cutout: '65%' }} style={{ width: '100%', height: '100%' }} />}
                </div>
              </div>

              {/* Bar Chart - Years */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Demographics by Year Level</h3>
                </div>
                <div className="h-[250px] w-full">
                  {chartOptions.bar && <Chart type="bar" data={yearPerCollegesData} options={chartOptions.bar} style={{ width: '100%', height: '100%' }} />}
                </div>
              </div>

              {/* Bar Chart - Types */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Session Types Breakdown</h3>
                </div>
                <div className="h-[250px] w-full">
                  {chartOptions.bar && <Chart type="bar" data={sessionTypesData} options={{ ...chartOptions.bar, indexAxis: 'y' }} style={{ width: '100%', height: '100%' }} />}
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;
