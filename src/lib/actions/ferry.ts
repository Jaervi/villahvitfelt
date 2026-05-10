"use server";

import { unstable_cache } from "next/cache";

const URLS = {
  weekday: "https://www.finferries.fi/koodiviidakko/aikataulu/parainen-nauvo-kesa-ma-pe-1.5-30.9.2026.html",
  saturday: "https://www.finferries.fi/koodiviidakko/aikataulu/parainen-nauvo-kesa-la-1.5-30.9.2026.html",
  sunday: "https://www.finferries.fi/koodiviidakko/aikataulu/parainen-nauvo-kesa-su-1.5-30.9.2026.html",
};

export interface Timetable {
  parainen: string[];
  nauvo: string[];
}

export interface FullSchedule {
  weekday: Timetable;
  saturday: Timetable;
  sunday: Timetable;
}

// Extract times using Regex (matches "15:30" or "00:15")
function parseHtmlToTimes(html: string): Timetable {
  // Use more specific markers to avoid splitting at navigation links
  // The web_fetch shows these are usually <h4> or #### headers
  const parainenMarker = "Parainen / Pargas";
  const nauvoMarker = "Nauvo / Nagu";

  const parainenIndex = html.lastIndexOf(parainenMarker);
  const nauvoIndex = html.lastIndexOf(nauvoMarker);

  let parainenSection = "";
  let nauvoSection = "";

  if (parainenIndex !== -1 && nauvoIndex !== -1) {
    if (parainenIndex < nauvoIndex) {
      // Parainen usually comes first in the schedule
      parainenSection = html.substring(parainenIndex, nauvoIndex);
      nauvoSection = html.substring(nauvoIndex);
    } else {
      nauvoSection = html.substring(nauvoIndex, parainenIndex);
      parainenSection = html.substring(parainenIndex);
    }
  }

  // Regex for HH:MM
  const timeRegex = /([0-2][0-9]:[0-5][0-9])/g;

  const extractTimes = (text: string) => {
    const matches = Array.from(text.matchAll(timeRegex));
    const times = matches.map((match) => match[1]);
    return Array.from(new Set(times)).sort();
  };

  const parainen = extractTimes(parainenSection);
  const nauvo = extractTimes(nauvoSection);

  console.log(`[FERRY PARSER] Extracted ${parainen.length} for Parainen, ${nauvo.length} for Nauvo`);

  return { parainen, nauvo };
}

export const getFerrySchedule = unstable_cache(
  async (): Promise<FullSchedule | null> => {
    try {
      // Use no-cache for the fetch itself to let unstable_cache handle revalidation
      const [weekdayRes, saturdayRes, sundayRes] = await Promise.all([
        fetch(URLS.weekday, { cache: 'no-store' }),
        fetch(URLS.saturday, { cache: 'no-store' }),
        fetch(URLS.sunday, { cache: 'no-store' }),
      ]);

      if (!weekdayRes.ok || !saturdayRes.ok || !sundayRes.ok) {
        throw new Error("Failed to fetch ferry data");
      }

      const weekdayHtml = await weekdayRes.text();
      const saturdayHtml = await saturdayRes.text();
      const sundayHtml = await sundayRes.text();

      return {
        weekday: parseHtmlToTimes(weekdayHtml),
        saturday: parseHtmlToTimes(saturdayHtml),
        sunday: parseHtmlToTimes(sundayHtml),
      };
    } catch (error) {
      console.error("Ferry fetch error:", error);
      return null;
    }
  },
  ["ferry-schedule"],
  { revalidate: 3600 } // Cache for 1 hour
);
