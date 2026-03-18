import { useNavigate } from "react-router-dom";
import { Car, ShieldCheck, Zap } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <header className="p-6 flex justify-between items-center border-b border-gray-50">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">PARK-ADDIS</h1>
        <button onClick={() => navigate("/login")} className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold text-sm">Sign In</button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
          Smart Parking for <span className="text-blue-600">Addis Ababa.</span>
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
          Find, book, and pay for parking in seconds. No more driving in circles. No more cash headaches.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button onClick={() => navigate("/signup")} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:scale-105 transition-all">GET STARTED</button>
          <button className="px-10 py-4 bg-gray-100 text-gray-800 rounded-2xl font-black text-xl hover:bg-gray-200">LEARN MORE</button>
        </div>
      </main>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto pb-20">
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