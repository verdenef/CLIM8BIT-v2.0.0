import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({
  message,
  onDismiss,
}: ErrorBannerProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Extract optional explicit error tag from message, e.g. "[CITY_ERROR] City not found: ..."
  const tagMatch = message.match(/^\[(CITY_ERROR|NETWORK_ERROR|SERVICE_ERROR)\]\s*/i);
  const explicitTag = tagMatch?.[1]?.toUpperCase();
  const displayMessage = tagMatch ? message.replace(tagMatch[0], "") : message;
  const lowerMessage = displayMessage.toLowerCase();

  // Check if it's a city-related error
  const isCityError =
    explicitTag === "CITY_ERROR" ||
    lowerMessage.includes("city not found") ||
    lowerMessage.includes("invalid city");

  // Check if it's a network error
  const isNetworkError =
    explicitTag === "NETWORK_ERROR" ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("connection");

  // Check if it's a service error
  const isServiceError =
    explicitTag === "SERVICE_ERROR" ||
    lowerMessage.includes("service") ||
    lowerMessage.includes("unavailable");

  // Auto-dismiss after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  // Handle fade-out animation completion
  useEffect(() => {
    if (isExiting) {
      const fadeOutTimer = setTimeout(() => {
        onDismiss();
      }, 400); // Match the fadeOut animation duration

      return () => clearTimeout(fadeOutTimer);
    }
  }, [isExiting, onDismiss]);

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl px-4 ${isExiting ? "animate-fadeOut" : "animate-slideDown"}`}
    >
      <div 
        className="pixel-panel mt-4 p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
        }}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <AlertCircle className="w-6 h-6 text-white/70 animate-pulse pixel-icon" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="pixel-text-sm text-white/90 mb-2">
              {isCityError
                ? "🏙️ CITY NOT FOUND"
                : isNetworkError
                  ? "🌐 NETWORK ERROR"
                  : isServiceError
                    ? "⚠️ SERVICE ERROR"
                    : "ERROR"}
            </div>
            <div className="pixel-text-xs text-white/80 leading-relaxed">
              {displayMessage}
            </div>

            {/* Helpful tips based on error type */}
            {isCityError && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="pixel-text-xs text-white/70">
                  💡 TIP: Use autocomplete suggestions or try
                  this format:
                </div>
                <div className="pixel-text-xs text-white/60 mt-1">
                  "City, Country Code" - Example: "London, GB"
                  or "Tokyo, JP"
                </div>
              </div>
            )}

            {isNetworkError && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="pixel-text-xs text-white/70">
                  💡 TIP: Check your internet connection and try
                  again
                </div>
              </div>
            )}

            {isServiceError && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="pixel-text-xs text-white/70">
                  💡 TIP: The weather service is experiencing
                  issues
                </div>
                <div className="pixel-text-xs text-white/60 mt-1">
                  Please try again in a few moments
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-150%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .animate-fadeOut {
          animation: fadeOut 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}