import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Car, Shield, Key } from "lucide-react";
import toast from "react-hot-toast";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "driver", // Default role
  });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        // 1. Save the token and role
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);

        toast.success(`Welcome to Park-Addis, ${data.user.name}!`);

        // 2. Direct Navigation (No more login page)
        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "attendant") {
          navigate("/attendant");
        } else {
          navigate("/find-parking");
        }

        // 3. Force refresh so App.js recognizes the new token
        window.location.reload();
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (err) {
      toast.error("Server connection lost");
    }
  };

  return (
    // Changed p-6 to p-4 on mobile, p-6 on larger screens
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      {/* Changed p-8 to p-6 on mobile, reduced border-radius slightly for small screens */}
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] shadow-2xl border border-gray-100">
        <div className="text-center mb-6 sm:mb-8">
          {/* Changed text-3xl to 2xl on mobile */}
          <h1 className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tighter">
            PARK-ADDIS
          </h1>
          <p className="text-gray-400 font-bold text-xs sm:text-sm uppercase mt-2">
            Join the future of parking
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              required
              // Added text-sm for mobile, text-base for desktop
              className="w-full pl-12 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm sm:text-base"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full pl-12 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm sm:text-base"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full pl-12 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm sm:text-base"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          {/* Role Selection: Shrunk gaps and padding slightly for tiny phone screens */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-6">
            {/* DRIVER BUTTON */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "driver" })}
              className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${formData.role === "driver" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400"}`}
            >
              <Car size={20} />{" "}
              <span className="font-black text-[8px] sm:text-[9px]">DRIVER</span>
            </button>

            {/* ATTENDANT BUTTON */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "attendant" })}
              className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${formData.role === "attendant" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400"}`}
            >
              <Shield size={20} />{" "}
              <span className="font-black text-[8px] sm:text-[9px]">STAFF</span>
            </button>

            {/* ADMIN BUTTON */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "admin" })}
              className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${formData.role === "admin" ? "border-yellow-500 bg-yellow-50 text-yellow-600" : "border-gray-100 text-gray-400"}`}
            >
              <Key size={20} />{" "}
              <span className="font-black text-[8px] sm:text-[9px]">ADMIN</span>
            </button>
          </div>

          {/* Shrunk the button text slightly on mobile so it stays on one line */}
          <button className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-2xl font-black text-base sm:text-lg mt-6 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
            CREATE ACCOUNT
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400 font-bold text-xs sm:text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;