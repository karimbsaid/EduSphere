/* eslint-disable react/prop-types */

import { use, useEffect, useRef, useState } from "react";
import Tab from "../ui/Tab";
import EditProfileModal from "../features/profile/EditProfileModal";
import SettingsTab from "../features/profile/SettingsTab";
import PersonalInfoTab from "../features/profile/PersonalInfoTab";
import { getMyprofile, updateProfile } from "../services/apiProfile";
import { useAuth } from "../context/authContext";
import { getEnrolledCoursesStats } from "../services/apiEnrollment";

export default function Profile() {
  const { user } = useAuth();

  const token = user?.token;
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    bio: "",
    completedCourses: 0,
    inProgressCourses: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { user } = await getMyprofile(token);
      const { data } = await getEnrolledCoursesStats(token);
      console.log(data);
      const { additionalDetails } = user;
      setProfile({
        name: user.name,
        email: user.email,
        phone: additionalDetails.contactNumber,
        bio: additionalDetails.bio,
        completedCourses: data.completedCourses,
        inProgressCourses: data.inProgressCourses,
        avatar: additionalDetails.photo.includes("res.cloudinary.com")
          ? additionalDetails.photo
          : import.meta.env.VITE_API_BASE + additionalDetails.photo,
      });
    };
    fetchUserData();
  }, [token]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await updateProfile(profile, token);
    setIsDialogOpen(false);
  };
  const tabData = [
    { id: 1, tabName: "Informations", type: "personal" },
    { id: 2, tabName: "mes cours", type: "courses" },
    { id: 3, tabName: "Paramètres", type: "settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
            <p className="text-gray-500">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>

          <div className="w-full">
            <Tab
              tabData={tabData}
              setField={(type) => setActiveTab(type)}
              field={activeTab}
            />

            {activeTab === "personal" && (
              <PersonalInfoTab
                profile={profile}
                onEditClick={() => setIsDialogOpen(true)}
              />
            )}

            {/* {activeTab === "courses" && <CoursesTab />} */}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </main>

      <EditProfileModal
        isOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        formData={profile}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
