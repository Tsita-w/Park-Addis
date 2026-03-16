import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Import the QR component
import toast from 'react-hot-toast';

const BookingSuccess = () => {
    const navigate = useNavigate();

    // 3. LOGIC GOES HERE (Before return)
    const bookingRef = "PA-" + Math.floor(1000 + Math.random() * 9000);

    useEffect(() => {
        toast.success('Payment Verified! Welcome to Edna Mall.', {
            duration: 5000,
            icon: '🎟️',
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
                <p className="text-gray-500 mb-6 text-sm">Show this QR code at the entrance.</p>

                {/* --- QR CODE SECTION --- */}
                <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl mb-6">
                    <QRCodeSVG
                        value={bookingRef}
                        size={180}
                        bgColor={"#ffffff"}
                        fgColor={"#1e3a8a"} // Blue color to match your theme
                        level={"L"}
                        includeMargin={false}
                    />
                </div>

                <div className="space-y-3 mb-6 text-left bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center text-blue-900">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-semibold text-xs text-blue-800">Edna Mall - Slot A-8</span>
                    </div>
                    <div className="flex items-center text-blue-900">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-semibold text-xs text-blue-800">Valid for: 2 Hours</span>
                    </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 mb-6 text-center">
                    <p className="text-[10px] text-yellow-800 font-bold uppercase tracking-widest mb-1">Reference</p>
                    <p className="text-xl font-mono font-black text-gray-900">{bookingRef}</p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Map
                </button>
            </div>
        </div>
    );
};

export default BookingSuccess;