"use client";

import { useEffect, useState } from "react";
import type { SavedScript } from "../types";

const SCRIPT_LIBRARY_STORAGE_KEY = "dailyos-script-library";

export function useScriptLibrary() {
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [libraryMessage, setLibraryMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(SCRIPT_LIBRARY_STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as SavedScript[];
      if (Array.isArray(parsed)) {
        setSavedScripts(parsed);
      }
    } catch {
      setLibraryMessage("無法讀取腳本庫，請稍後再試。");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      SCRIPT_LIBRARY_STORAGE_KEY,
      JSON.stringify(savedScripts)
    );
  }, [savedScripts]);

  return {
    savedScripts,
    setSavedScripts,
    libraryMessage,
    setLibraryMessage
  };
}
