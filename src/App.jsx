import React, { useState, useEffect } from 'react';
import { Heart, X, RotateCcw } from 'lucide-react';

export default function CatSwiper() {
  // State of the cat list
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCats, setLikedCats] = useState([]);

  // Controls for switching views of main and summary
  const [showSummary, setShowSummary] = useState(false);

  // To trigger the slide animation
  const [animationClass, setAnimationClass] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch a fresh batch of cats from the API 
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);

        // Generate a random number to get random batch of 15 cat images everytime the page refreshes or start over
        const randomSkip = Math.floor(Math.random() * 2000);
        const response = await fetch(`https://cataas.com/api/cats?limit=15&skip=${randomSkip}`);
        const data = await response.json();

        // Clean up the data to ensure every cat has a valid ID to build the URL
        const catImages = data
          .map((cat) => {
            const validId = cat._id || cat.id;

            if (!validId) return null; // Skip if no ID is found
            return {
              id: validId,
              url: `https://cataas.com/cat/${validId}`,
              liked: false
            };
          })
          .filter(item => item !== null);

        setCats(catImages);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching cats:", error);
        setLoading(false);
      }
    };

    fetchCats();
  }, []);

  // Preloading the next 3 images in the background.
  useEffect(() => {
    if (cats.length === 0) return;

    const preloadCount = 3;
    
    for (let i = 1; i <= preloadCount; i++) {
      // Check if the next cat exists before trying to load it
      if (currentIndex + i < cats.length) {
        const img = new Image();
        img.src = cats[currentIndex + i].url;
      }
    }
  }, [currentIndex, cats]);

  // Keyboard controls to allow user to use left/right arrow keys 
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showSummary || loading) return;

      if (e.key === 'ArrowLeft') handleDislike();
      if (e.key === 'ArrowRight') handleLike();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, showSummary, loading]);

  // Handling liked cats
  const handleLike = () => {
    // Prevent action if it is out of cats
    if (currentIndex >= cats.length) return;
    setAnimationClass('slide-right');
    
    // Wait for animation to finish (300ms) before changing the data
    setTimeout(() => {
      const updatedCats = [...cats];
      updatedCats[currentIndex].liked = true;
      setLikedCats([...likedCats, updatedCats[currentIndex]]);

      // If it is the last cat, then show the summary
      if (currentIndex === cats.length - 1) {
        setShowSummary(true);
      } else {
        setCurrentIndex(currentIndex + 1);
      }

      setAnimationClass('');
    }, 300);
  };

  //Handling disliked cats 
  const handleDislike = () => {
    if (currentIndex >= cats.length) return;
    setAnimationClass('slide-left');
    
    // Wait for animation to finish (300ms) before changing the data
    setTimeout(() => {
      if (currentIndex === cats.length - 1) {
        setShowSummary(true);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
      setAnimationClass('');
    }, 300);
  };

  const resetApp = () => {
    // Generate a new random number when reloading the page
    window.location.reload();
  };

  // --- SUMMARY VIEW ---
  if (showSummary) {
    return (
      // CHANGED: 'h-screen' -> 'min-h-screen' so the background expands.
      // CHANGED: Added 'py-12' so the card doesn't touch the top/bottom edges.
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-300 via-purple-200 to-rose-300 flex items-center justify-center py-12 px-4">
        
        {/* CHANGED: Removed 'max-h-[90vh]' and 'overflow-y-auto'.
            Now the white card will grow as tall as it needs to be. */}
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              🐾 Your Purrfect Matches! 🐾
            </h2>
            <p className="text-xl text-gray-600">
              You liked <span className="font-bold text-pink-600">{likedCats.length}</span> out of {cats.length} cats!
            </p>
          </div>
          
          {likedCats.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {likedCats.map((cat) => (
                <div key={cat.id} className="relative rounded-xl overflow-hidden shadow-lg aspect-square bg-gray-100">
                  <img src={cat.url} alt="Liked cat" className="w-full h-full object-cover"/>
                  <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1.5 shadow-lg">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mb-8">
              <p className="text-gray-500 text-lg">No cats were liked. Maybe you're more of a dog person? 🐶</p>
            </div>
          )}

          <div className="text-center">
            {/* Added focus:outline-none here too just in case */}
            <button onClick={resetApp} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition inline-flex items-center gap-2 focus:outline-none">
              <RotateCcw className="w-5 h-5" /> Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LOADING VIEW ---
  if (loading || cats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-200 to-rose-300 flex items-center justify-center">
        <div className="text-center">
           <div className="animate-bounce text-4xl mb-4">🐱</div>
           <div className="text-gray-800 text-2xl font-semibold">Fetching Kitties...</div>
        </div>
      </div>
    );
  }

  const currentCat = cats[currentIndex];

  // --- MAIN SWIPER VIEW ---
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-300 via-purple-200 to-rose-300 flex flex-col items-center justify-center p-4 py-8">
      <style>{`
        @keyframes slideRight {
          to { transform: translateX(100%) rotate(20deg); opacity: 0; }
        }
        @keyframes slideLeft {
          to { transform: translateX(-100%) rotate(-20deg); opacity: 0; }
        }
        .slide-right { animation: slideRight 0.3s ease-out forwards; }
        .slide-left { animation: slideLeft 0.3s ease-out forwards; }
      `}</style>

      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 drop-shadow-sm">
            🐾 Paws & Preferences 🐾
          </h1>
          <p className="text-gray-800 text-xl font-medium">
            Find Your Favourite Kitty
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-gray-700">
              Cat {currentIndex + 1} of {cats.length}
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1 bg-pink-50 px-3 py-1 rounded-lg">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span className="font-bold text-pink-600">{likedCats.length}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
                <span className="font-bold text-gray-600">{currentIndex - likedCats.length}</span>
              </div>
            </div>
          </div>

          {/* --- IMAGE STACK --- */}
          <div className="relative mb-4 h-[350px] w-full">
            
            {/* PRE-RENDER NEXT CAT */}
            {currentIndex + 1 < cats.length && (
               <div className="absolute inset-0 bg-gray-100 rounded-xl overflow-hidden w-full h-full z-0">
                  <img 
                    src={cats[currentIndex + 1].url} 
                    className="w-full h-full object-cover"
                    alt="Next cat"
                  />
               </div>
            )}

            {/* CURRENT CAT */}
            <div className={`relative bg-gray-100 rounded-xl overflow-hidden w-full h-full z-10 ${animationClass}`}>
              {currentCat && (
                <img 
                  key={currentCat.id} 
                  src={currentCat.url} 
                  alt="Current cat"
                  className="w-full h-full object-cover pointer-events-none"
                  loading="eager" 
                />
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-6 md:gap-8">
            <button
              onClick={handleDislike}
              className="bg-white border-4 border-red-500 rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-red-50 transform hover:scale-110 transition-all group focus:outline-none"
            >
              <X className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
            </button>
            <div className="flex-1 text-center px-2 min-w-0">
              <p className="text-gray-600 text-md font-medium mb-0">
                What do you think?
              </p>
              <p className="text-gray-400 text-[11.5px] mt-1 leading-tight">
                Use <kbd className="px-1 border rounded">←</kbd> to Dislike <kbd className="px-1 border rounded">→</kbd> to Like
              </p>
            </div>
            <button
              onClick={handleLike}
              className="bg-white border-4 border-green-500 rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-green-50 transform hover:scale-110 transition-all group focus:outline-none"
            >
              <Heart className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="text-center text-gray-800 font-medium text-xs md:text-sm opacity-80">
          You can also use the <kbd className="px-2 py-1 bg-white/50 rounded border border-gray-300 shadow-sm">←</kbd> and <kbd className="px-2 py-1 bg-white/50 rounded border border-gray-300 shadow-sm">→</kbd> arrow keys!
        </div>
      </div>
    </div>
  );
}