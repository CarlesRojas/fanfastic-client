import { useState, useEffect, useRef, useContext, useCallback } from "react";
import chroma from "chroma-js";
import SVG from "react-inlinesvg";
import cn from "classnames";
import useResize from "../../hooks/useResize";
import ProgressCircle from "./ProgressCircle";

import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";

import BloodPlusIcon from "../../resources/icons/bloodPlus.svg";
import BloodMinusIcon from "../../resources/icons/bloodMinus.svg";
import BloodTickIcon from "../../resources/icons/bloodTick.svg";
import FireIcon from "../../resources/icons/fire.svg";
import LiverIcon from "../../resources/icons/liver.svg";
import CellIcon from "../../resources/icons/cell.svg";

export default function FastSection() {
    const { user } = useContext(Data);
    const { lerp } = useContext(Utils);

    const { isFasting, fastObjectiveInMinutes, lastTimeUserStartedFasting, timezoneOffsetInMs } = user.current;

    const phases = useRef([
        {
            name: "",
            description: "",
            startTimeInMinutes: 0,
            icon: BloodPlusIcon,
        },
        {
            name: "",
            description: "",
            startTimeInMinutes: 3 * 60,
            icon: BloodMinusIcon,
        },
        {
            name: "",
            description: "",
            startTimeInMinutes: 9 * 60,
            icon: BloodTickIcon,
        },
        {
            name: "",
            description: "",
            startTimeInMinutes: 11 * 60,
            icon: FireIcon,
        },
        {
            name: "",
            description: "",
            startTimeInMinutes: 14 * 60,
            icon: LiverIcon,
        },
        {
            name: "",
            description: "",
            startTimeInMinutes: 16 * 60,
            icon: CellIcon,
        },
    ]);

    // #################################################
    //   PROGRESS
    // #################################################

    const [progress, setProgress] = useState(80);

    const recalculateProgress = useCallback(() => {
        const now = new Date();
        const fastStartTime = new Date(lastTimeUserStartedFasting);
        fastStartTime.setTime(fastStartTime.getTime() - timezoneOffsetInMs);

        const fastDurationInMilliseconds = Math.abs(now - fastStartTime);
        const fastDurationInMinutes = Math.ceil(fastDurationInMilliseconds / 1000 / 60);

        setProgress((fastDurationInMinutes / fastObjectiveInMinutes) * 100);
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
        setProgressCircleRadius(Math.min(200, (containerWidth * 0.65) / 2));
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
    //   DELETE
    // #################################################

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setProgress((prev) => (prev + 10) % 100);
    //     }, 500);
    //     return () => clearInterval(interval);
    // }, []);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={"FastSection"} ref={containerRef}>
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
                        <p>{Math.round(progress)}%</p>

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
        </div>
    );
}
