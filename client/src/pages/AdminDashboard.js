import React, { useEffect, useState } from "react";
import {
  DollarSign,
  //LayoutDashboard,
  Car,
  Users,
  Calendar,
  RefreshCw,
  Search,
  Trash2,
  //Settings,
  //LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

// Assuming you have these UI components in your project
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";

// --- HELPER COMPONENT: OCCUPANCY MONITOR ---
// This component sits at the top to give a bird's-eye view of the lot
const OccupancyGrid = ({ slotsData, onReset }) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Car className="text-blue-500" /> Live Occupancy Monitor
        </h2>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>{" "}
            Available
          </div>
          <div className="flex items-center gap-1 text-red-600 font-medium">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span> Occupied
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
        {slotsData.map((slot) => (
          <div
            key={slot._id}
            className={`relative group p-4 rounded-xl border-2 transition-all cursor-pointer
              ${
                slot.isAvailable
                  ? "border-green-100 bg-green-50 hover:bg-green-100"
                  : "border-red-100 bg-red-50 hover:bg-red-100"
              }`}
            onClick={() => !slot.isAvailable && onReset(slot._id)}
          >
            <div className="text-center">
              <span
                className={`text-xs font-bold ${slot.isAvailable ? "text-green-600" : "text-red-600"}`}
              >
                {slot.label}
              </span>
              <Car
                size={20}
                className={`mx-auto mt-2 ${slot.isAvailable ? "text-green-200" : "text-red-500"}`}
              />
            </div>
            {!slot.isAvailable && (
              <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-[10px] py-1 px-2 rounded -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                Force Release
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    occupiedSlots: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [revenueData, setRevenueData] = useState([]); // For the chart/stats
  const [selectedPeriod, setSelectedPeriod] = useState("7d"); // Filter by time

  // Fetch all data from your Node.js API
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(
        "http://localhost:5000/api/bookings/admin/stats",
      );
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Bookings
      const listRes = await fetch(
        "http://localhost:5000/api/bookings/admin/list",
      );
      const listData = await listRes.json();
      setBookings(Array.isArray(listData) ? listData : []);

      // 3. Fetch Slots
      const slotsRes = await fetch("http://localhost:5000/api/slots");
      const slotsData = await slotsRes.json();
      setAllSlots(slotsData);

      // --- ADD THIS NEW PART FOR USERS ---
      const userRes = await fetch("http://localhost:5000/api/users");
      const userData = await userRes.json();
      setUsers(Array.isArray(userData) ? userData : []);

      const analyticsRes = await fetch(
        `http://localhost:5000/api/bookings/admin/analytics?period=${selectedPeriod}`,
      );
      const analyticsData = await analyticsRes.json();
      setRevenueData(Array.isArray(analyticsData) ? analyticsData : []);
      // -----------------------------------
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Real-time effect: auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResetSlot = async (slotId) => {
    if (window.confirm("Make this slot available again?")) {
      try {
        await fetch(
          `http://localhost:5000/api/bookings/admin/slots/${slotId}/reset`,
          { method: "PATCH" },
        );
        fetchData();
      } catch (err) {
        alert("Failed to reset slot");
      }
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm("Delete this transaction?")) {
      try {
        await fetch(`http://localhost:5000/api/bookings/admin/bookings/${id}`, {
          method: "DELETE",
        });
        fetchData();
      } catch (err) {
        alert("Failed to delete booking");
      }
    }
  };

  // Filter based on Search Input
  const filteredBookings = Array.isArray(bookings)
    ? bookings.filter(
        (b) =>
          b.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Park-Addis Command Center
          </h1>
          <p className="text-gray-500 text-sm">Real-time parking management</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all w-full sm:w-auto justify-center active:scale-95"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span className="font-medium text-gray-700">Refresh Data</span>
        </button>
      </div>

      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`${stats.totalRevenue} ETB`}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          title="Total Bookings"
          value={stats.totalBookings}
          color="bg-blue-500"
        />
        <StatCard
          icon={Car}
          title="Occupied Slots"
          value={stats.occupiedSlots}
          color="bg-yellow-500"
        />
        <StatCard
          icon={Users}
          title="Active Users"
          value="12"
          color="bg-purple-500"
        />
      </div>

      {/* 2. Live Occupancy Grid (Passing allSlots to slotsData) */}
      <OccupancyGrid slotsData={allSlots} onReset={handleResetSlot} />

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign className="text-green-500" /> Pricing Strategy
        </h2>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-blue-50 rounded-xl gap-4">
          <div>
            <p className="font-bold text-blue-800">Dynamic Pricing is ACTIVE</p>
            <p className="text-sm text-blue-600">
              Prices are currently increased by 1.5x due to Rush Hour.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm border border-blue-200 whitespace-nowrap">
              Adjust Base Rate
            </button>
            <button className="flex-1 lg:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 whitespace-nowrap">
              Disable Dynamic
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="text-blue-500" /> Recent Reservations
          </h2>
          <Badge className="bg-blue-50 text-blue-700 w-fit">Live Updates</Badge>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-4 md:px-6 py-4">User ID / Plate</th>
                <th className="px-4 md:px-6 py-4">Slot</th>
                <th className="px-4 md:px-6 py-4">Price</th>
                <th className="px-4 md:px-6 py-4">Status</th>
                <th className="px-4 md:px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* You would map your backend reservations here */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 md:px-6 py-4 font-medium">#65f1...e6f7</td>
                <td className="px-4 md:px-6 py-4">
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-sm font-bold">
                    A-12
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 font-bold">75 ETB</td>
                <td className="px-4 md:px-6 py-4">
                  <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                    <CheckCircle2 size={14} /> Paid
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <button className="text-slate-400 hover:text-red-500 transition-colors">
                    Cancel
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Search and Filtering */}
      <div className="mt-12 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by User or Transaction ID..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredBookings.length} results
        </div>
      </div>

      {/* 6. Revenue Reports & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
        {/* Revenue Chart Placeholder / Summary */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-green-500" /> Revenue Growth
            </h2>
            <select
              className="text-sm border-gray-200 rounded-lg bg-gray-50 p-2 outline-none w-full sm:w-auto"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Simple Bar Representation of Revenue */}
          <div className="flex items-end gap-1 md:gap-2 h-48 border-b border-l border-gray-100 pb-2 pl-2 overflow-x-auto">
            {revenueData.length > 0 ? (
              revenueData.map((data, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center group relative min-w-[30px]"
                >
                  <div
                    className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all cursor-pointer"
                    style={{
                      height: `${(data.amount / 500) * 100}%`,
                      minHeight: "10%",
                    }}
                  ></div>
                  <span className="text-[10px] text-gray-400 mt-2 rotate-45 md:rotate-0 text-center">
                    {data.day}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-[10px] p-2 rounded -top-10 z-20 whitespace-nowrap">
                    {data.amount} ETB
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 italic">
                No data for selected period
              </div>
            )}
          </div>
        </div>

        {/* Analytics Sidebar: Insights */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Search className="text-blue-500" /> Key Insights
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">
                  Peak Booking Time
                </p>
                <p className="text-lg font-bold text-gray-800">
                  10:00 AM - 2:00 PM
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-lg shrink-0">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">
                  Avg. Ticket Value
                </p>
                <p className="text-lg font-bold text-gray-800">85.50 ETB</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                <Users className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">
                  Loyalty Rate
                </p>
                <p className="text-lg font-bold text-gray-800">
                  24% Repeat Users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-semibold tracking-wider">
                <th className="px-4 md:px-6 py-4">User</th>
                <th className="px-4 md:px-6 py-4">Transaction ID</th>
                <th className="px-4 md:px-6 py-4">Slot</th>
                <th className="px-4 md:px-6 py-4">Status</th>
                <th className="px-4 md:px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {b.userId?.name || "Guest User"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {b.userId?.email || ""}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 font-mono text-xs text-gray-500">
                      {b.transactionId || "---"}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-mono text-xs uppercase">
                        {b.slotId?.label || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-tight whitespace-nowrap ${
                          b.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteBooking(b._id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 md:px-6 py-12 text-center text-gray-400 italic"
                  >
                    No transactions found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. User Management Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 overflow-hidden mb-12">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-purple-500" /> User Directory
          </h2>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
            {users.length} Total Users
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-semibold">
                <th className="px-4 md:px-6 py-4">Full Name</th>
                <th className="px-4 md:px-6 py-4">Contact Info</th>
                <th className="px-4 md:px-6 py-4">Role</th>
                <th className="px-4 md:px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-gray-800">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-[150px] md:max-w-none">
                        {user.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.phone || "No phone"}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        onClick={() => alert("Delete user logic goes here")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 md:px-6 py-8 text-center text-gray-400 italic"
                  >
                    No registered users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;