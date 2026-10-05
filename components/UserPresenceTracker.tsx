"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { rawBackendUrl } from "@/lib/axiosInstance";

export function UserPresenceTracker() {
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initPresence = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const user = await res.json();
        if (!user?.id || !isMounted) return;

        const socketUrl =
          typeof window !== "undefined" && window.location.hostname !== "localhost"
            ? window.location.origin
            : rawBackendUrl;

        const socket = io(`${socketUrl}/users`, {
          auth: { userId: user.id },
          query: { userId: String(user.id) },
          transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("identify", { userId: user.id });
        });

        // Periodic heartbeat every 45 seconds to keep lastActiveAt fresh
        intervalRef.current = setInterval(() => {
          if (socket.connected) {
            socket.emit("heartbeat");
          }
        }, 45000);

        // Disconnect gracefully on beforeunload
        const handleUnload = () => {
          socket.disconnect();
        };
        window.addEventListener("beforeunload", handleUnload);

        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          window.removeEventListener("beforeunload", handleUnload);
          socket.disconnect();
        };
      } catch (err) {
        console.error("[UserPresenceTracker] Initialization error:", err);
      }
    };

    const cleanupPromise = initPresence();

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      cleanupPromise.then((cleanup) => {
        if (typeof cleanup === "function") cleanup();
      });
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return null;
}
