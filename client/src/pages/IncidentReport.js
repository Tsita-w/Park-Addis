import React, { useState } from "react";
import { AlertTriangle, Send, ChevronLeft, CheckCircle } from "lucide-react"; // Added CheckCircle

const IncidentReport = ({ onBack }) => {
  const [formData, setFormData] = useState({
    type: "Damage",
    plateNumber: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // New state for animation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/incidents/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true); // Trigger animation
        // Wait 2 seconds so they see the success, then go back
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    } catch (err) {
      alert("Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  // --- Success Animation View ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
          <div className="bg-green-100 p-6 rounded-full text-green-600 mb-6 animate-bounce">
            <CheckCircle size={60} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Report Sent!</h2>
          <p className="text-gray-400 font-medium">Management has been notified.</p>
        </div>
      </div>
    );
  }

  // --- Standard Form View ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-6 font-bold hover:text-gray-800 transition-colors">
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-3 rounded-2xl text-red-600">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Report Incident</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Issue Type</label>
            <select
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-500 transition-all cursor-pointer"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option>Damage</option>
              <option>Security</option>
              <option>Illegal Parking</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Plate Number (Optional)</label>
            <input
              type="text"
              placeholder="AA 2 B12345"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-mono uppercase focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, plateNumber: e.target.value.toUpperCase()})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</label>
            <textarea
              rows="4"
              placeholder="Provide details about what happened..."
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-500 transition-all"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
          >
            {loading ? (
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <><Send size={20} /> SUBMIT REPORT</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentReport;