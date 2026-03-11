import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../firebase/authService";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setEmail(""); // Always clear the email when switching roles
    setError("");
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      const result = await login(email, password);

      if (result.success) {
        // authService.login() already sets localStorage with the correct DB-verified role.
        // Navigate based on the verified role from the server, NOT the UI tab state.
        if (result.isAdmin) {
          navigate("/Admindashboard");
        } else {
          // Use the actual role from the Firestore document, not the UI tab
          const verifiedRole = result.userData?.role || role;
          if (verifiedRole === "faculty") {
            navigate("/facultydash");
          } else {
            navigate("/dashboard");
          }
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
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
          <div className="flex items-center gap-3 mb-12">
            <img src="src/assets/img/cmslogo.png" alt="University Logo" className="w-12 h-12" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-xl font-bold tracking-tight">University Portal</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Your Wellbeing<br />Matters
          </h1>

          <p className="text-[#E0BBD1] text-lg mb-12 leading-relaxed max-w-md cursor-default">
            A dedicated space for mental health resources, professional support, and community wellness tailored for our university family.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <span className="text-sm font-medium">Secure Access</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-lg my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src="src/assets/img/cmslogo.png" alt="University Logo" className="w-10 h-10" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-xl font-bold tracking-tight text-[#3B021F]">University Portal</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 mb-6">Please enter your credentials to access the portal.</p>

            {/* Demo Accounts Section */}
            <div className="text-left px-5 py-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <p className="text-sm font-bold text-emerald-800 mb-2">Demo Accounts:</p>
              <ul className="text-sm text-emerald-700 space-y-1.5 list-disc list-inside">
                <li><strong>admin@gmail.com</strong> (ADMIN) - 123456</li>
                <li><strong>fred12@gmail.com</strong> (FACULTY) - fred12</li>
                <li><strong>piper@gmail.com</strong> (STUDENT) - piper1</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="flex p-1 mb-8 bg-slate-100 rounded-xl border border-slate-200/60">
            {['student', 'faculty', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${role === r
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@university.edu"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-[#3B021F] hover:text-[#4B122F] transition-colors">Forgot?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="flex items-center ml-1">
              <input
                type="checkbox"
                id="rememberMe"
                className="w-4 h-4 text-[#3B021F] bg-white border-slate-300 rounded focus:ring-[#3B021F] focus:ring-2 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2.5 text-sm text-slate-600 cursor-pointer select-none">
                Keep me logged in
              </label>
            </div>

            <div className="mt-4">
              <button
                className={`w-full py-3.5 bg-[#3B021F] text-white rounded-full text-sm font-semibold tracking-wide 
                  shadow-md shadow-[#3B021F]/20 transition-all hover:bg-[#4B122F] hover:shadow-lg hover:-translate-y-0.5
                  ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Access Portal"
                )}
              </button>
            </div>
          </div>

          {/* Create Account Link */}
          {role !== "admin" && (
            <p className="mt-8 text-center text-sm text-slate-500">
              Need an account?{" "}
              <button
                className="font-semibold text-[#3B021F] hover:text-[#4B122F] transition-colors"
                onClick={() => navigate("/signup")}
              >
                Contact Admissions
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}