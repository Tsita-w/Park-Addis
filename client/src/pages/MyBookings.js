import React, { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Calendar, MapPin } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure this matches the userId used in your application
  const userId = "65f1a2b3c4d5e6f7a8b9c0d1";

  useEffect(() => {
    fetch(`http://localhost:5000/api/bookings/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("History Error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8">My Bookings</h1>

      <ScrollArea className="h-[80vh]">
        <div className="grid gap-6">
          {bookings.map((b) => (
            <Card key={b._id} className="p-6 rounded-[32px] border-none shadow-sm hover:shadow-md transition-all flex items-center gap-6 bg-white">
              {/* QR Code Thumb */}
              <div className="bg-slate-50 p-3 rounded-3xl border border-slate-100">
                <img src={b.qrCode} alt="Ticket" className="w-24 h-24" />
              </div>

              {/* Booking Info */}
              <div className="flex-1 space-y-1">
                <div className="flex gap-2 mb-2">
                  <Badge className="bg-blue-600 text-white border-none px-3 font-bold">
                    Slot {b.slotId?.slotNumber || "N/A"}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-none px-3 uppercase text-[10px] font-black">
                    {b.status || 'Active'}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />
                  {b.lotId?.name || "Unknown Location"}
                </h3>

                {/* FIXED DATE RENDERING */}
                
                <p className="text-slate-500 text-sm flex items-center gap-2">
                <Calendar size={16} />
                {b.createdAt
                ? new Date(b.createdAt).toLocaleDateString()
                : "Date not available"}
                </p>
              </div>

              {/* Price */}
              <div className="text-right pr-4">
                <p className="text-3xl font-black text-slate-900">${b.lotId?.pricePerHour || '0'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Paid</p>
              </div>
            </Card>
          ))}

          {bookings.length === 0 && !loading && (
            <div className="text-center py-20 text-slate-400 italic">
              No booking history found.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MyBookings;