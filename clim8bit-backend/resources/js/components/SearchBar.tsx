import { useState } from "react";
import {
  Search,
  Wind,
  LogIn,
  LogOut,
  User,
  Settings,
  Star,
  Eye,
  EyeOff,
  Clock,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { toast } from "sonner";
import { FeaturesModal } from "./FeaturesModal";
import { SnowPanel } from "./ui/SnowPanel";
import type { WeatherType } from "@/Pages/Weather/Index";
import { searchCities } from "@/Utils/cities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationClick: () => void;
  demoMode: boolean;
  onDemoModeToggle: () => void;
  demoIsNight: boolean;
  onDemoNightToggle: () => void;
  demoWindy: boolean;
  onDemoWindyToggle: () => void;
  demoLeaves: boolean;
  onDemoLeavesToggle: () => void;
  demoSnow: boolean;
  onDemoSnowToggle: () => void;
  demoWindSpeed?: number;
  onDemoWindSpeedChange?: (speed: number) => void;
  demoClouds?: boolean;
  onDemoCloudsToggle?: () => void;
  onClearEffects?: () => void;
  currentCity?: string;
  currentCountry?: string;
  onLoginClick: () => void;
  onSettingsClick: () => void;
  hideUI?: boolean;
  onHideUIToggle?: () => void;
  cursorPhysicsEnabled?: boolean;
  onCursorPhysicsToggle?: () => void;
  onTitleClick?: () => void;
  weather?: WeatherType;
  temperature?: number;
  tempUnit?: 'C' | 'F';
  onTempUnitToggle?: () => void;
}

export function SearchBar({
  onSearch,
  onLocationClick,
  demoMode,
  onDemoModeToggle,
  demoIsNight,
  onDemoNightToggle,
  demoWindy,
  onDemoWindyToggle,
  demoLeaves,
  onDemoLeavesToggle,
  demoSnow,
  onDemoSnowToggle,
  demoWindSpeed,
  onDemoWindSpeedChange,
  demoClouds,
  onDemoCloudsToggle,
  onClearEffects,
  currentCity,
  currentCountry,
  onLoginClick,
  onSettingsClick,
  hideUI,
  onHideUIToggle,
  cursorPhysicsEnabled,
  onCursorPhysicsToggle,
  onTitleClick,
  weather,
  temperature,
  tempUnit,
  onTempUnitToggle,
}: SearchBarProps) {
  const [city, setCity] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, logout } = useAuth();
  const {
    isFavorite,
    addFavorite,
    removeFavoriteByName,
    canAddMore,
    maxFavorites,
  } = useFavorites();
  const { recentSearches, clearRecentSearches } =
    useRecentSearches();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity("");
      setShowRecent(false);
    }
  };

  const handleRecentClick = (cityName: string) => {
    onSearch(cityName);
    setShowRecent(false);
  };

  const handleFavoriteToggle = async () => {
    if (!currentCity || !currentCountry) return;

    if (isFavorite(currentCity)) {
      removeFavoriteByName(currentCity);
      toast.success(
        `Removed ${currentCity} from tracked cities`,
      );
    } else {
      if (!canAddMore()) {
        toast.error(
          `You can only track ${maxFavorites} cities. Remove one to add another.`,
        );
        return;
      }
      const success = await addFavorite(currentCity, currentCountry);
      if (success) {
        toast.success(`Now tracking ${currentCity}!`);
      }
    }
  };

  const isCurrentFavorite = currentCity
    ? isFavorite(currentCity)
    : false;

  const handleAutocompleteClick = (cityName: string) => {
    onSearch(cityName);
    setCity(cityName);
    setShowAutocomplete(false);
  };

  const handleAutocompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    if (value) {
      const results = searchCities(value);
      setAutocompleteResults(results);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  return (
    <>
      <div className="relative z-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Title/Logo with User Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 flex justify-start gap-2">
                {/* Hide UI Toggle */}
                {onHideUIToggle && (
                  <button
                    type="button"
                    onClick={onHideUIToggle}
                    className={`pixel-button px-3 py-2 ${hideUI ? "bg-purple-500/20 border-purple-400/50" : ""}`}
                    title={hideUI ? "Show UI" : "Hide UI"}
                  >
                    {hideUI ? (
                      <Eye size={14} className="pixel-icon" />
                    ) : (
                      <EyeOff size={14} className="pixel-icon" />
                    )}
                  </button>
                )}

                {/* Cursor Physics Toggle */}
                {onCursorPhysicsToggle && (
                  <button
                    type="button"
                    onClick={onCursorPhysicsToggle}
                    className={`pixel-button px-3 py-2 ${cursorPhysicsEnabled ? "bg-orange-500/20 border-orange-400/50" : "bg-gray-500/20 border-gray-400/50"}`}
                    title={
                      cursorPhysicsEnabled
                        ? "Disable cursor physics"
                        : "Enable cursor physics"
                    }
                  >
                    {/* Gravity toggle icon - apple off/on */}
                    <img
                      src={
                        cursorPhysicsEnabled
                          ? "/assets/images/icons/gravityOn.png"
                          : "/assets/images/icons/gravityOff.png"
                      }
                      alt={cursorPhysicsEnabled ? "Disable gravity physics" : "Enable gravity physics"}
                      className="w-6 h-6 object-contain pixel-icon"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </button>
                )}
              </div>

              {!hideUI && (
                <>
                  <h1
                    className="pixel-title text-white text-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onTitleClick}
                    title="Back to intro"
                  >
                    CLIM8BIT
                  </h1>
                  <div className="flex-1 flex justify-end">
                    {user ? (
                      <div className="flex items-center gap-2">
                        <div className="pixel-text-xs text-white/70 hidden sm:block">
                          <User
                            size={12}
                            className="inline mr-1 pixel-icon"
                          />
                          {user.name || user.username || user.email?.split('@')[0]}
                        </div>
                        <button
                          onClick={onSettingsClick}
                          className="pixel-button px-3 py-2"
                          title="Account Settings"
                        >
                          <Settings size={14} className="pixel-icon" />
                        </button>
                        <button
                          onClick={() => setShowLogoutDialog(true)}
                          className="pixel-button px-3 py-2"
                          title="Logout"
                        >
                          <LogOut size={14} className="pixel-icon" />
                        </button>
                        
                        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                          <AlertDialogContent className="bg-black/95 border-2 border-white/30">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="pixel-title text-white text-lg">
                                CONFIRM LOGOUT
                              </AlertDialogTitle>
                              <AlertDialogDescription className="pixel-text-xs text-white/80 mt-2">
                                Are you sure you want to logout?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 gap-2">
                              <AlertDialogCancel 
                                onClick={() => setShowLogoutDialog(false)}
                                className="pixel-button bg-white/10 hover:bg-white/20 text-white border-white/30"
                              >
                                CANCEL
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  setShowLogoutDialog(false);
                                  await logout();
                                  window.location.reload();
                                }}
                                className="pixel-button bg-red-600 hover:bg-red-700 text-white"
                              >
                                LOGOUT
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ) : (
                      <button
                        onClick={onLoginClick}
                        className="pixel-button px-4 py-2"
                      >
                        <LogIn
                          size={14}
                          className="inline mr-1 pixel-icon"
                        />
                        <span className="pixel-text-xs">
                          LOGIN
                        </span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            {!hideUI && (
              <div className="pixel-text-xs text-white/50 text-center">
                RETRO WEATHER FORECAST
              </div>
            )}
          </div>

          {!hideUI && (
            <SnowPanel 
              weather={weather || "clear-day"} 
              temperature={temperature}
              className="p-4"
            >
              <form
                onSubmit={handleSubmit}
                className="flex gap-3 mb-3"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={city}
                    onChange={handleAutocompleteChange}
                    onFocus={() => {
                      if (city && autocompleteResults.length > 0) {
                        setShowAutocomplete(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click on autocomplete item
                      setTimeout(() => setShowAutocomplete(false), 200);
                    }}
                    placeholder="SEARCH CITY..."
                    className="w-full bg-black/30 border-2 border-white/20 px-4 py-3 text-white pixel-text-xs placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                    disabled={demoMode}
                    autoComplete="off"
                  />
                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && autocompleteResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border-2 border-white/30 max-h-60 overflow-y-auto z-50">
                      {autocompleteResults.map((result) => (
                        <button
                          key={result}
                          type="button"
                          onClick={() => handleAutocompleteClick(result)}
                          className="w-full text-left bg-transparent hover:bg-white/10 px-4 py-2 transition-colors border-b border-white/10 last:border-b-0"
                        >
                          <div className="pixel-text-xs text-white">
                            {result}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="pixel-button px-6"
                  disabled={demoMode}
                >
                  <Search size={16} className="pixel-icon" />
                  <span className="pixel-text-xs hidden md:inline">
                    SEARCH
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onLocationClick}
                  className="pixel-button px-6"
                  disabled={demoMode}
                >
                  <span className="pixel-text-sm mr-1">v</span>
                  <span className="pixel-text-xs hidden md:inline">
                    LOCATION
                  </span>
                </button>

                {/* Favorite toggle button - only when logged in and have current city */}
                {user && currentCity && !demoMode && (
                  <button
                    type="button"
                    onClick={handleFavoriteToggle}
                    className={`pixel-button px-6 ${isCurrentFavorite ? "bg-yellow-500/20 border-yellow-400/50" : ""}`}
                    title={
                      isCurrentFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Star
                      size={16}
                      className="pixel-icon"
                      fill={
                        isCurrentFavorite
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                )}

                {/* Recent searches button - only when logged in */}
                {user &&
                  recentSearches.length > 0 &&
                  !demoMode && (
                    <button
                      type="button"
                      onClick={() => setShowRecent(!showRecent)}
                      className="pixel-button px-6"
                      title="Recent searches"
                    >
                      <Clock size={16} className="pixel-icon" />
                    </button>
                  )}
              </form>

              {/* Recent Searches Dropdown */}
              {showRecent &&
                user &&
                recentSearches.length > 0 && (
                  <div className="mb-3 bg-black/50 border-2 border-white/20 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock
                          size={14}
                          className="text-white/70 pixel-icon"
                        />
                        <span className="pixel-text-xs text-white/70">
                          RECENT SEARCHES
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          clearRecentSearches();
                          setShowRecent(false);
                        }}
                        className="pixel-text-xs text-red-400 hover:text-red-300"
                      >
                        CLEAR
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search.id}
                          onClick={() =>
                            handleRecentClick(search.name)
                          }
                          className="text-left bg-black/30 border-2 border-white/10 hover:border-white/30 px-3 py-2 transition-colors"
                        >
                          <div className="pixel-text-xs text-white">
                            {search.name}
                          </div>
                          <div className="pixel-text-xs text-white/50 text-[10px] mt-1">
                            {search.country}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Demo Mode Toggle */}
              <div className="flex items-center justify-center gap-3 pt-3 border-t-2 border-white/10 flex-wrap">
                <button
                  type="button"
                  onClick={onDemoModeToggle}
                  className={`pixel-button flex-1 min-w-[140px] ${demoMode ? "pixel-button-active bg-yellow-500/20 border-yellow-400/50" : ""}`}
                >
                  <span className="pixel-text-xs">
                    {demoMode ? "|| EXIT DEMO" : "> DEMO MODE"}
                  </span>
                </button>

                {/* Features Info Button */}
                <button
                  type="button"
                  onClick={() => setShowFeaturesModal(true)}
                  className="pixel-button flex-1 min-w-[140px] bg-cyan-500/10 border-cyan-400/30 hover:bg-cyan-500/20"
                  title="View all features"
                >
                  <span className="pixel-text-sm mr-1">?</span>
                  <span className="pixel-text-xs hidden sm:inline">
                    FEATURES
                  </span>
                </button>
              </div>

            </SnowPanel>
          )}
        </div>
      </div>

      {/* Features Modal - Outside of main container for proper z-index stacking */}
      <FeaturesModal
        isOpen={showFeaturesModal}
        onClose={() => setShowFeaturesModal(false)}
      />
    </>
  );
}