import { useState, useEffect, useRef, useContext, useCallback } from "react";
import ProgressLine from "./ProgressLine";

import { Data } from "../../contexts/Data";

export default function WeightSection() {
    const { user } = useContext(Data);

    const { weightInKg, startingWeightObjectiveInKg, weightObjectiveInKg } = user.current;

    // #################################################
    //   PROGRESS
    // #################################################

    const [progress, setProgress] = useState(0);

    // console.log(user.current);

    useEffect(() => {
        const timeout = setInterval(() => {
            setProgress((prev) => (prev + 10) % 101);
        }, 1000);
        return () => {
            clearInterval(timeout);
        };
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    if (weightObjectiveInKg < 0) return null;

    return (
        <div className={"WeightSection"}>
            <ProgressLine
                progress={progress}
                totalWidth={400}
                strokeColor={"#4faaff"}
                trackStrokeColor={"#4faaff"}
                text={`${weightInKg} kg`}
            ></ProgressLine>
        </div>
    );
}
