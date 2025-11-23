
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, List, Repeat, Disc, Music } from 'lucide-react';

const TRACKS = [
  {
    id: '1',
    title: 'Neon Horizon',
    artist: 'Synthwave Boy',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'Cyber Runner',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '3',
    title: 'Digital Rain',
    artist: 'Glitch Mob',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '4',
    title: 'Analog Dreams',
    artist: 'Retro Systems',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300'
  }
];

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    // Reset play state when track changes if it was already playing
    if (isPlaying && audioRef.current) {
        audioRef.current.play().catch(() => {});
    }
  }, [currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMute = !isMuted;
      setIsMuted(newMute);
      // If muting, set actual volume to 0. If unmuting, restore previous volume state.
      // If volume was 0, restore to default 0.5
      const restoreVol = volume === 0 ? 0.5 : volume;
      if (!newMute && volume === 0) setVolume(0.5);
      
      audioRef.current.volume = newMute ? 0 : restoreVol;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white select-none">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualizer / Cover Art */}
        <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 relative ${showPlaylist ? 'w-1/2' : 'w-full'}`}>
          
          {/* Background Blur */}
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center blur-3xl transition-all duration-1000"
            style={{ backgroundImage: `url(${currentTrack.cover})` }}
          />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={`w-64 h-64 rounded-xl shadow-2xl overflow-hidden border border-white/10 relative group ${isPlaying ? 'scale-100' : 'scale-95 opacity-90'} transition-all duration-700 ease-out`}>
               <img src={currentTrack.cover} alt="Cover" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Disc className={`text-white ${isPlaying ? 'animate-spin' : ''}`} size={24} />
                  </div>
               </div>
            </div>
            
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight mb-1 drop-shadow-lg">{currentTrack.title}</h2>
                <p className="text-gray-400 font-medium text-sm">{currentTrack.artist}</p>
            </div>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div className={`bg-black/20 backdrop-blur-md border-l border-white/5 transition-all duration-300 overflow-y-auto ${showPlaylist ? 'w-80 translate-x-0' : 'w-0 translate-x-full opacity-0'}`}>
            <div className="p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Up Next</h3>
                <div className="flex flex-col gap-2">
                    {TRACKS.map((track, idx) => (
                        <div 
                            key={track.id} 
                            onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${currentTrackIndex === idx ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                            <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                                <img src={track.cover} className="w-full h-full object-cover" />
                                {currentTrackIndex === idx && isPlaying && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium truncate ${currentTrackIndex === idx ? 'text-blue-400' : 'text-gray-300'}`}>{track.title}</div>
                                <div className="text-xs text-gray-500 truncate">{track.artist}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="h-24 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 flex flex-col justify-center gap-2 z-20">
        
        {/* Progress */}
        <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
            <span>{formatTime(progress)}</span>
            <div className="flex-1 relative h-1 bg-gray-700 rounded-full group cursor-pointer">
                <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(progress / duration) * 100}%` }}
                />
                <input 
                    type="range" 
                    min={0} 
                    max={duration || 100} 
                    value={progress} 
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
            <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3 w-1/3 group/vol">
                <button 
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="flex items-center gap-2">
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolume}
                        className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <span className="text-[10px] text-gray-500 font-mono w-8 opacity-0 group-hover/vol:opacity-100 transition-opacity select-none">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6 justify-center w-1/3">
                <button onClick={handlePrev} className="text-gray-400 hover:text-white hover:scale-110 transition-all">
                    <SkipBack size={24} fill="currentColor" className="opacity-50" />
                </button>
                <button 
                    onClick={handlePlayPause}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/20"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={handleNext} className="text-gray-400 hover:text-white hover:scale-110 transition-all">
                    <SkipForward size={24} fill="currentColor" className="opacity-50" />
                </button>
            </div>

            <div className="flex items-center gap-4 w-1/3 justify-end">
                <button className="text-gray-400 hover:text-white transition-colors">
                    <Repeat size={18} />
                </button>
                <button 
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className={`text-gray-400 hover:text-white transition-colors ${showPlaylist ? 'text-blue-400' : ''}`}
                >
                    <List size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
