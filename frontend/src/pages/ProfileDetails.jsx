import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import moment from "moment";

// --- STATIC FALLBACK DATA ---
const defaultUserInfo = {
  name: "Guest User",
  email: "user@example.com",
  bio: "Full Stack Developer | Building modern web applications.",
  // Added your requested skills here
  skills: ["HTML", "CSS", "JavaScript", "React.js", "Next.js", "Node.js", "MongoDB"],
  resume: "#", 
  image: "https://via.placeholder.com/150" 
};

const ProfileDetails = () => {
  const { backendUrl, userToken } = useContext(AppContext);
  const [userInfo, setUserInfo] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/user/user-applications`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Applications fetch error:", error);
    }
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/user/user-data`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (data.success && data.userData) {
        setUserInfo(data.userData);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, userToken]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserProfileData();
  }, [fetchUserProfile]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;

  // --- MERGE DATA ---
  const displayUser = { ...defaultUserInfo, ...userInfo };

  // Handle skills as either Array or Comma-separated String
  const skillsToDisplay = userInfo?.skills 
    ? (Array.isArray(userInfo.skills) ? userInfo.skills : userInfo.skills.split(","))
    : defaultUserInfo.skills;

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      
      {/* --- PROFILE HEADER --- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          
          <img
            src={displayUser.image}
            alt={displayUser.name}
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-50 shadow-md"
          />

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900">{displayUser.name}</h2>
            <p className="text-blue-600 font-medium mb-3">{displayUser.email}</p>
            <p className="text-gray-500 max-w-xl mb-6">{displayUser.bio}</p>

            {/* --- TOP SKILLS --- */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Top Skills
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {skillsToDisplay.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* --- ACTIONS --- */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <a
                href={displayUser.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                View Resume
              </a>
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- APPLICATIONS --- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Job Applications</h2>
        </div>
        
        {applications.length === 0 ? (
          <div className="p-16 text-center text-gray-400 italic">
            No active applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase">Company</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase">Position</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...applications].reverse().map((app) => (
                  <tr key={app._id} className="hover:bg-blue-50/30 transition-all">
                    <td className="px-8 py-4 font-bold text-gray-800">{app.companyId?.name}</td>
                    <td className="px-8 py-4 text-gray-600 font-medium">{app.jobId?.title}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        app.status === "Shortlisted" ? "bg-green-100 text-green-700" :
                        app.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-400">
                      {moment(app.date).format("MMM DD, YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </section>
  );
};

export default ProfileDetails;