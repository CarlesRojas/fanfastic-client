import { useState, useEffect, useRef, useContext, useCallback } from "react";
import useResize from "../../hooks/useResize";
import useGlobalState from "../../hooks/useGlobalState";
import ProgressLine from "./ProgressLine";
import UpdateWeightPopup from "./UpdateWeightPopup";
import UpdateWeightObjectivePopup from "./UpdateWeightObjectivePopup";

import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";
import { GlobalState } from "../../contexts/GlobalState";

export default function WeightSection() {
    const { user } = useContext(Data);
    const { invlerp, areSameDate } = useContext(Utils);
    const { set } = useContext(GlobalState);

    const {
        weightInKg,
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
            content: <UpdateWeightPopup />,
        });
    };

    const handleNewWeightObjective = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
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

    const color = "#aaaaaa";
    const colorGoal = "#64ad50";

    if (weightObjectiveInKg < 0)
        return (
            <div className={"WeightSection"}>
                <h1>{"Your weight"}</h1>

                <p className="currentWeight" style={{ color: colorGoal }}>{`${weightInKg}kg`}</p>

                {canUpdateWeight && (
                    <div className="button" style={{ backgroundColor: color }} onClick={handleUpdateWeight}>
                        {"Update Weight"}
                    </div>
                )}
            </div>
        );

    return (
        <div className={"WeightSection"}>
            <h1>{"Weight Progress"}</h1>

            <div className="progress">
                <p className="weight">{`${startingWeightObjectiveInKg}kg`}</p>

                <div className="progressLineContainer" ref={containerRef}>
                    <ProgressLine
                        progress={progress}
                        totalWidth={progressWidth}
                        strokeColor={goalReached ? colorGoal : color}
                        trackStrokeColor={goalReached ? colorGoal : color}
                        text={`${weightInKg}kg`}
                        fontSize={14}
                    ></ProgressLine>
                </div>

                <p className="weight">{`${weightObjectiveInKg}kg`}</p>
            </div>

            {goalReached && (
                <>
                    <h2 style={{ color: colorGoal }}>{"Goal reached. Congratulations!"}</h2>
                    <div className="button" style={{ backgroundColor: colorGoal }} onClick={handleNewWeightObjective}>
                        {"Set new weight goal"}
                    </div>
                </>
            )}

            {canUpdateWeight && (
                <div className="button" style={{ backgroundColor: color }} onClick={handleUpdateWeight}>
                    {"Update Weight"}
                </div>
            )}
        </div>
    );
}
