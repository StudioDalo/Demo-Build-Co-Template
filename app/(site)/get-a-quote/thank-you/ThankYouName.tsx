"use client";
import { useEffect, useState } from "react";
import { THANKS_KEY } from "@/lib/tracking/thanks";

export function ThankYouName() {
  const [name, setName] = useState("");
  useEffect(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(THANKS_KEY) || "null");
      if (v?.name) setName(String(v.name).split(" ")[0]);
    } catch {}
  }, []);
  return name ? <>, {name}</> : null;
}
