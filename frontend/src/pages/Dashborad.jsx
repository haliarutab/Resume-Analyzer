import { useContext, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { Bell, LoaderCircle, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Added this

  const { companyData, companyLoading, backendUrl, companyToken, userToken } = useContext(AppContext);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifcationAll, setNotifactionAll] = useState([]);
 

  const sidebarLinks = [
    {
      id: "manage-jobs",
      name: "Manage Jobs",
      path: "/dashboard/manage-jobs",
      icon: assets.home_icon,
    },
    {
      id: "add-job",
      name: "Add Job",
      path: "/dashboard/add-job",
      icon: assets.add_icon,
    },
    {
      id: "view-applications",
      name: "Apply Applicants",
      path: "/dashboard/view-applications",
      icon: assets.person_tick_icon,
    },
    {
      id: "short-applications",
      name: "ShortListed Applications",
      path: "/dashboard/short-applications",
      icon: assets.person_tick_icon,
    },
  ];

  const fetchNotications = async () => {
    try {
      // console.log("companyToken ", companyToken);
      const { data } = await axios.get(`${backendUrl}/notification/all`, {
        headers: {
          Authorization: `Bearer ${companyToken || userToken}`,
        },
      });

      console.log("==========    ",data);

      if (data.success) {
        setNotifactionAll(data?.notifications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };
  useEffect(() => {
    fetchNotications();
  }, []);

  
  console.log({ notifcationAll });
  const handleClearNotifications = async (id) => {
  try {
    const { data } = await axios.put(
      `${backendUrl}/notification/read/${id}`,
      {}, // no body needed
      {
        headers: { Authorization: `Bearer ${companyToken || userToken}` },
      }
    );

    if (data.success) {
      toast.success(data.message || "All notifications marked as read.");
      setNotifactionAll([]); // clear list or refetch to refresh
      setIsNotifOpen(false); // close popover
    } else {
      toast.error(data.message || "Failed to update notifications.");
    }
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Error updating notifications."
    );
  }
};


  const handleLogout = () => {
    localStorage.removeItem("companyToken");
    toast.success("Logout successfully");
    navigate("/recruiter-login");
  };

  useEffect(() => {
    if (
      location.pathname === "/dashboard" ||
      location.pathname === "/dashboard/"
    ) {
      document.title = "Campus Connect - | Dashboard";
      navigate("/dashboard/manage-jobs");
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between border-b border-gray-200 py-3 bg-white sticky top-0 z-10 px-4">
        <Link
          to="/dashboard"
          className="flex items-center text-blue-500 font-bold"
        >
          Campus Connect
        </Link>
        {companyLoading ? (
          <LoaderCircle className="animate-spin text-gray-500" />
        ) : companyData ? (
          <div className="flex items-center gap-4 md:gap-3">
            {/* 🔔 Notification Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-full bg-white border border-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm hover:shadow transition-all"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {notifcationAll.length > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-[1px] rounded-full min-w-[16px] text-center leading-tight">
      {notifcationAll.filter((n) => !n.read).length}
    </span>
  )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-fadeIn">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Notifications
                    </h3>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <ul className="max-h-60 overflow-y-auto">
                    {notifcationAll.length > 0 ? (
                      notifcationAll.map((notif) => (
                        <li
                          key={notif._id}
                          className="flex items-start gap-3 p-3 text-sm hover:bg-gray-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                        >
                          <img
                            src={
                              notif?.userId?.image || assets.avatarPlaceholder
                            }
                            alt={notif?.userId?.name || "User"}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {notif?.userId?.name}
                            </span>
                            <p className="text-gray-600 text-xs leading-snug">
                              {notif?.message}
                            </p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-sm text-gray-500 text-center">
                        No notifications found.
                      </li>
                    )}
                  </ul>

                  <div className="flex items-center justify-between p-2 border-t border-gray-100">
                    <button
                      onClick={()=>handleClearNotifications("all")}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => navigate("/notifications")}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <p className="text-gray-600 font-bold">Hi, {companyData?.name}</p>
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={companyData?.image}
                alt={`${companyData?.name}'s profile`}
              />
            </div>
            <button
              className="w-[30px] h-[30px] flex items-center justify-center rounded bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={18} className="text-gray-700" />
            </button>
          </div>
        ) : null}
      </header>

      <div className="flex flex-1">
        <aside className="md:w-64 w-16 border-r border-gray-200 bg-white flex flex-col shrink-0">
          <nav className="pt-4 rounded-l-2xl">
            {sidebarLinks.map((item) => (
              <NavLink
                to={item.path}
                key={item.id}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 gap-3 transition-colors rounded-l-md ${
                    isActive
                      ? "border-r-4 md:border-r-[6px] bg-indigo-50 border-indigo-500 text-indigo-600 font-medium"
                      : "text-gray-600"
                  }`
                }
                end={item.path === "/dashboard/manage-jobs"}
              >
                <img
                  src={item.icon}
                  alt={`${item.name} icon`}
                  className="w-5 h-5"
                  aria-hidden="true"
                />
                <span className="md:block hidden">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto pl-4 pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
