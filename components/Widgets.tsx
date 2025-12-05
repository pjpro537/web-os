
import React, { useState, useEffect } from 'react';
import { CloudSun, Calendar, Cpu, Battery, Droplets } from 'lucide-react';

export const Widgets: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-8 right-8 w-80 flex flex-col gap-6 pointer-events-none z-0 select-none animate-in slide-in-from-right-8 fade-in duration-700">
      
      {/* Weather Widget (Material Expressive) */}
      <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 backdrop-blur-md rounded-3xl p-6 text-white shadow-2xl pointer-events-auto hover:scale-[1.02] transition-transform duration-300 border border-white/10 group">
        <div className="flex justify-between items-start mb-4">
            <div>
                <span className="text-sm font-medium opacity-80 flex items-center gap-1"><MapPinIcon size={12}/> San Francisco</span>
                <div className="text-5xl font-bold mt-1 tracking-tighter">72°</div>
            </div>
            <CloudSun size={48} className="text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
        </div>
        <div className="flex justify-between text-xs font-medium opacity-90 mt-4 bg-white/10 p-2 rounded-xl backdrop-blur-sm">
            <span className="flex items-center gap-1"><Droplets size={12}/> 14% Rain</span>
            <span>H:76° L:62°</span>
        </div>
      </div>

      {/* Calendar Widget */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 shadow-2xl pointer-events-auto hover:scale-[1.02] transition-transform duration-300 border border-white/10 text-white">
         <div className="flex items-center gap-3 mb-4 text-red-400">
             <div className="p-2 bg-red-500/20 rounded-full">
                <Calendar size={16} />
             </div>
             <span className="font-bold uppercase tracking-wider text-xs">Up Next</span>
         </div>
         <div className="space-y-4">
             <div className="flex gap-3 items-center group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
                 <div className="w-1 h-10 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                 <div>
                     <div className="text-sm font-bold text-gray-100">Team Sync</div>
                     <div className="text-xs text-gray-400">10:00 AM - 11:00 AM</div>
                 </div>
             </div>
             <div className="flex gap-3 items-center group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
                 <div className="w-1 h-10 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                 <div>
                     <div className="text-sm font-bold text-gray-100">Design Review</div>
                     <div className="text-xs text-gray-400">2:00 PM - 3:30 PM</div>
                 </div>
             </div>
         </div>
      </div>

      {/* System Stats Widget */}
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-5 text-white shadow-2xl pointer-events-auto hover:scale-[1.02] transition-transform duration-300 border border-white/10">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest ml-1">System Health</h3>
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Cpu size={20} className="text-blue-400 relative z-10" />
                  <span className="text-lg font-bold relative z-10">12%</span>
                  <span className="text-[10px] text-gray-400 relative z-10">CPU</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                      <Battery size={20} className="text-green-400" />
                  </div>
                  <span className="text-lg font-bold relative z-10">98%</span>
                  <span className="text-[10px] text-gray-400 relative z-10">Battery</span>
              </div>
          </div>
      </div>
    </div>
  );
};

const MapPinIcon = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
)
