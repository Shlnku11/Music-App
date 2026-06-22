import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { PurchaseProvider } from "./context/PurchaseContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { PlaylistsProvider } from "./context/PlaylistsContext.jsx";
import { HistoryProvider } from "./context/HistoryContext.jsx";
import { PlaylistModalProvider } from "./context/PlaylistModalContext.jsx";
import { PremiumProvider } from "./context/PremiumContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <PlaylistsProvider>
          <PlaylistModalProvider>
            <HistoryProvider>
              <PurchaseProvider>
                <PlayerProvider>
                  <PremiumProvider>
                    <App />
                  </PremiumProvider>
                </PlayerProvider>
              </PurchaseProvider>
            </HistoryProvider>
          </PlaylistModalProvider>
        </PlaylistsProvider>
      </FavoritesProvider>
    </AuthProvider>
  </StrictMode>
);