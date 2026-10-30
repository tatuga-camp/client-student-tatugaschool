import { useEffect, useState } from "react";
import {
  dayPeriod,
  DayPeriod,
  SCENE_PALETTES,
  ScenePalette,
} from "../utils/timeOfDay";

type TimeOfDay = { period: DayPeriod; palette: ScenePalette };

// Returns null until mounted, so server and first client render match.
export function useTimeOfDay(): TimeOfDay | null {
  const [value, setValue] = useState<TimeOfDay | null>(null);

  useEffect(() => {
    const update = () => {
      const period = dayPeriod(new Date());
      setValue((prev) =>
        prev?.period === period
          ? prev
          : { period, palette: SCENE_PALETTES[period] },
      );
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return value;
}
