import { useState, useEffect, useRef, useContext, useCallback } from "react";
import SVG from "react-inlinesvg";
import chroma from "chroma-js";
import useResize from "../../hooks/useResize";
import useGlobalState from "../../hooks/useGlobalState";
import ProgressLine from "./ProgressLine";
import UpdateWeightPopup from "./UpdateWeightPopup";
import UpdateWeightObjectivePopup from "./UpdateWeightObjectivePopup";

import WeightIcon from "../../resources/icons/weight.svg";
import BMIIcon from "../../resources/icons/bmi.svg";
import HeightIcon from "../../resources/icons/height.svg";

import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";
import { GlobalState } from "../../contexts/GlobalState";

export default function WeightSection() {
    const { user } = useContext(Data);
    const { invlerp, areSameDate } = useContext(Utils);
    const { set } = useContext(GlobalState);

    const {
        weightInKg,
        heightInCm,
        startingWeightObjectiveInKg,
        weightObjectiveInKg,
        lastTimeUserEnteredWeight,
        timezoneOffsetInMs,
    } = user.current;

    // #################################################
    //   PROGRESS
    // #################################################

    const [progress, setProgress] = useState(50);

    const recalculateProgress = useCallback(() => {
        setProgress(invlerp(startingWeightObjectiveInKg, weightObjectiveInKg, weightInKg) * 100);
    }, [invlerp, startingWeightObjectiveInKg, weightObjectiveInKg, weightInKg]);

    useEffect(() => {
        recalculateProgress();

        const interval = setInterval(recalculateProgress, 1000 * 60 * 2);
        return () => clearInterval(interval);
    }, [recalculateProgress]);

    // #################################################
    //   UPDATE WEIGHT
    // #################################################

    const [canUpdateWeight, setCanUpdateWeight] = useState(true);

    const updateWeight = useCallback(() => {
        var lastWeightEntry = new Date(lastTimeUserEnteredWeight);
        lastWeightEntry.setTime(lastWeightEntry.getTime() - timezoneOffsetInMs);

        const today = new Date();
        setCanUpdateWeight(!areSameDate(lastWeightEntry, today));
    }, [lastTimeUserEnteredWeight, timezoneOffsetInMs, areSameDate]);

    useEffect(() => {
        updateWeight();
    }, [updateWeight]);

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
    const [progressWidth, setProgressWidth] = useState(200);

    const handleResize = () => {
        if (weightObjectiveInKg < 0) return;

        const containerWidth = containerRef.current.getBoundingClientRect().width;
        setProgressWidth(containerWidth);
    };
    useResize(handleResize, true);

    // #################################################
    //   HANDLERS
    // #################################################

    const handleUpdateWeight = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <UpdateWeightPopup />,
        });
    };

    const handleNewWeightObjective = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <UpdateWeightObjectivePopup />,
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

    const goalReached = weightInKg <= weightObjectiveInKg;
    const bmi = (weightInKg / Math.pow(heightInCm / 100, 2)).toFixed(1);

    const tickets = (
        <div className="ticketContainer">
            <div className="ticket">
                <SVG className="icon" src={HeightIcon}></SVG>
                <p className="value">
                    {heightInCm / 100}
                    <span>m</span>
                </p>
                <p className="description">height</p>
            </div>

            <div className="ticket">
                <SVG className="icon" src={WeightIcon}></SVG>
                <p className="value">
                    {weightInKg}
                    <span>kg</span>
                </p>
                <p className="description">weight</p>
            </div>

            <div className="ticket">
                <SVG className="icon" src={BMIIcon}></SVG>
                <p className="value">{bmi}</p>
                <p className="description">BMI</p>
            </div>
        </div>
    );

    return (
        <div className={"WeightSection"}>
            {tickets}

            {weightObjectiveInKg >= 0 && (
                <div className="progress">
                    <p className="weight">{`${startingWeightObjectiveInKg}kg`}</p>

                    <div className="progressLineContainer" ref={containerRef}>
                        <ProgressLine
                            progress={progress}
                            totalWidth={progressWidth}
                            strokeColor={color}
                            trackStrokeColor={color}
                            text={`${weightInKg}kg`}
                            fontSize={14}
                        ></ProgressLine>
                    </div>

                    <p className="weight">{`${weightObjectiveInKg}kg`}</p>
                </div>
            )}

            {weightObjectiveInKg >= 0 && goalReached && (
                <>
                    <h2 style={{ color }}>{"Goal reached. Congratulations!"}</h2>
                    <div className="button" style={{ backgroundColor: color }} onClick={handleNewWeightObjective}>
                        {"Set new weight goal"}
                    </div>
                </>
            )}

            {canUpdateWeight && (
                <div className="button" style={{ backgroundColor: color }} onClick={handleUpdateWeight}>
                    {"Update Weight"}
                </div>
            )}

            <div className="bmi">
                <SVG className={"icon"} src={BMIIcon} />
                <div className="info">
                    <h2>
                        {bmi < 16
                            ? "You are severely underweight"
                            : bmi < 18.5
                            ? "You are underweight"
                            : bmi < 25
                            ? "Your weight is in a normal range"
                            : bmi < 30
                            ? "Your are overweight"
                            : "Your are severely overweight"}
                    </h2>
                    <p>The desired Body Mass Index range for the average adult is 18.5 to 25</p>
                </div>
            </div>
        </div>
    );
}
