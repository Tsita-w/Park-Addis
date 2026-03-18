import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Save auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);

        toast.success(`Welcome back, ${data.user.name}!`);

        // Redirect based on role
        if (data.user.role === "attendant") {
          navigate("/attendant");
        } else if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/find-parking");
        }
        window.location.reload(); // Refresh to update App.js isAuthenticated state
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Welcome <span className="text-blue-600">Back.</span></h1>
          <p className="text-gray-400 font-bold">Sign in to manage your parking.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
              <input
                type="email" required
                className="w-full pl-12 p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                placeholder="name@email.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-300" size={20} />
              <input
                type="password" required
                className="w-full pl-12 p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 group hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
            SIGN IN <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-12 p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
          <p className="text-yellow-800 text-sm font-bold text-center">
            New to Park-Addis? <Link to="/signup" className="underline ml-1">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;