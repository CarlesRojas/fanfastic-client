import { useState, useEffect, useRef, useContext, useCallback } from "react";
import useResize from "../../hooks/useResize";
import useGlobalState from "../../hooks/useGlobalState";
import ProgressLine from "./ProgressLine";
import UpdateWeightPopup from "./UpdateWeightPopup";

import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";
import { GlobalState } from "../../contexts/GlobalState";

const areSameDate = (date1, date2) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export default function WeightSection() {
    const { user } = useContext(Data);
    const { invlerp } = useContext(Utils);
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
    }, [lastTimeUserEnteredWeight, timezoneOffsetInMs]);

    useEffect(() => {
        updateWeight();
    }, [updateWeight]);

    // #################################################
    //   RESIZE
    // #################################################

    const containerRef = useRef();
    const [progressWidth, setProgressWidth] = useState(200);

    const handleResize = () => {
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
            canClose: false,
            addPadding: false,
            content: <UpdateWeightPopup />,
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

    if (weightObjectiveInKg < 0) return null;

    const color = "#aaaaaa";

    return (
        <div className={"WeightSection"}>
            <h1>{"Weight Progress"}</h1>

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

            {canUpdateWeight && (
                <div className="button" style={{ backgroundColor: color }} onClick={handleUpdateWeight}>
                    {"Update Weight"}
                </div>
            )}
        </div>
    );
}
