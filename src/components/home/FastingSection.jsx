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
import { GlobalState } from "../../contexts/GlobalState";

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
    const { set } = useContext(GlobalState);

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
            subtitle: "Your body starts digesting the meal and releases insulin.",
            titleInfo: "Blood sugar level rises",
            subtitleInfo: "Begins right after your meal",
            description: [
                "Your body starts the digestion process immediately after food intake. Ingested carbohydrates are being processed and released into the bloodstream as glucose (sugar). This increases the blood glucose level. As a result, your blood sugar level rises. This in turn causes your body to start producing insulin. This hormone has two important functions:",
                "Firstly, it stimulates the absorption of blood sugar(glucose) into the tissues for a quick supply of energy, immediately after eating.",
                "Secondly, it stores energy - usually, the body does not need all the energy that is being released through excessive consumption of carbohydrates or sugar. For this reason, insulin stimulates the conversion of glucose into its storage form, glycogen.",
                "Glycogen is stored in your liver and muscles, only to be released when energy is needed again. Once the glycogen stores are full, the excess glycogen is stored in your fatty tissue in the form of fat.",
            ],
            startTimeInMinutes: 0,
            icon: BloodPlusIcon,
            current: false,
            index: 0,
        },
        {
            title: "Blood sugar level drops",
            subtitle: "",
            titleInfo: "Blood sugar level drops",
            subtitleInfo: "Begins 3h after your last meal",
            description: [
                "Insulin transports the glucose in the blood to our cell sand tissues. As a result, the level of glucose in the blood drops and the blood sugar level drops again.",
                "Whilst the hormone insulin is in our circulation, the cells are poised to absorb energy. During this time, and as long as glucose is in our blood and glycogen in our muscles or liver, fat is not used as a primary source of energy.",
                "Our body switches to energy production from fat once the glucose in our blood has been depleted and the glycogen reserves are used up.",
            ],
            startTimeInMinutes: 3 * 60,
            icon: BloodMinusIcon,
            current: false,
            index: 1,
        },
        {
            title: "Blood sugar level stabilizes",
            subtitle: "Insulin is no longer being produced. Your body is now using up previously stored energy.",
            titleInfo: "Blood sugar level settles down",
            subtitleInfo: "Begins 9h after your last meal",
            description: [
                "After the food has been digested and our body has stopped producing insulin, there is a brief resting period. However, this state does not last long, because our organs, muscles and cognitive processes are continuously consuming energy. A new player enters the ﬁeld of hormones: glucagon.",
                "As soon as our blood sugar level drops, the body has to react. Glucagon's task is to release the previously stored glycogen back into the bloodstream. With this, your blood sugar level remains constant, and energy supply is ensured.",
            ],
            startTimeInMinutes: 9 * 60,
            icon: BloodTickIcon,
            current: false,
            index: 2,
        },
        {
            title: "The fat burning process kicks in!",
            subtitle: "Your body starts burning stored fat in order to turn it into energy.",
            titleInfo: "Fat burning",
            subtitleInfo: "Begins 11h after your last meal",
            description: [
                "The unending energy needs of your body are taking their toll. Even the energy reserves from the previously stored glycogen are soon exhausted. Now it is time to fall back on a larger resource: your fat reserves. The average calorie supply of an adult person in the form of fat reserves amounts to about 80,000 calories.",
                "In order to tap into these reserves, your body starts producing fat-burning hormones. An impressive 6 hormones are involved in this vital mechanism. These hormones perform more or less the same function of fat metabolism.",
            ],
            startTimeInMinutes: 11 * 60,
            icon: FireIcon,
            current: false,
            index: 3,
        },
        {
            title: "Ketosis has begun!",
            subtitle: "Your body is now turning fat into ketones which in turn, produce energy.",
            titleInfo: "Ketosis",
            subtitleInfo: "Begins 14-16h after your last meal",
            description: [
                "After your army of fat-metabolising hormones has set to work and providing your body with new energy, something interesting happens. Ketones are produced in the liver as a by-product of fat burning. This process begins 14-16 hours after your last meal, and increases in intensity depending on how long you fast.",
                "Ketones are fatty acid molecules that are formed when fat cells are broken down. They are known to provide energy to the heart, brain and vital organs.",
                "Ketones activate your nerve cells, strengthen intellectual capacity and develop new cells from your brain's stem cells. They are the reason why you may feel particularly concentrated and productive during the fasting period.",
                "Pro-tip: Remember, there really can be too much of a good thing. For optimal results, we recommend fasting for around 16 hours, with occasional longer challenges. The most important is that fasting works for you - so be sure to always listen to your body.",
            ],
            startTimeInMinutes: 14 * 60,
            icon: LiverIcon,
            current: false,
            index: 4,
        },
        {
            title: "Autophagy is activated!",
            subtitle: "Your body cells have begun to regenerate and recycle.",
            titleInfo: "Autophagy",
            subtitleInfo: "Begins around 16h after your last meal",
            description: [
                "Introducing, autophagy! A process kick-started by a longer fast and fat-burning, autophagy comes into play after around 16 hours of fasting.",
                "An interesting word with an even more fascinating function. Autophagy is translated from the ancient Greek 'autóphagos', meaning 'to consume oneself.' This is exactly what happens during autophagy. Your cells begin to process 'themselves'.",
                "Old cell components and so-called 'misfolded' proteins are recycled during this phase. Not only are they recycled, but they are completely renewed.",
                "Your body undergoes a big clear out and proper cleanup. This not only makes your cells more efficient, it also prolongs the life of your cells and with that, your own.",
                "Pro-tip: Remember, there really can be too much of a good thing. For optimal results, we recommend fasting for around 16 hours, with occasional longer challenges. The most important is that fasting works for you - so be sure to always listen to your body.",
            ],
            startTimeInMinutes: 16 * 60,
            icon: CellIcon,
            current: false,
            index: 5,
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
    const [color, setColor] = useState(isFasting ? chromaScale.current(0).hex() : "#4faaff");

    useEffect(() => {
        if (isFasting) setColor(chromaScale.current(progress / 100).hex());
        else setColor("#4faaff");
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
    //   HANDLERS
    // #################################################

    const [fadedOut, setFadedOut] = useState(false);
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

    const showPhaseInfo = (phaseI) => {
        if (phaseI < 0 || phaseI >= phases.current.length) return;

        const { icon, titleInfo, subtitleInfo, description } = phases.current[phaseI];

        set("showPopup", {
            show: true,
            content: (
                <div className="scroll">
                    <div className="header">
                        <SVG src={icon} className="icon"></SVG>

                        <div className="title">
                            <h1>{titleInfo}</h1>
                            <h2>{subtitleInfo}</h2>
                        </div>
                    </div>

                    {description.map((text, i) => (
                        <p key={i}>{text}</p>
                    ))}
                </div>
            ),
        });
    };

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
                                            onClick={() => showPhaseInfo(i)}
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
                <div className="phase" onClick={() => showPhaseInfo(currentPhase.index)}>
                    <SVG className={"phaseIcon"} src={currentPhase.icon} />
                    <div className="info">
                        <h2>{currentPhase.title}</h2>
                        <p>{currentPhase.subtitle}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
