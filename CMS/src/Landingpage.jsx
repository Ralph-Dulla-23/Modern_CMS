import React from "react";
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/SignUp');
  };

  const handleLoginUpClick = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#fcfafa] overflow-hidden font-sans">

      {/* Background Mesh Gradient (Mimicking the reference design) */}
      <div className="absolute top-[-10%] right-[-5%] w-[70vw] h-[70vw] rounded-full bg-[#fad0c4] mix-blend-multiply blur-[120px] opacity-70 pointer-events-none"></div>
      <div className="absolute top-[10%] right-[15%] w-[50vw] h-[50vw] rounded-full bg-[#ff9a9e] mix-blend-multiply blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[0%] right-[-10%] w-[60vw] h-[70vw] rounded-full bg-[#E0BBD1] mix-blend-multiply blur-[140px] opacity-80 pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="src/assets/img/cmslogo.png"
            alt="CMS Logo"
            className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-sm"
          />
          <span className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">CMS</span>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={handleLoginUpClick}
            className="text-slate-600 font-semibold hover:text-[#3B021F] transition-colors"
          >
            Login
          </button>
          <button
            onClick={handleSignUpClick}
            className="bg-white text-slate-800 px-5 py-2.5 md:px-7 md:py-3 rounded-full font-bold shadow-sm hover:shadow-md border border-slate-100 transition-all hover:-translate-y-0.5"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content Hero */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-20 md:pt-32 lg:pt-40 pb-24 flex flex-col lg:flex-row items-center justify-between gap-16">

        {/* Left Column Component */}
        <div className="w-full lg:w-[55%] flex flex-col items-start text-left z-20">



          <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-bold text-slate-900 leading-[1.05] mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Empowering You <br className="hidden md:block" /> on Your Mental Wellness Journey
          </h1>

          <p className="text-lg md:text-xl text-slate-700/80 leading-relaxed max-w-2xl mb-12 font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            CMS provides a secure and supportive platform for counselors and users to connect, track progress, and achieve lasting well-being. Schedule appointments, and communicate confidently, all in one place.
          </p>

          <div className="flex flex-wrap items-center gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <button
              onClick={handleSignUpClick}
              className="bg-[#111] hover:bg-black text-white px-8 py-4 md:px-10 md:py-4.5 rounded-full font-bold shadow-xl transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Right Content / Image Area */}
        <div className="w-full lg:w-[45%] relative mt-12 lg:mt-0 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-10 lg:gap-14 animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <img
            src="./src/assets/img/Guidancelogo.png"
            alt="Guidance Logo"
            className="w-40 md:w-56 lg:w-64 object-contain drop-shadow-md transition-transform duration-700 hover:scale-105"
          />
          <div className="hidden sm:block w-px h-32 bg-slate-300/40"></div>
          <div className="sm:hidden w-32 h-px bg-slate-300/40"></div>
          <img
            src="./src/assets/img/cmslogo.png"
            alt="CMS Logo"
            className="w-40 md:w-56 lg:w-64 object-contain drop-shadow-md transition-transform duration-700 hover:scale-105"
          />
        </div>

      </main>
    </div>
  );
}

export default App;
