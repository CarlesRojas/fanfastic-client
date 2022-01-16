import { useState, useEffect, useRef, useContext, useCallback } from "react";
import cn from "classnames";
import useResize from "../../hooks/useResize";
import useThrottle from "../../hooks/useThrottle";
import useGlobalState from "../../hooks/useGlobalState";
import useAutoResetState from "../../hooks/useAutoResetState";
import ProgressLine from "./ProgressLine";

import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";
import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

export default function WeightSection() {
    const { user } = useContext(Data);
    const { invlerp, sleep } = useContext(Utils);
    const { setWeight } = useContext(API);
    const { set } = useContext(GlobalState);

    const { weightInKg, startingWeightObjectiveInKg, weightObjectiveInKg } = user.current;

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

    const [error, setError] = useAutoResetState("", 10000);

    const handleUpdateWeight = useThrottle(async () => {
        set("loadingVisible", true);
        await sleep(200);

        setError("Already updated weight today");
        // ROJAS TODO
        // const result = await setWeight();
        // if ("error" in result) setError(result.error);

        await sleep(200);

        set("loadingVisible", false);
    }, 2000);

    // #################################################
    //   USER UPDATED
    // #################################################

    // eslint-disable-next-line
    const [userUpdated] = useGlobalState("userUpdated");

    // #################################################
    //   RENDER
    // #################################################

    if (weightObjectiveInKg < 0) return null;

    return (
        <div className={"WeightSection"}>
            <h1>{"Weight Progress"}</h1>

            <div className="progress">
                <p className="weight">{`${startingWeightObjectiveInKg}kg`}</p>

                <div className="progressLineContainer" ref={containerRef}>
                    <ProgressLine
                        progress={progress}
                        totalWidth={progressWidth}
                        strokeColor={"#4faaff"}
                        trackStrokeColor={"#4faaff"}
                        text={`${weightInKg}kg`}
                        fontSize={14}
                    ></ProgressLine>
                </div>

                <p className="weight">{`${weightObjectiveInKg}kg`}</p>
            </div>

            <div className="button" style={{ backgroundColor: "#4faaff" }} onClick={handleUpdateWeight}>
                {"Update Weight"}
            </div>

            <div className={cn("error", { visible: error !== "" })}>{error}</div>
        </div>
    );
}
