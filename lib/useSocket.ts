"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

let shared: Socket | null = null;

/** One socket per tab, shared across screens so a lobby survives navigation. */
export function getSocket(): Socket {
  if (!shared) {
    shared = io({ path: "/api/socket", transports: ["websocket", "polling"] });
  }
  return shared;
}

export function useSocket() {
  const ref = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  if (!ref.current && typeof window !== "undefined") ref.current = getSocket();

  useEffect(() => {
    const s = ref.current;
    if (!s) return;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    setConnected(s.connected);
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket: ref.current, connected };
}
