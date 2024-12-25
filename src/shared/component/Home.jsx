import { useState, useEffect, useRef } from 'react';
import { Radio, Music, SkipBack, SkipForward, Pause, Play, ChevronLeft, ChevronRight, Search, Loader } from 'lucide-react';
import { Howl } from 'howler';

const RadioPlayer = () => {
  const [stations, setStations] = useState([]);
  const [groupedStations, setGroupedStations] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Others');
  const [currentStationIndex, setCurrentStationIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const categoriesRef = useRef(null);

  useEffect(() => {
    fetchRadioStations();
  }, []);

  const fetchRadioStations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://de1.api.radio-browser.info/json/stations/bycountryexact/India');
      const data = await response.json();
      setStations(data);
      groupStationsByLanguage(data);
    } catch (error) {
      console.error('Error fetching radio stations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupStationsByLanguage = (stations) => {
    const grouped = stations.reduce((acc, station) => {
      const language = station.language || 'Others';
      if (!acc[language]) {
        acc[language] = [];
      }
      acc[language].push(station);
      return acc;
    }, {});
    setGroupedStations(grouped);
  };

  const filterStations = (stations) => {
    if (!searchQuery) return stations;
    return stations.filter(station => 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.tags && station.tags.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const playRadio = (index, language) => {
    if (sound) {
      sound.unload();
    }
    const station = groupedStations[language][index];
    const newSound = new Howl({
      src: [station.url_resolved],
      html5: true,
      volume: 0.7,
    });
    setSound(newSound);
    setCurrentStationIndex(index);
    setIsPlaying(true);
    newSound.play();
  };

  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const controls = {
    pause: () => {
      if (sound) {
        sound.pause();
        setIsPlaying(false);
      }
    },
    resume: () => {
      if (sound) {
        sound.play();
        setIsPlaying(true);
      }
    },
    next: () => {
      const nextIndex =
        currentStationIndex === groupedStations[selectedCategory].length - 1
          ? 0
          : currentStationIndex + 1;
      playRadio(nextIndex, selectedCategory);
    },
    previous: () => {
      const prevIndex =
        currentStationIndex === 0
          ? groupedStations[selectedCategory].length - 1
          : currentStationIndex - 1;
      playRadio(prevIndex, selectedCategory);
    }
  };

  const getCurrentStation = () => 
    currentStationIndex !== null ? groupedStations[selectedCategory][currentStationIndex] : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-10 h-10 text-pink-500 animate-spin" />
          <p className="text-lg font-medium">Loading Stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-black/30 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Radio size={24} className="text-pink-500" />
            <h1 className="text-xl font-bold">Indian Radio</h1>
          </div>
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 transition-colors rounded-full hover:bg-white/10">
            <Search size={20} />
          </button>
        </div>
        {showSearch && (
          <div className="mt-3">
            <input type="text" placeholder="Search stations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-white rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-white/50"
            />
          </div>
        )}
      </div>

      {/* Categories Scroll */}
      <div className="fixed left-0 right-0 z-40 top-16 bg-black/20 backdrop-blur-sm">
        <div className="relative">
          <button  onClick={() => scrollCategories('left')} className="absolute left-0 p-1 -translate-y-1/2 rounded-r-lg top-1/2 bg-black/30" >
            <ChevronLeft size={20} />
          </button>
          <div ref={categoriesRef} className="flex px-8 py-3 space-x-2 overflow-x-auto scrollbar-hide" style={{ scrollBehavior: 'smooth' }} >
            {Object.keys(groupedStations).map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all ${
                  selectedCategory === category ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80' }`}
              >
                {category}
              </button>
            ))}
          </div>
          <button onClick={() => scrollCategories('right')} className="absolute right-0 p-1 -translate-y-1/2 rounded-l-lg top-1/2 bg-black/30" >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Stations Grid */}
      <div className={`pt-32 px-4 pb-32 ${showSearch ? 'pt-40' : ''}`}>
        {filterStations(groupedStations[selectedCategory] || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Music className="w-16 h-16 mb-4 text-white/30" />
            <p className="text-lg font-medium">No stations found</p>
            <p className="text-sm text-white/60">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filterStations(groupedStations[selectedCategory] || []).map((station, index) => (
              <div key={station.stationuuid}
                className={`bg-white/10 backdrop-blur-md rounded-xl p-3 active:scale-95 transition-all cursor-pointer ${
                  currentStationIndex === index ? 'ring-2 ring-pink-500' : ''
                }`}
                onClick={() => playRadio(index, selectedCategory)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 overflow-hidden rounded-lg bg-black/30">
                    {station.favicon ? (
                      <img src={station.favicon} alt={station.name} className="object-cover w-full h-full" />
                    ) : (
                      <Music className="text-pink-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{station.name}</h3>
                    <p className="text-xs truncate text-white/60">{station.tags}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player Controls */}
      {sound && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-lg">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-lg bg-black/30">
                {getCurrentStation()?.favicon ? (
                  <img src={getCurrentStation().favicon} alt={getCurrentStation().name} className="object-cover w-full h-full" />
                ) : (
                  <Music className="text-pink-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{getCurrentStation()?.name}</h3>
                <p className="text-sm text-white/60">{selectedCategory}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-6">
              <button onClick={controls.previous} className="p-2 transition-colors rounded-full hover:bg-white/10" >
                <SkipBack className="w-6 h-6" />
              </button>
              <button onClick={isPlaying ? controls.pause : controls.resume}
                className="flex items-center justify-center rounded-full w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              <button  onClick={controls.next} className="p-2 transition-colors rounded-full hover:bg-white/10" >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioPlayer;