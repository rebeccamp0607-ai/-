"use client";

import { useGameStore } from "@/lib/store";
import StatusBar from "@/components/ui/StatusBar";
import HomeScreen from "@/components/screens/HomeScreen";
import BaziInputScreen from "@/components/screens/BaziInputScreen";
import WorldSelectScreen from "@/components/screens/WorldSelectScreen";
import GenesisScreen from "@/components/screens/GenesisScreen";
import GameDayScreen from "@/components/screens/GameDayScreen";
import GameNightScreen from "@/components/screens/GameNightScreen";

export default function App() {
  const { screen } = useGameStore();
  const showStatusBar = ["game-day", "game-night"].includes(screen);

  return (
    <>
      {showStatusBar && <StatusBar />}
      {screen === "home"          && <HomeScreen />}
      {screen === "bazi-input"    && <BaziInputScreen />}
      {screen === "world-select"  && <WorldSelectScreen />}
      {screen === "genesis-input" && <GenesisScreen />}
      {screen === "game-day"      && <GameDayScreen />}
      {screen === "game-night"    && <GameNightScreen />}
    </>
  );
}
