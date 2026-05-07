import React, { useState } from "react";
import { updateUserProfile } from "../../Hooks/updateProfile.js";
import { toast } from "sonner";

export default function ProfilePage({ onClose }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (typeof updateUserProfile === 'function') {
        await updateUserProfile(userData);
        handleClose();
      } else {
        toast.info("Development Note: Profile Update logic requires a functional Firebase mutation hook. Closing modal cleanly.");
        handleClose();
      }
    } catch (error) {
      console.error("Profile update failed and was caught by the component.");
    }

    setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-[60] p-4 animate-in fade-in duration-200"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg flex flex-col sm:flex-row overflow-hidden relative animate-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-full flex items-center justify-center text-slate-500 transition-all z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Mascot / Avatar Side */}
        <div className="w-full sm:w-2/5 flex flex-col justify-center items-center p-8 bg-[#3B021F]/5 border-b sm:border-b-0 sm:border-r border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0BBD1]/20 rounded-bl-[100px] -mr-8 -mt-8"></div>
          <img src="/src/assets/img/cmslogo.png" alt="University Mascot" className="w-32 h-32 mb-4 relative z-10 drop-shadow-lg" onError={(e) => { e.target.style.display = 'none'; }} />
          <h3 className="text-[#3B021F] font-bold text-lg relative z-10">Personal Settings</h3>
          <p className="text-slate-500 text-xs text-center mt-1 relative z-10">Manage your system credentials.</p>
        </div>

        {/* Form Side */}
        <div className="w-full sm:w-3/5 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Update Profile</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Display Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                placeholder="Juan Dela Cruz"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Primary Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                placeholder="name@university.edu"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Change Password</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B021F]/20 focus:border-[#3B021F] transition-all"
                placeholder="Leave blank to keep unchanged"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-[#E0BBD1] hover:bg-[#d5a8c2] text-[#3B021F] font-semibold rounded-full transition-all duration-200 ease-out hover:-translate-y-[1px] text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 bg-[#3B021F] hover:bg-[#4B122F] text-white font-semibold rounded-full transition-all duration-200 ease-out shadow-[0_4px_6px_-1px_rgba(59,2,31,0.2)] hover:shadow-[0_10px_15px_-3px_rgba(59,2,31,0.3)] text-sm hover:-translate-y-[1px]
                  ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isLoading ? 'Saving...' : 'Confirm Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}