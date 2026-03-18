import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react"; // Standard high-quality QR generator
import { Car, Download, Share2 } from "lucide-react";

const UserQRCode = () => {
  const [plateNumber, setPlateNumber] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleGenerate = () => {
    if (plateNumber.length < 3) return alert("Please enter a valid plate number");
    setShowQR(true);
  };

  return (
    <div className="min-h-screen bg-blue-600 p-6 flex flex-col items-center justify-center">
      {/* 1. Header Area */}
      <div className="text-center mb-8">
        <div className="bg-white/20 p-3 rounded-full inline-block mb-4">
          <Car className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">PARK-ADDIS</h1>
        <p className="text-blue-100 text-sm">Your Digital Parking Pass</p>
      </div>

      {/* 2. Main Card */}
      <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl flex flex-col items-center">
        {!showQR ? (
          <div className="w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800 text-center">Ready to Park?</h2>
            <p className="text-gray-500 text-sm text-center px-4">
              Enter your vehicle plate number to generate your entry QR code.
            </p>
            <input
              type="text"
              placeholder="e.g. AA 2 B12345"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-xl font-mono focus:border-blue-500 outline-none transition-all"
            />
            <button
              onClick={handleGenerate}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              GENERATE PASS
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            {/* The QR Code Container */}
            <div className="p-4 bg-white border-4 border-gray-50 rounded-3xl shadow-inner mb-6">
              <QRCodeCanvas
                value={plateNumber}
                size={200}
                level={"H"} // High error correction
                includeMargin={true}
              />
            </div>

            <h3 className="text-2xl font-black text-gray-800 font-mono mb-1">
              {plateNumber}
            </h3>
            <p className="text-xs font-bold text-blue-600 uppercase mb-6 tracking-widest">
              Verified Vehicle
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-200"
              >
                Change
              </button>
              <button
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                onClick={() => window.print()}
              >
                <Download size={16} /> Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Helper Text */}
      <p className="mt-8 text-blue-200 text-xs text-center max-w-[250px]">
        Present this QR code to the Park-Addis attendant at the entrance gate.
      </p>
    </div>
  );
};

export default UserQRCode;