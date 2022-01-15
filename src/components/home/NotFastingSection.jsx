import { useState, useEffect, useRef, useContext, useCallback } from "react";
import useResize from "../../hooks/useResize";
import ProgressCircle from "./ProgressCircle";
import useThrottle from "../../hooks/useThrottle";

import { Data } from "../../contexts/Data";
import { API } from "../../contexts/API";

const areSameDate = (date1, date2) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export default function NotFastingSection() {
    const { user } = useContext(Data);
    const { startFasting } = useContext(API);

    const { fastObjectiveInMinutes, lastTimeUserEndedFasting, timezoneOffsetInMs, fastDesiredStartTimeInMinutes } =
        user.current;

    // #################################################
    //   COUNTER
    // #################################################

    const [remainingCounter, setRemainingCounter] = useState(0);

    useEffect(() => {
        const timeout = remainingCounter > 0 && setTimeout(() => setRemainingCounter(remainingCounter - 1), 1000);
        return () => clearTimeout(timeout);
    }, [remainingCounter]);

    // #################################################
    //   PROGRESS
    // #################################################

    const [progress, setProgress] = useState(0);

    const recalculateProgress = useCallback(() => {
        const now = new Date(); // Make const
        const fastEndTime = new Date(lastTimeUserEndedFasting);
        fastEndTime.setTime(fastEndTime.getTime() - timezoneOffsetInMs);
        const notFastingDurationInMilliseconds = Math.abs(now - fastEndTime);
        const notFastingDurationInMinutes = Math.ceil(notFastingDurationInMilliseconds / 1000 / 60);

        const midnight = new Date(now);
        midnight.setHours(0);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        const millisecondsSinceMidnight = Math.abs(now - midnight);
        const minutesSinceMidnight = Math.ceil(millisecondsSinceMidnight / 1000 / 60);

        // If it has been less than 23h since user stoped fasting show time since then
        if (notFastingDurationInMinutes < 23 * 60) {
            const yesterdayNotFastingMinutes =
                minutesSinceMidnight > notFastingDurationInMinutes
                    ? 0
                    : Math.abs(notFastingDurationInMinutes - minutesSinceMidnight);

            const totalNotFastingMinutes =
                minutesSinceMidnight > notFastingDurationInMinutes
                    ? minutesSinceMidnight > fastDesiredStartTimeInMinutes
                        ? Math.abs(24 * 60 - minutesSinceMidnight) +
                          notFastingDurationInMinutes +
                          fastDesiredStartTimeInMinutes
                        : fastDesiredStartTimeInMinutes - minutesSinceMidnight + notFastingDurationInMinutes
                    : yesterdayNotFastingMinutes + fastDesiredStartTimeInMinutes;

            setProgress(Math.min(100, (notFastingDurationInMinutes / totalNotFastingMinutes) * 100));
            setRemainingCounter(Math.max(0, totalNotFastingMinutes - notFastingDurationInMinutes) * 60);
        }

        // Otherwise show time since midnight
        else {
            setProgress(Math.min(100, (minutesSinceMidnight / fastDesiredStartTimeInMinutes) * 100));
            setRemainingCounter(Math.max(0, fastDesiredStartTimeInMinutes - minutesSinceMidnight) * 60);
        }
    }, [lastTimeUserEndedFasting, timezoneOffsetInMs, fastDesiredStartTimeInMinutes]);

    const firstRun = useRef(true);
    useEffect(() => {
        if (!firstRun.current) return;
        firstRun.current = false;

        recalculateProgress();

        const interval = setInterval(recalculateProgress, 1000 * 60 * 2);
        return () => clearInterval(interval);
    }, [recalculateProgress]);

    // #################################################
    //   RESIZE
    // #################################################

    const containerRef = useRef();
    const [progressCircleRadius, setProgressCircleRadius] = useState(200);

    const handleResize = () => {
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        setProgressCircleRadius(Math.min(160, (containerWidth * 0.65) / 2));
    };
    useResize(handleResize, true);

    // #################################################
    //   DATES TODO
    // #################################################

    const [startEndDate, setStartEndDate] = useState({ start: "", end: "" });

    useEffect(() => {
        const now = new Date();
        const fastEndTime = new Date(lastTimeUserEndedFasting);
        fastEndTime.setTime(fastEndTime.getTime() - timezoneOffsetInMs);
        const notFastingDurationInMilliseconds = Math.abs(now - fastEndTime);
        const notFastingDurationInMinutes = Math.ceil(notFastingDurationInMilliseconds / 1000 / 60);

        const midnight = new Date(now);
        midnight.setHours(0);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        const millisecondsSinceMidnight = Math.abs(now - midnight);
        var minutesSinceMidnight = Math.ceil(millisecondsSinceMidnight / 1000 / 60);

        const today = new Date();
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        var startDate = "";
        if (notFastingDurationInMinutes < 23 * 60) {
            var hours = fastEndTime.getHours();
            hours = hours < 10 ? `0${hours}` : hours;
            var minutes = fastEndTime.getMinutes();
            minutes = minutes < 10 ? `0${minutes}` : minutes;

            if (areSameDate(fastEndTime, today)) startDate = `Today, ${hours}:${minutes}`;
            else if (areSameDate(fastEndTime, yesterday)) startDate = `Yesterday, ${hours}:${minutes}`;
        } else {
            startDate = `Today, 00:00`;
        }

        var fastStartTime =
            minutesSinceMidnight > fastDesiredStartTimeInMinutes
                ? new Date(midnight.getTime() + (fastDesiredStartTimeInMinutes * 60 * 1000 + 24 * 60 * 60 * 1000))
                : new Date(midnight.getTime() + fastDesiredStartTimeInMinutes * 60 * 1000);

        hours = fastStartTime.getHours();
        hours = hours < 10 ? `0${hours}` : hours;
        minutes = fastStartTime.getMinutes();
        minutes = minutes < 10 ? `0${minutes}` : minutes;

        var endDate = "";
        if (areSameDate(fastStartTime, today)) endDate = `Today, ${hours}:${minutes}`;
        else if (areSameDate(fastStartTime, tomorrow)) endDate = `Tomorrow, ${hours}:${minutes}`;

        setStartEndDate({ start: startDate, end: endDate });
    }, [lastTimeUserEndedFasting, timezoneOffsetInMs, fastObjectiveInMinutes, fastDesiredStartTimeInMinutes]);

    // #################################################
    //   HANDLERS
    // #################################################

    const handleStartFasting = useThrottle(async () => {
        await startFasting();
    }, 2000);

    // #################################################
    //   RENDER
    // #################################################

    const color = "#2a92ec";

    const remainingHours = Math.floor(remainingCounter / 3600);
    const remainingUpdatedSeconds = remainingCounter % 3600;
    const remainingMinutes = Math.floor(remainingUpdatedSeconds / 60);
    const remainingSeconds = remainingUpdatedSeconds % 60;

    return (
        <div className={"FastSection"} ref={containerRef}>
            <h1>{"Breaking fast"}</h1>

            <div className={"progressBarContainer"}>
                <ProgressCircle
                    progress={progress}
                    radius={progressCircleRadius}
                    cut={90}
                    rotate={135}
                    strokeColor={color}
                    trackStrokeColor={color}
                >
                    <div className={"insideProgress"}>
                        <p>Breaking Fast</p>
                        <div className="counter">
                            <p>{remainingHours < 10 ? `0${remainingHours}` : remainingHours}</p>
                            <p className={"colon"}>:</p>
                            <p>{remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes}</p>
                            <p className={"colon seconds"}>:</p>
                            <p className={" seconds"}>
                                {remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
                            </p>
                        </div>
                    </div>
                </ProgressCircle>
            </div>

            <div className="button" style={{ backgroundColor: color }} onClick={handleStartFasting}>
                {"Start Fasting"}
            </div>

            <div className="startEnd">
                {startEndDate.start ? (
                    <div className="start">
                        <p>from</p>
                        <p className="date">{startEndDate.start}</p>
                    </div>
                ) : (
                    <div></div>
                )}
                <div className="end">
                    <p>until</p>
                    <p className="date">{startEndDate.end}</p>
                </div>
            </div>
        </div>
    );
}
