import { useNavigate } from "react-router-dom";
import { Car, ShieldCheck, Zap } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Header: Added flex-wrap and responsive padding */}
      <header className="p-4 md:p-6 flex flex-wrap justify-between items-center border-b border-gray-50 max-w-7xl mx-auto gap-4">
        <h1 className="text-xl md:text-2xl font-black text-blue-600 tracking-tighter">PARK-ADDIS</h1>
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 md:px-6 md:py-2 bg-gray-900 text-white rounded-full font-bold text-xs md:text-sm whitespace-nowrap"
        >
          Sign In
        </button>
      </header>

      {/* Main: Adjusted text sizes for mobile (text-4xl) vs desktop (text-7xl) */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-center">
        <h2 className="text-4xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
          Smart Parking for <span className="text-blue-600">Addis Ababa.</span>
        </h2>
        <p className="text-gray-500 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Find, book, and pay for parking in seconds. No more driving in circles. No more cash headaches.
        </p>

        {/* Buttons: flex-col on mobile, flex-row on desktop */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate("/signup")}
            className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg md:text-xl shadow-xl shadow-blue-200 hover:scale-105 transition-all"
          >
            GET STARTED
          </button>
          <button
            className="w-full md:w-auto px-10 py-4 bg-gray-100 text-gray-800 rounded-2xl font-black text-lg md:text-xl hover:bg-gray-200"
          >
            LEARN MORE
          </button>
        </div>
      </main>

      {/* Features: grid-cols-1 on mobile, md:grid-cols-3 on desktop */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-6 max-w-6xl mx-auto pb-20">
        <div className="p-8 bg-blue-50 rounded-3xl text-center">
          <Zap className="mx-auto text-blue-600 mb-4" size={40} />
          <h3 className="font-bold text-lg">Instant Booking</h3>
        </div>
        <div className="p-8 bg-gray-50 rounded-3xl text-center">
          <ShieldCheck className="mx-auto text-gray-800 mb-4" size={40} />
          <h3 className="font-bold text-lg">Secure Payments</h3>
        </div>
        <div className="p-8 bg-blue-50 rounded-3xl text-center">
          <Car className="mx-auto text-blue-600 mb-4" size={40} />
          <h3 className="font-bold text-lg">Real-time Slots</h3>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;