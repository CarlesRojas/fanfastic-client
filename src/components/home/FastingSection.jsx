import { useState, useEffect, useRef, useContext, useCallback } from "react";
import chroma from "chroma-js";
import SVG from "react-inlinesvg";
import cn from "classnames";
import useResize from "../../hooks/useResize";
import ProgressCircle from "./ProgressCircle";
import useThrottle from "../../hooks/useThrottle";
import useGlobalState from "../../hooks/useGlobalState";
import useAutoResetState from "../../hooks/useAutoResetState";

import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";
import { API } from "../../contexts/API";

import BloodPlusIcon from "../../resources/icons/bloodPlus.svg";
import BloodMinusIcon from "../../resources/icons/bloodMinus.svg";
import BloodTickIcon from "../../resources/icons/bloodTick.svg";
import FireIcon from "../../resources/icons/fire.svg";
import LiverIcon from "../../resources/icons/liver.svg";
import CellIcon from "../../resources/icons/cell.svg";

const areSameDate = (date1, date2) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export default function FastingSection() {
    const { user } = useContext(Data);
    const { lerp, sleep } = useContext(Utils);
    const { stopFasting, startFasting } = useContext(API);

    const {
        isFasting,
        fastObjectiveInMinutes,
        lastTimeUserStartedFasting,
        lastTimeUserEndedFasting,
        timezoneOffsetInMs,
        fastDesiredStartTimeInMinutes,
    } = user.current;

    const phases = useRef([
        {
            title: "Blood sugar level rises",
            description: "Your body starts digesting the meal and releases insulin.",
            startTimeInMinutes: 0,
            icon: BloodPlusIcon,
            current: false,
        },
        {
            title: "Blood sugar level drops",
            description: "",
            startTimeInMinutes: 3 * 60,
            icon: BloodMinusIcon,
            current: false,
        },
        {
            title: "Blood sugar level stabilizes",
            description: "Insulin is no longer being produced. Your body is now using up previously stored energy.",
            startTimeInMinutes: 9 * 60,
            icon: BloodTickIcon,
            current: false,
        },
        {
            title: "The fat burning process kicks in!",
            description: "Your body starts burning stored fat in order to turn it into energy.",
            startTimeInMinutes: 11 * 60,
            icon: FireIcon,
            current: false,
        },
        {
            title: "Ketosis has begun!",
            description: "Your body is now turning fat into ketones which in turn, produce energy.",
            startTimeInMinutes: 14 * 60,
            icon: LiverIcon,
            current: false,
        },
        {
            title: "Autophagy is activated!",
            description: "Your body cells have begun to regenerate and recycle.",
            startTimeInMinutes: 16 * 60,
            icon: CellIcon,
            current: false,
        },
    ]);

    // #################################################
    //   COUNTER
    // #################################################

    const [durationCounter, setDurationCounter] = useState(0);
    const [remainingCounter, setRemainingCounter] = useState(0);
    const [remainingUntilFastCounter, setRemainingUntilFastCounter] = useState(0);

    useEffect(() => {
        const timeout = durationCounter > 0 && setTimeout(() => setDurationCounter(durationCounter + 1), 1000 * 60);
        return () => clearTimeout(timeout);
    }, [durationCounter]);

    useEffect(() => {
        const timeout = remainingCounter > 0 && setTimeout(() => setRemainingCounter(remainingCounter - 1), 1000);
        return () => clearTimeout(timeout);
    }, [remainingCounter]);

    useEffect(() => {
        const timeout =
            remainingUntilFastCounter > 0 &&
            setTimeout(() => setRemainingUntilFastCounter(remainingUntilFastCounter - 1), 1000);
        return () => clearTimeout(timeout);
    }, [remainingUntilFastCounter]);

    // #################################################
    //   PROGRESS
    // #################################################

    const [progress, setProgress] = useState(0);

    const recalculateProgress = useCallback(() => {
        if (isFasting) {
            const now = new Date();
            const fastStartTime = new Date(lastTimeUserStartedFasting);
            fastStartTime.setTime(fastStartTime.getTime() - timezoneOffsetInMs);

            const fastDurationInMilliseconds = Math.abs(now - fastStartTime);
            const fastDurationInMinutes = Math.ceil(fastDurationInMilliseconds / 1000 / 60);

            setDurationCounter(fastDurationInMinutes);
            setRemainingCounter(Math.max(0, fastObjectiveInMinutes - fastDurationInMinutes) * 60);
            setProgress(Math.min(100, (fastDurationInMinutes / fastObjectiveInMinutes) * 100));
        } else {
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
                setRemainingUntilFastCounter(Math.max(0, totalNotFastingMinutes - notFastingDurationInMinutes) * 60);
            }

            // Otherwise show time since midnight
            else {
                setProgress(Math.min(100, (minutesSinceMidnight / fastDesiredStartTimeInMinutes) * 100));
                setRemainingUntilFastCounter(Math.max(0, fastDesiredStartTimeInMinutes - minutesSinceMidnight) * 60);
            }
        }
    }, [
        isFasting,
        lastTimeUserStartedFasting,
        lastTimeUserEndedFasting,
        timezoneOffsetInMs,
        fastObjectiveInMinutes,
        fastDesiredStartTimeInMinutes,
    ]);

    useEffect(() => {
        recalculateProgress();

        const interval = setInterval(recalculateProgress, 1000 * 60 * 2);
        return () => clearInterval(interval);
    }, [recalculateProgress]);

    // #################################################
    //   COLOR
    // #################################################

    const chromaScale = useRef(chroma.scale(["#ffa862", "#bdd23f", "#64ad50"]));
    const [color, setColor] = useState(isFasting ? chromaScale.current(0).hex() : "#2a92ec");

    useEffect(() => {
        if (isFasting) setColor(chromaScale.current(progress / 100).hex());
        else setColor("#2a92ec");
    }, [progress, isFasting]);

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
    //   POSITION ICONS
    // #################################################

    const [iconsPosition, setIconsPosition] = useState(phases.current.map(() => ({ x: 0, y: 0 })));

    const updateIcons = useCallback(
        (radius) => {
            var foundCurrent = false;
            const newPositions = phases.current.map(({ startTimeInMinutes }, i) => {
                phases.current[i].percentage = (startTimeInMinutes / fastObjectiveInMinutes) * 100;
                if (!foundCurrent && phases.current[i].percentage > progress) {
                    foundCurrent = true;
                    phases.current[i - 1].current = true;
                }
                phases.current[i].current = i === phases.current.length - 1 && !foundCurrent;

                const rad = (lerp(135, 270 + 135, startTimeInMinutes / fastObjectiveInMinutes) * Math.PI) / 180;
                const y = Math.sin(rad) * radius * 1.3;
                const x = Math.cos(rad) * radius * 1.3;
                return { x, y };
            });

            setIconsPosition(newPositions);
        },
        [fastObjectiveInMinutes, progress, lerp]
    );

    useEffect(() => {
        if (isFasting) updateIcons(progressCircleRadius);
    }, [isFasting, progress, progressCircleRadius, updateIcons]);

    // #################################################
    //   DATES
    // #################################################

    const [startEndDate, setStartEndDate] = useState({ start: "", end: "" });

    useEffect(() => {
        if (isFasting) {
            var startfastingDate = new Date(lastTimeUserStartedFasting);
            startfastingDate.setTime(startfastingDate.getTime() - timezoneOffsetInMs);

            var endfastingDate = new Date(startfastingDate.getTime() + fastObjectiveInMinutes * 60 * 1000);

            const today = new Date();
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            var startDate = "";
            if (areSameDate(startfastingDate, today))
                startDate = `Today, ${startfastingDate.getHours()}:${startfastingDate.getMinutes()}`;
            else if (areSameDate(startfastingDate, yesterday))
                startDate = `Yesterday, ${startfastingDate.getHours()}:${startfastingDate.getMinutes()}`;

            var endDate = "";
            if (areSameDate(endfastingDate, today))
                endDate = `Today, ${endfastingDate.getHours()}:${endfastingDate.getMinutes()}`;
            else if (areSameDate(endfastingDate, tomorrow))
                endDate = `Tomorrow, ${endfastingDate.getHours()}:${endfastingDate.getMinutes()}`;

            setStartEndDate({ start: startDate, end: endDate });
        } else {
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
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            startDate = "";
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

            endDate = "";
            if (areSameDate(fastStartTime, today)) endDate = `Today, ${hours}:${minutes}`;
            else if (areSameDate(fastStartTime, tomorrow)) endDate = `Tomorrow, ${hours}:${minutes}`;

            setStartEndDate({ start: startDate, end: endDate });
        }
    }, [
        isFasting,
        lastTimeUserStartedFasting,
        lastTimeUserEndedFasting,
        timezoneOffsetInMs,
        fastObjectiveInMinutes,
        fastDesiredStartTimeInMinutes,
    ]);

    // #################################################
    //   FADE OUT WHILE CHANGING
    // #################################################

    const [fadedOut, setFadedOut] = useState(false);

    // #################################################
    //   HANDLERS
    // #################################################

    const [error, setError] = useAutoResetState("", 10000);

    const handleStopFasting = useThrottle(async () => {
        setFadedOut(true);
        await sleep(200);

        const result = await stopFasting();
        if ("error" in result) setError(result.error);

        await sleep(200);

        setFadedOut(false);
    }, 2000);

    const handleStartFasting = useThrottle(async () => {
        setFadedOut(true);
        await sleep(200);

        const result = await startFasting();
        if ("error" in result) setError(result.error);

        await sleep(200);

        setFadedOut(false);
    }, 2000);

    // #################################################
    //   USER UPDATED
    // #################################################

    // eslint-disable-next-line
    const [userUpdated] = useGlobalState("userUpdated");

    // #################################################
    //   RENDER
    // #################################################

    const remainingHours = Math.floor(remainingCounter / 3600);
    const remainingUpdatedSeconds = remainingCounter % 3600;
    const remainingMinutes = Math.floor(remainingUpdatedSeconds / 60);
    const remainingSeconds = remainingUpdatedSeconds % 60;

    const remainingUntilFastHours = Math.floor(remainingUntilFastCounter / 3600);
    const remainingUntilFastUpdatedSeconds = remainingUntilFastCounter % 3600;
    const remainingUntilFastMinutes = Math.floor(remainingUntilFastUpdatedSeconds / 60);
    const remainingUntilFastSeconds = remainingUntilFastUpdatedSeconds % 60;

    const durationHours = Math.floor(durationCounter / 60);
    const durationMinutes = durationCounter % 60;

    const currentPhase = phases.current.find(({ current }) => current);

    return (
        <div className={cn("FastSection", { fadedOut })} ref={containerRef}>
            <h1>{isFasting ? "Fasting" : "Breaking fast"}</h1>

            <div className={"progressBarContainer"}>
                <ProgressCircle
                    progress={progress}
                    radius={progressCircleRadius}
                    cut={90}
                    rotate={135}
                    strokeColor={color}
                    trackStrokeColor={color}
                >
                    {isFasting ? (
                        <div className={"insideProgress"}>
                            <p>Remaining</p>
                            <div className="counter">
                                <p>{remainingHours < 10 ? `0${remainingHours}` : remainingHours}</p>
                                <p className={"colon"}>:</p>
                                <p>{remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes}</p>
                                <p className={"colon seconds"}>:</p>
                                <p className={" seconds"}>
                                    {remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
                                </p>
                            </div>
                            <p className="subtitle">{`Fasting for ${durationHours}h ${durationMinutes}m`}</p>

                            {phases.current.map(
                                ({ icon, current }, i) =>
                                    phases.current[i].percentage <= 100 && (
                                        <div
                                            className={cn(
                                                "phaseIconContainer",
                                                { notYet: phases.current[i].percentage > progress },
                                                { current }
                                            )}
                                            style={{
                                                backgroundColor: color,
                                                transform: `translate3d(${iconsPosition[i].x}px,${iconsPosition[i].y}px,0)`,
                                            }}
                                            key={i}
                                        >
                                            <SVG className={"phaseIcon"} src={icon} style={{ color }} />
                                        </div>
                                    )
                            )}
                        </div>
                    ) : (
                        <div className={"insideProgress"}>
                            <p>Breaking Fast</p>
                            <div className="counter">
                                <p>
                                    {remainingUntilFastHours < 10
                                        ? `0${remainingUntilFastHours}`
                                        : remainingUntilFastHours}
                                </p>
                                <p className={"colon"}>:</p>
                                <p>
                                    {remainingUntilFastMinutes < 10
                                        ? `0${remainingUntilFastMinutes}`
                                        : remainingUntilFastMinutes}
                                </p>
                                <p className={"colon seconds"}>:</p>
                                <p className={" seconds"}>
                                    {remainingUntilFastSeconds < 10
                                        ? `0${remainingUntilFastSeconds}`
                                        : remainingUntilFastSeconds}
                                </p>
                            </div>
                        </div>
                    )}
                </ProgressCircle>
            </div>

            {isFasting ? (
                <div className="button" style={{ backgroundColor: color }} onClick={handleStopFasting}>
                    {"End Fasting"}
                </div>
            ) : (
                <div className="button" style={{ backgroundColor: color }} onClick={handleStartFasting}>
                    {"Start Fasting"}
                </div>
            )}

            <div className={cn("error", { visible: error !== "" })}>{error}</div>

            {isFasting ? (
                <div className="startEnd">
                    <div className="start">
                        <p>start</p>
                        <p className="date">{startEndDate.start}</p>
                    </div>
                    <div className="end">
                        <p>end</p>
                        <p className="date">{startEndDate.end}</p>
                    </div>
                </div>
            ) : (
                <div className="startEnd">
                    <div className="start">
                        <p>from</p>
                        <p className="date">{startEndDate.start}</p>
                    </div>
                    <div className="end">
                        <p>until</p>
                        <p className="date">{startEndDate.end}</p>
                    </div>
                </div>
            )}

            {isFasting && currentPhase && (
                <div className="phase">
                    <SVG className={"phaseIcon"} src={currentPhase.icon} />
                    <div className="info">
                        <h2>{currentPhase.title}</h2>
                        <p>{currentPhase.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
