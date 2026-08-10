"use client"
import { useState, useEffect } from "react";
import { Clock, ChevronDown, Star } from "lucide-react";

export function WaitlistTimerSection() {
  return (
    <div>
      <div className="space-y-2">
        <label className="text-[11px] font-semibold tracking-widest uppercase text-black/50">
          Beauty Categories
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["Makeup", "Hijab Styling", "Bridal", "Photoshoot"].map((category) => (
            <label key={category} className="label-class">
              {category}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
