import { useState, useCallback } from "react";
import { useSprings, animated } from "react-spring";

const STAGES = ["welcome", "login", "loginSuccess", "register", "fast", "health", "registerSuccess"];
// const CARDS = {
//     welcome: true,
//     login: true,
//     loginSuccess: true,
//     register: true,
//     fast: true,
//     health: true,
//     registerSuccess: true,
// };

export default function Auth() {
    const [springs, api] = useSprings(STAGES.length, (i) => ({ x: i === 0 ? "0vw" : "100vw" }));
    const [stagesVisible, setStagesVisible] = useState(STAGES.map((_, i) => i === 0));

    const updateStagesVisible = (index, newValue) => {
        setStagesVisible((prev) => {
            const newArray = [...prev];
            newArray[index] = newValue;
            return newArray;
        });
    };

    const nextStage = useCallback(
        (currIndex, newIndex) => {
            // Place the entering stage on its starting position
            api.start((index) => {
                if (index !== newIndex) return;
                return { x: "100vw", immediate: true };
            });

            // Show the entering stage
            updateStagesVisible(newIndex, true);

            // Animate both entering and exiting springs
            api.start((index) => {
                if (index === currIndex) return { x: "-100px", onRest: () => updateStagesVisible(currIndex, false) };
                else if (index === newIndex) return { x: "0vw" };
                return;
            });
        },
        [api]
    );

    const prevStage = useCallback(
        (currIndex, newIndex) => {
            // Place the entering stage on its starting position
            api.start((index) => {
                if (index !== newIndex) return;
                return { x: "-100vw", immediate: true };
            });

            // Show the entering stage
            updateStagesVisible(newIndex, true);

            // Animate both entering and exiting springs
            api.start((index) => {
                if (index === currIndex) return { x: "100px", onRest: () => updateStagesVisible(currIndex, false) };
                else if (index === newIndex) return { x: "0vw" };
                return;
            });
        },
        [api]
    );

    return (
        <div className={"Auth"}>
            {springs.map(
                ({ x }, i) =>
                    stagesVisible[i] && (
                        <animated.div
                            key={i}
                            className={"stageContainer"}
                            style={{
                                x,
                                pointerEvents: x.to((v) => (v === "0vw" ? "all" : "none")),
                                backgroundColor: `rgb(${i * 40}, ${i * 40}, ${i * 40})`,
                            }}
                        >
                            {STAGES[i]}
                            {i + 1 < STAGES.length && (
                                <div className="button" onClick={() => nextStage(i, i + 1)}>
                                    Next
                                </div>
                            )}
                            {i > 0 && (
                                <div className="button" onClick={() => prevStage(i, i - 1)}>
                                    Prev
                                </div>
                            )}
                        </animated.div>
                    )
            )}
        </div>
    );
}
