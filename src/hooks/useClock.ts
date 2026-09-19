import { useState, useEffect } from "react";

export function useClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = (() => {
    const off = -now.getTimezoneOffset();
    const h = Math.floor(Math.abs(off) / 60);
    const m = Math.abs(off) % 60;
    const sign = off >= 0 ? "+" : "-";
    return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();

  return { time, timezone, offset };
}
