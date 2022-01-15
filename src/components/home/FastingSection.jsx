import { useState, useEffect, useRef, useContext, useCallback } from "react";
import chroma from "chroma-js";
import SVG from "react-inlinesvg";
import cn from "classnames";
import useResize from "../../hooks/useResize";
import ProgressCircle from "./ProgressCircle";
import useThrottle from "../../hooks/useThrottle";

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
    const { lerp } = useContext(Utils);
    const { stopFasting } = useContext(API);

    const { fastObjectiveInMinutes, lastTimeUserStartedFasting, timezoneOffsetInMs } = user.current;

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

    useEffect(() => {
        const timeout = durationCounter > 0 && setTimeout(() => setDurationCounter(durationCounter + 1), 1000 * 60);
        return () => clearTimeout(timeout);
    }, [durationCounter]);

    useEffect(() => {
        const timeout = remainingCounter > 0 && setTimeout(() => setRemainingCounter(remainingCounter - 1), 1000);
        return () => clearTimeout(timeout);
    }, [remainingCounter]);

    // #################################################
    //   PROGRESS
    // #################################################

    const [progress, setProgress] = useState(0);

    const recalculateProgress = useCallback(() => {
        const now = new Date();
        const fastStartTime = new Date(lastTimeUserStartedFasting);
        fastStartTime.setTime(fastStartTime.getTime() - timezoneOffsetInMs);

        const fastDurationInMilliseconds = Math.abs(now - fastStartTime);
        const fastDurationInMinutes = Math.ceil(fastDurationInMilliseconds / 1000 / 60);

        setDurationCounter(fastDurationInMinutes);
        setRemainingCounter(Math.max(0, fastObjectiveInMinutes - fastDurationInMinutes) * 60);
        setProgress(Math.min(100, (fastDurationInMinutes / fastObjectiveInMinutes) * 100));
    }, [lastTimeUserStartedFasting, timezoneOffsetInMs, fastObjectiveInMinutes]);

    const firstRun = useRef(true);
    useEffect(() => {
        if (!firstRun.current) return;
        firstRun.current = false;

        recalculateProgress();

        const interval = setInterval(recalculateProgress, 1000 * 60 * 2);
        return () => clearInterval(interval);
    }, [recalculateProgress]);

    // #################################################
    //   COLOR
    // #################################################

    const chromaScale = useRef(chroma.scale(["#ffa862", "#bdd23f", "#64ad50"]));
    const [color, setColor] = useState(chromaScale.current(0).hex());

    useEffect(() => {
        setColor(chromaScale.current(progress / 100).hex());
    }, [progress]);

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
        updateIcons(progressCircleRadius);
    }, [progress, progressCircleRadius, updateIcons]);

    // #################################################
    //   DATES
    // #################################################

    const [startEndDate, setStartEndDate] = useState({ start: "", end: "" });

    useEffect(() => {
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
    }, [lastTimeUserStartedFasting, timezoneOffsetInMs, fastObjectiveInMinutes]);

    // #################################################
    //   HANDLERS
    // #################################################

    const handleStopFasting = useThrottle(async () => {
        await stopFasting();
    }, 2000);

    // #################################################
    //   RENDER
    // #################################################

    const remainingHours = Math.floor(remainingCounter / 3600);
    const remainingUpdatedSeconds = remainingCounter % 3600;
    const remainingMinutes = Math.floor(remainingUpdatedSeconds / 60);
    const remainingSeconds = remainingUpdatedSeconds % 60;

    const durationHours = Math.floor(durationCounter / 60);
    const durationMinutes = durationCounter % 60;

    const currentPhase = phases.current.find(({ current }) => current);

    return (
        <div className={"FastSection"} ref={containerRef}>
            <h1>{"Fasting"}</h1>

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
                </ProgressCircle>
            </div>

            <div className="button" style={{ backgroundColor: color }} onClick={handleStopFasting}>
                {"End Fasting"}
            </div>

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

            {currentPhase && (
                <div className="phase">
                    <h2>{currentPhase.title}</h2>
                    <p>{currentPhase.description}</p>
                </div>
            )}
        </div>
    );
}
