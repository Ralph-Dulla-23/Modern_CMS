import React, { createContext, useContext, useState } from "react";
import ProfilePage from "./Profile"; // Ensure the path is correct.

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  return (
    <ProfileContext.Provider value={{ isProfileOpen, openProfile, closeProfile }}>
      {children}
      {isProfileOpen && <ProfilePage onClose={closeProfile} />}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);