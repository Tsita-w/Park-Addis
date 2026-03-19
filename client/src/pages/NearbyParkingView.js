import React, { useState, useEffect } from "react";
import { Search, Navigation, Star, X, CheckCircle2, TrendingUp } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import toast from "react-hot-toast";

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 15, { animate: true });
  return null;
};

const NearbyParkingView = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([9.0192, 38.7525]); // Addis Ababa

  // Booking & Slot States
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Dynamic Pricing State
  const [pricing, setPricing] = useState({
    price: 50,
    multiplier: 1.0,
    demandLevel: "Normal",
  });

  // Fetch all parking locations from MongoDB
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/parking/all");
        const data = await response.json();
        setParkingSpots(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching spots:", error);
        setParkingSpots([]);
      }
    };
    fetchSpots();
  }, []);

  // Fetch Dynamic Price when a spot is selected
  useEffect(() => {
    if (selectedSpot?._id) {
      const fetchPrice = async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/bookings/current-price/${selectedSpot._id}`,
          );
          const data = await res.json();
          setPricing(data);
        } catch (err) {
          console.error("Price fetch error:", err);
          setPricing({
            price: selectedSpot.pricePerHour || 50,
            multiplier: 1.0,
            demandLevel: "Normal",
          });
        }
      };
      fetchPrice();
    }
  }, [selectedSpot]);

  // Fetch Slots when a garage is selected
  useEffect(() => {
    if (selectedSpot && isModalOpen) {
      setLoadingSlots(true);
      fetch(`http://localhost:5000/api/slots/parking/${selectedSpot._id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Server error");
          return res.json();
        })
        .then((data) => {
          setAvailableSlots(Array.isArray(data) ? data : []);
          setLoadingSlots(false);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setAvailableSlots([]);
          setLoadingSlots(false);
        });
    }
  }, [selectedSpot, isModalOpen]);

  const filteredSpots = Array.isArray(parkingSpots)
    ? parkingSpots.filter((spot) =>
        spot.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      )
    : [];

  const handlePayment = async () => {
    setBookingLoading(true);
    const loadingToast = toast.loading("Connecting to Telebirr...");

    try {
      const response = await fetch("http://localhost:5000/api/bookings/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: chosenSlot._id,
          lotId: selectedSpot._id,
          amount: pricing.price,
          userId: "65f1a2b3c4d5e6f7a8b9c0d1",
        }),
      });

      const data = await response.json();

      if (data.checkout_url) {
        const bookingDetails = {
          lotName: selectedSpot.name,
          slotLabel: chosenSlot.slotNumber,
          price: pricing.price,
        };
        localStorage.setItem("lastBooking", JSON.stringify(bookingDetails));

        toast.success("Redirecting to Chapa...", { id: loadingToast });
        window.location.href = data.checkout_url;
      } else {
        toast.error("Payment error: " + (data.message || "Unknown error"), {
          id: loadingToast,
        });
      }
    } catch (err) {
      console.error("Payment initiation failed", err);
      toast.error("Network Error: Could not connect to server", {
        id: loadingToast,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    // Changed flex-row to flex-col on mobile, and lg:flex-row on desktop
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">

      {/* LEFT SIDE: MAP */}
      {/* On mobile: takes up 45% of screen height. On desktop: takes up remaining space (lg:flex-1) */}
      <div className="relative h-[45vh] lg:h-auto lg:flex-1 z-10">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <ChangeView center={mapCenter} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredSpots.map((spot) => (
            <Marker
              key={spot._id}
              position={[spot.coordinates?.lat || 9.01, spot.coordinates?.lng || 38.75]}
            >
              <Popup><div className="font-bold">{spot.name}</div></Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Adjusted search bar spacing for mobile (top-4/left-4) vs desktop (top-8/left-8) */}
        <div className="absolute top-4 lg:top-8 left-4 lg:left-8 right-4 lg:right-8 z-[1000] max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              className="h-12 sm:h-14 w-full pl-12 pr-4 rounded-2xl bg-white shadow-2xl border-none font-medium outline-none"
              placeholder="Search parking in Addis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: LIST */}
      {/* On mobile: full width, takes up remaining height (flex-1). On desktop: 420px fixed width */}
      <div className="w-full lg:w-[420px] flex-1 lg:flex-none bg-white lg:border-l flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-2xl z-30 rounded-t-3xl lg:rounded-none -mt-4 lg:mt-0 relative overflow-hidden">
        <div className="p-6 lg:p-8 border-b">
            <h1 className="text-xl sm:text-2xl font-black">Nearby Spots</h1>
        </div>
        <ScrollArea className="flex-1 px-4 sm:px-8">
          <div className="py-6 sm:py-8 space-y-4 sm:space-y-6">
            {filteredSpots.map((spot) => (
              <Card key={spot._id} className="p-5 sm:p-6 border-slate-100 shadow-sm hover:shadow-xl transition-all rounded-[24px] sm:rounded-[32px]">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-green-50 text-green-600 border-none text-[10px] font-black uppercase">Available</Badge>
                  <p className="text-xl sm:text-2xl font-black">{spot.pricePerHour} ETB</p>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-4">{spot.name}</h3>
                <Button
                  onClick={() => { setSelectedSpot(spot); setIsModalOpen(true); }}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white h-12 rounded-2xl font-bold transition-all"
                >Reserve Now</Button>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* SLOT SELECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm">
          {/* Added max-h-[90vh] and overflow-y-auto so the modal scrolls on tiny phones instead of cutting off */}
          <Card className="w-full max-w-md p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] bg-white shadow-2xl relative border-none max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setIsModalOpen(false); setChosenSlot(null); setBookingSuccessData(null); }}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full p-2 sm:bg-transparent sm:p-0"
            ><X size={20} className="sm:w-6 sm:h-6" /></button>

            {!bookingSuccessData ? (
              <>
                <h2 className="text-xl sm:text-2xl font-black mb-1 text-center mt-2 sm:mt-0">Select Your Space</h2>
                <p className="text-slate-500 mb-4 sm:mb-6 text-xs sm:text-sm font-medium text-center">
                  Picking at <span className="text-slate-900 font-bold">{selectedSpot?.name}</span>
                </p>

                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8 mt-4 sm:mt-6">
                  {loadingSlots ? (
                    <div className="col-span-4 py-10 text-center text-slate-400 font-medium italic">Loading available spaces...</div>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <button
                        key={slot._id}
                        disabled={slot.status !== "available"}
                        onClick={() => setChosenSlot(slot)}
                        className={`h-10 sm:h-12 rounded-xl sm:rounded-2xl font-bold border-2 transition-all flex flex-col items-center justify-center ${
                          slot.status !== "available" ? "bg-slate-100 border-transparent text-slate-300 cursor-not-allowed" :
                          chosenSlot?._id === slot._id ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-600 hover:border-blue-400 shadow-sm"
                        }`}
                      ><span className="text-[10px] sm:text-xs">{slot.slotNumber}</span></button>
                    ))
                  ) : (
                    <div className="col-span-4 py-8 text-center text-red-400 text-xs sm:text-sm font-medium bg-red-50 rounded-2xl">No slots found.</div>
                  )}
                </div>

                {/* SURGE PRICING WARNING */}
                {pricing.multiplier > 1 && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                      <TrendingUp size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-amber-900">High Demand: {pricing.multiplier}x Surge</p>
                      <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5">
                        Prices are higher because the lot is {pricing.demandLevel === 'High' ? 'nearly full' : 'busy'}.
                      </p>
                    </div>
                  </div>
                )}

                {/* PRICE DISPLAY */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] mb-6 sm:mb-8">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-slate-500 font-medium text-[10px] sm:text-xs uppercase tracking-widest">Selected Space:</span>
                     <span className="text-blue-600 font-black text-sm">{chosenSlot ? `Slot ${chosenSlot.slotNumber}` : "None"}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                    <span className="text-slate-900 font-bold text-sm sm:text-base">Total to Pay:</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900">{pricing.price} ETB</span>
                  </div>
                </div>

                <Button
                  disabled={!chosenSlot || bookingLoading}
                  className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-sm sm:text-base"
                  onClick={handlePayment}
                >
                  {bookingLoading ? "Connecting..." : "Pay & Confirm Selection"}
                </Button>
              </>
            ) : (
              /* Success View */
              <div className="text-center py-2 sm:py-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"><CheckCircle2 size={32} className="sm:w-10 sm:h-10" /></div>
                <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">Reserved Successfully!</h2>
                <p className="text-slate-500 mb-4 sm:mb-6 text-xs sm:text-sm font-medium">Space {chosenSlot?.slotNumber} is reserved.</p>
                <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl inline-block mb-6 sm:mb-8 shadow-inner border border-slate-100">
                  <img src={bookingSuccessData.qrCode} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48" />
                </div>
                <Button className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-bold text-sm sm:text-base" onClick={() => setIsModalOpen(false)}>Back to List</Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default NearbyParkingView;