import React, { useState, useEffect } from 'react';
import { Search, Navigation, Star, X, CheckCircle2 } from 'lucide-react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import toast from 'react-hot-toast';

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

  // Fetch all parking locations from MongoDB
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/parking/all');
        const data = await response.json();
        // Ensure we only set state if data is an array
        setParkingSpots(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching spots:", error);
        setParkingSpots([]); // Fallback to empty array
      }
    };
    fetchSpots();
  }, []);

  // Fetch Slots when a garage is selected
  // Fetch Slots when a garage is selected
useEffect(() => {
    if (selectedSpot && isModalOpen) {
      setLoadingSlots(true);

      // FIXED: URL now matches your slotRoutes.js backend (/api/slots/parking/:lotId)
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

  // 3. Filter Logic with Safety Check
  const filteredSpots = Array.isArray(parkingSpots)
    ? parkingSpots.filter(spot =>
        spot.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  const handleConfirmBooking = async () => {
    if (!chosenSlot) return;

    setBookingLoading(true);
    const bookingData = {
      slotId: chosenSlot._id,
      lotId: selectedSpot._id,
      userId: "65f1a2b3c4d5e6f7a8b9c0d1",
      startTime: new Date()
    };

    try {
      const response = await fetch('http://localhost:5000/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      if (response.ok) {
        setBookingSuccessData(data);
      } else {
        alert("Booking failed: " + data.message);
      }
    } catch (err) {
      console.error("Error creating booking:", err);
    } finally {
      setBookingLoading(false);
    }
  };


const handlePayment = async () => {
    // 1. Start the loading state and the toast
    setBookingLoading(true);
    const loadingToast = toast.loading('Connecting to Telebirr...');

    try {
        const response = await fetch('http://localhost:5000/api/bookings/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slotId: chosenSlot._id,
                lotId: selectedSpot._id,
                amount: selectedSpot.pricePerHour,
                userId: "65f1a2b3c4d5e6f7a8b9c0d1"
            }),
        });

        const data = await response.json();

        if (data.checkout_url) {
            // 2. Success toast before redirecting
            toast.success('Redirecting to Chapa...', { id: loadingToast });

            // Give the user a split second to see the success message before redirecting
            setTimeout(() => {
                window.location.href = data.checkout_url;
            }, 800);

        } else {
            // 3. Error toast if backend sends a message
            toast.error("Payment error: " + (data.message || "Unknown error"), { id: loadingToast });
        }
    } catch (err) {
        console.error("Payment initiation failed", err);
        // 4. Error toast if the network fails
        toast.error('Network Error: Could not connect to server', { id: loadingToast });
    } finally {
        setBookingLoading(false);
    }
};
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">

      {/* LEFT SIDE: MAP */}
      <div className="relative flex-1 z-10">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <ChangeView center={mapCenter} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredSpots.map((spot) => (
            <Marker key={spot._id} position={[spot.coordinates?.lat || 9.01, spot.coordinates?.lng || 38.75]}>
              <Popup><div className="font-bold">{spot.name}</div></Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-8 left-8 right-8 z-[1000] max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              className="h-14 pl-12 pr-12 rounded-2xl bg-white shadow-2xl border-none font-medium"
              placeholder="Search parking in Addis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: LIST */}
      <div className="w-[420px] bg-white border-l flex flex-col shadow-2xl z-30">
        <div className="p-8 border-b">
          <h1 className="text-2xl font-black">Nearby Spots</h1>
        </div>

        <ScrollArea className="flex-1 px-8">
          <div className="py-8 space-y-6">
            {filteredSpots.map((spot) => (
              <Card key={spot._id} className="p-6 border-slate-100 shadow-sm hover:shadow-xl transition-all rounded-[32px]">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-green-50 text-green-600 border-none text-[10px] font-black uppercase">Available</Badge>
                  <p className="text-2xl font-black">${spot.pricePerHour}</p>
                </div>
                <h3 className="text-xl font-bold mb-4">{spot.name}</h3>
                <Button
                  onClick={() => { setSelectedSpot(spot); setIsModalOpen(true); }}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white h-12 rounded-2xl font-bold transition-all"
                >
                  Reserve Now
                </Button>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* SLOT SELECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 rounded-[40px] bg-white shadow-2xl relative border-none">

            <button onClick={() => {setIsModalOpen(false); setChosenSlot(null); setBookingSuccessData(null);}} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
              <X size={24} />
            </button>

            {!bookingSuccessData ? (
              <>
                <h2 className="text-2xl font-black mb-1 text-center">Select Your Space</h2>
                <p className="text-slate-500 mb-6 text-sm font-medium text-center">
                  Picking at <span className="text-slate-900 font-bold">{selectedSpot?.name}</span>
                </p>

                <div className="grid grid-cols-4 gap-3 mb-8 mt-6">
                  {loadingSlots ? (
                    <div className="col-span-4 py-10 text-center text-slate-400 font-medium italic">
                        Loading available spaces...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <button
                        key={slot._id}
                        disabled={slot.status !== 'available'}
                        onClick={() => setChosenSlot(slot)}
                        className={`h-12 rounded-2xl font-bold border-2 transition-all flex flex-col items-center justify-center ${
                          slot.status !== 'available'
                            ? "bg-slate-100 border-transparent text-slate-300 cursor-not-allowed"
                            : chosenSlot?._id === slot._id
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                              : "bg-white border-slate-100 text-slate-600 hover:border-blue-400 shadow-sm"
                        }`}
                      >
                        <span className="text-xs">{slot.slotNumber}</span>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-4 py-10 text-center text-red-400 text-sm font-medium bg-red-50 rounded-2xl">
                        No slots found in database for this ID.
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-5 rounded-[24px] mb-8">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-widest">Selected Space:</span>
                    <span className="text-blue-600 font-black">{chosenSlot ? `Slot ${chosenSlot.slotNumber}` : "None"}</span>
                  </div>
                </div>

                <Button
                disabled={!chosenSlot || bookingLoading}
                className="w-full h-14 rounded-2xl bg-blue-600 ..."
                 // CHANGE THIS LINE:
                onClick={handlePayment}>
                {bookingLoading ? "Connecting to Telebirr..." : "Pay & Confirm Selection"}
                </Button>
              </>
            ) : (
              // Success View / QR Code
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Reserved Successfully!</h2>
                <p className="text-slate-500 mb-6 text-sm font-medium">Space {chosenSlot?.slotNumber} is reserved.</p>
                <div className="bg-white p-4 rounded-3xl inline-block mb-8 shadow-inner border border-slate-100">
                  <img src={bookingSuccessData.qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold" onClick={() => setIsModalOpen(false)}>
                  Back to List
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default NearbyParkingView;