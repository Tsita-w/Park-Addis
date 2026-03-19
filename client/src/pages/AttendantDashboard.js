import React, { useState, useEffect } from "react";
import {
  QrCode,
  Car,
  LogOut,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import IncidentReport from "./IncidentReport";

const AttendantDashboard = () => {
  const [plateNumber, setPlateNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [reservations, setReservations] = useState([]);

  // Payment states
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed', 'timeout'
  const [activeTxRef, setActiveTxRef] = useState(null);
  const [view, setView] = useState("dashboard");

  // --- 1. FETCH ACTIVE RESERVATIONS ---
  const fetchReservations = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bookings/active");
      const data = await res.json();
      if (res.ok) {
        setReservations(data);
      }
    } catch (err) {
      console.error("Failed to load active vehicles");
    }
  };

  // --- 2. QR SCANNER & INITIAL LOAD ---
  useEffect(() => {
    fetchReservations();

    let scanner = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        (decodedText) => {
          setPlateNumber(decodedText.toUpperCase());
          setIsScanning(false);
          scanner.clear();
        },
        (error) => {
          /* Ignore scan noise */
        },
      );
    }

    return () => {
      if (scanner) scanner.clear();
    };
  }, [isScanning]);

  // --- 3. PAYMENT POLLING LOGIC ---
  const startPaymentValidation = (tx_ref) => {
    let attempts = 0;
    const maxAttempts = 24; // Stop after 2 minutes (24 * 5s)
    setPaymentStatus("pending");
    setActiveTxRef(tx_ref);

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(
          `http://localhost:5000/api/payments/verify/${tx_ref}`,
        );
        const data = await res.json();

        if (data.status === "success") {
          clearInterval(interval);
          setPaymentStatus("success");
          setStatusMessage({
            type: "success",
            text: "Payment Verified! Open Gate.",
          });
          setActiveTxRef(null);
          fetchReservations();
        } else if (data.status === "failed") {
          clearInterval(interval);
          setPaymentStatus("failed");
          setStatusMessage({ type: "error", text: "Payment Failed" });
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentStatus("timeout");
          setStatusMessage({
            type: "error",
            text: "Session Expired. Please Re-verify.",
          });
        }
      } catch (e) {
        console.log("Polling error, retrying...");
      }
    }, 5000);
  };

  // --- 4. HANDLE CHECK IN ---
  const handleCheckIn = async () => {
    if (!plateNumber) return alert("Please scan or enter a plate number");
    setLoading(true);
    setStatusMessage(null);
    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings/check-in",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plateNumber }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: `Checked In! Slot: ${data.slot || "Assigned"}`,
        });
        setPlateNumber("");
        fetchReservations();
      } else {
        setStatusMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  // --- 5. HANDLE CHECK OUT ---
  const handleCheckOut = async () => {
    if (!plateNumber) return alert("Please scan or enter a plate number");
    setLoading(true);
    setStatusMessage(null);
    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings/check-out",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plateNumber }),
        },
      );
      const data = await response.json();

      if (response.ok) {
        // Handle Chapa Payment Redirection
        if (data.paymentUrl) {
          window.open(data.paymentUrl, "_blank");
          startPaymentValidation(data.tx_ref);
        } else {
          setStatusMessage({ type: "success", text: `Checkout complete!` });
          setPlateNumber("");
          fetchReservations();
        }
      } else {
        setStatusMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  if (view === "incident")
    return <IncidentReport onBack={() => setView("dashboard")} />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12">
      {/* Header Container */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            PARK-ADDIS
          </h1>
          <p className="text-xs font-bold text-blue-600 uppercase">
            Terminal v1.0
          </p>
        </div>
        <button className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Grid: Stacks on mobile, split columns on Desktop */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* LEFT COLUMN: Interaction Controls */}
        <div className="space-y-6">
          {/* Scanner Section */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
            {isScanning ? (
              <div className="w-full relative">
                <div
                  id="reader"
                  className="overflow-hidden rounded-2xl border-none"
                ></div>
                <button
                  onClick={() => setIsScanning(false)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full z-10 shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="w-full aspect-video lg:aspect-square bg-gray-900 rounded-2xl mb-6 flex items-center justify-center relative">
                  <QrCode size={100} className="text-white/10" />
                  <div className="text-white/40 text-[10px] uppercase font-bold absolute bottom-4">
                    Camera Off
                  </div>
                </div>
                <button
                  onClick={() => setIsScanning(true)}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
                >
                  START SCANNER
                </button>
              </div>
            )}
          </div>

          {/* Manual Input Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">
              Plate Number
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="AA 2 B12345"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-mono focus:border-blue-500 outline-none transition-all mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="bg-green-500 text-white p-4 rounded-2xl font-bold flex flex-col items-center gap-1 hover:bg-green-600 disabled:opacity-50 transition-all shadow-md shadow-green-100"
              >
                <CheckCircle size={24} /> {loading ? "..." : "Check In"}
              </button>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="bg-orange-500 text-white p-4 rounded-2xl font-bold flex flex-col items-center gap-1 hover:bg-orange-600 disabled:opacity-50 transition-all shadow-md shadow-orange-100"
              >
                <Clock size={24} /> {loading ? "..." : "Check Out"}
              </button>
            </div>

            {/* Incident Button Restored */}
            <button
              onClick={() => setView("incident")}
              className="w-full border-2 border-red-100 text-red-500 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 hover:bg-red-50 transition-colors"
            >
              <AlertTriangle size={18} /> REPORT AN INCIDENT
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Status and Lists */}
        <div className="space-y-6">
          {/* Payment Polling UI */}
          {paymentStatus === "pending" && (
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 animate-in zoom-in duration-300">
              <div className="flex items-center gap-4 mb-4">
                <RefreshCw className="text-blue-600 animate-spin" size={24} />
                <div>
                  <h4 className="text-blue-900 font-black text-sm uppercase">
                    Waiting for Payment
                  </h4>
                  <p className="text-blue-600 text-xs">
                    Verify via Chapa Gateway...
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startPaymentValidation(activeTxRef)}
                  className="flex-1 bg-white text-blue-600 py-3 rounded-xl text-xs font-bold border border-blue-200"
                >
                  Manual Re-verify
                </button>
                <button
                  onClick={() => setPaymentStatus(null)}
                  className="px-4 bg-blue-100 text-blue-700 rounded-xl"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && !paymentStatus && (
            <div
              className={`p-4 rounded-2xl text-center font-bold animate-pulse ${statusMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Active Vehicles List - Restored full mapping */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                Active Vehicles
              </h3>
              <button
                onClick={fetchReservations}
                className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} /> Refresh List
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {reservations.length === 0 ? (
                <div className="col-span-full bg-white p-8 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                  <Car className="mx-auto text-gray-200 mb-2" size={40} />
                  <p className="text-gray-400 text-sm italic">Lot is empty.</p>
                </div>
              ) : (
                reservations.map((res) => (
                  <div
                    key={res._id}
                    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                        <Car size={24} />
                      </div>
                      <div>
                        <h4 className="font-mono font-black text-lg text-gray-800">
                          {res.plateNumber}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                          <Clock size={12} />{" "}
                          {new Date(res.checkInTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-black text-gray-300 uppercase">
                        Slot
                      </span>
                      <span className="text-blue-600 font-black text-lg">
                        #{res.slotId?.slotNumber || "???"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendantDashboard;