import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../../../firebase/authService";

export default function Signup() {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [section, setSection] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError("");
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all core fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const userData = role === "student"
        ? { name, email, course, yearLevel, section, role }
        : { name, email, department, role };

      const result = await signUp(email, password, role, userData);

      if (result.success) {
        navigate("/login");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred during signup.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfafa]">
      {/* Left Side - Brand Display (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#3B021F] text-white p-12 flex-col justify-center relative overflow-hidden">
        {/* Decorative subtle gradient/glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E0BBD1]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 mb-10">
            <img src="src/assets/img/cmslogo.png" alt="University Logo" className="w-12 h-12" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-xl font-bold tracking-tight">University Portal</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Join the<br />Community
          </h1>

          <p className="text-[#E0BBD1] text-lg mb-12 leading-relaxed max-w-md cursor-default">
            Create an account to access premium mental health resources, schedule professional counseling sessions, and track your wellness journey.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <span className="text-sm font-medium">Strictly Confidential Records</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <span className="text-sm font-medium">Licensed Professional Faculty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-lg my-auto">
          {/* Mobile Logo Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src="src/assets/img/cmslogo.png" alt="University Logo" className="w-10 h-10" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-xl font-bold tracking-tight text-[#3B021F]">University Portal</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500">Register as a student or faculty member to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="flex p-1 mb-8 bg-slate-100 rounded-xl border border-slate-200/60">
            {['student', 'faculty'].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${role === r
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {r === 'student' ? '🎓 Student' : '👤 Faculty'}
              </button>
            ))}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Juan Dela Cruz"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@university.edu"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Dynamic Role Fields */}
            {role === "student" ? (
              <>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Course</label>
                  <input
                    type="text"
                    placeholder="e.g. BSCS"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Year</label>
                    <input
                      type="text"
                      placeholder="1st"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Section</label>
                    <input
                      type="text"
                      placeholder="A"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. College of Science"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            )}

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                className={`w-full py-3.5 bg-[#3B021F] text-white rounded-full text-sm font-semibold tracking-wide 
                  shadow-md shadow-[#3B021F]/20 transition-all hover:bg-[#4B122F] hover:shadow-lg hover:-translate-y-0.5
                  ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                onClick={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Register Account"
                )}
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              className="font-semibold text-[#3B021F] hover:text-[#4B122F] transition-colors"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
