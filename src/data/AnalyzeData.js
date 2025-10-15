import {create} from "zustand";
import {combine, persist} from "zustand/middleware";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

export const Periods = {
    Yearly: {
        display: "Yearly",
        duration: dayjs.duration(1, "years")
    },
    Monthly: {
        display: "Monthly",
        duration: dayjs.duration(1, "months")
    },
    BiWeekly: {
        display: "Bi-Weekly",
        duration: dayjs.duration(2, "weeks")
    }
}
export function getPeriodDuration(display){
    return Object.values(Periods).find((period) => period.display === display).duration
}

export const useAnalyzeData = create(persist(combine(
    {
        period: Periods.Monthly.display,
        periodStart: null
    },
    (set, get) => ({
        setPeriod(period){
            if(typeof period === "object") period = period.display
            set({period: period})
        },
        setPeriodStart(date){
            set({periodStart: date})
        }
    })),
    {
        name: "analyze-data"
    }
));