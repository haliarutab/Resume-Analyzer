import {
  Bell,
  Briefcase,
  ChevronDown,
  LoaderCircle,
  LogOut,
  Menu,
  Upload,
  UserRound,
  X,
  GraduationCap,
} from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { isLogin, userData, userDataLoading, setIsLogin } =
    useContext(AppContext);
  const location = useLocation();

  const navigate = useNavigate();

  const menu = [
    { name: "Home", path: "/" },
    { name: "All Jobs", path: "/all-jobs/all" },
    { name: "About", path: "/about" },
    { name: "Terms", path: "/terms" },
  ];

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[aria-label="Toggle menu"]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    toast.success("Logout successfully");
    navigate("/candidate-login");
    setIsLogin(false);
  };
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="border-b border-gray-200 mb-10 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-50">
      {/* Wrapper ensures spacing across all screen sizes */}
      <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 md:px-10">
        <nav className="flex items-center justify-between h-20">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-blue-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CampusConnect
              </span>
              <span className="text-[10px] text-gray-500 font-medium -mt-1">
                Your Career Gateway
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-6">
            {/* Navigation Menu */}
            <ul className="hidden lg:flex items-center gap-6">
              {menu.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                        ? "text-blue-600 bg-blue-100 shadow-sm"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Desktop Buttons */}
            {userDataLoading ? (
              <LoaderCircle className="animate-spin text-blue-600 hidden lg:block" />
            ) : isLogin ? (
              <div
                className="hidden lg:flex items-center gap-4 relative"
                ref={profileMenuRef}
              >
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 focus:outline-none bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all"
                  aria-expanded={isProfileMenuOpen}
                >
                  <span className="text-sm font-medium text-gray-700">
                    Hi, {userData?.name || "User"}
                  </span>
                  <img
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-100"
                    src={userData?.image || assets.avatarPlaceholder}
                    alt="User profile"
                    onError={(e) => {
                      e.currentTarget.src = assets.avatarPlaceholder;
                    }}
                  />
                  <ChevronDown
                    size={16}
                    className={`transition-transform text-blue-500 ${isProfileMenuOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-56 origin-top-right rounded-md border border-gray-200 bg-white z-50 overflow-hidden">
                    <div>
                         <Link
      to="/applications"
      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
    >
      <Briefcase size={16} />
      Applications
    </Link>
                      <Link
                        to="/applied-applications"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                      >
                        <Briefcase size={16} />
                        My profile
                      </Link>

                      <button
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4">
                <Link
                  to="/recruiter-login"
                  className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-all shadow-sm border border-blue-100 hover:shadow"
                >
                  Recruiter Login
                </Link>
                <Link
                  to="/candidate-login"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
                >
                  Candidate Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        ref={mobileMenuRef}
      >
        <div
          className="fixed inset-0 backdrop-blur-sm bg-blue-900/20"
          onClick={toggleMenu}
        />
        <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-white border-r border-r-gray-200 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Link
              to="/"
              onClick={toggleMenu}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              CampusConnect
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full text-blue-600 hover:bg-white/80 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menu.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={toggleMenu}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-md text-sm font-medium ${isActive
                        ? "bg-blue-100 text-blue-600 shadow-sm"
                        : "text-gray-700 hover:bg-blue-50"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {userDataLoading ? (
              <LoaderCircle className="animate-spin text-gray-600 hidden lg:block" />
            ) : isLogin ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={userData?.image || assets.avatarPlaceholder}
                    alt="User profile"
                    onError={(e) => {
                      e.currentTarget.src = assets.avatarPlaceholder;
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{userData?.email}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/applied-jobs"
                      onClick={toggleMenu}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Briefcase size={16} />
                      Applied Jobs
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <Link
                  to="/recruiter-login"
                  onClick={toggleMenu}
                  className="block w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 text-center"
                >
                  Recruiter Login
                </Link>
                <Link
                  to="/candidate-login"
                  onClick={toggleMenu}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 text-center cursor-pointer"
                >
                  Candidate Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

  );
};

export default Navbar;