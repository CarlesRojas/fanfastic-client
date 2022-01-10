import { useState, useCallback } from "react";
import { useSprings, animated } from "react-spring";
import Cards from "./Cards";

const STAGES = ["welcome", "login", "loginSuccess", "register", "fast", "health", "registerSuccess"];
const CARDS = {
    welcome: [
        {
            title: "Hi, welcome to Fanfastic!",
            subtitle: "What do you want to do?",
            interactibles: [
                { type: "button", content: "Create and account", action: "createAccount" },
                { type: "button", content: "Log in", action: "login" },
            ],
        },
    ],
    login: [
        {
            title: "Log in",
            subtitle: "Enter your email:",
            interactibles: [{ type: "input", action: "loginEnterEmail" }],
        },
        {
            title: "Log in",
            subtitle: "Enter your password:",
            interactibles: [{ type: "input", action: "loginEnterPassword" }],
        },
    ],
    loginSuccess: [
        {
            title: "Welcome back!",
            subtitle: "",
            interactibles: [{ type: "auto", action: "loginSuccess" }],
        },
    ],
    register: [
        {
            title: "Create an account",
            subtitle: "Enter your email:",
            interactibles: [{ type: "input", action: "registerEnterEmail" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new username:",
            interactibles: [{ type: "input", action: "registerEnterUsername" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new password:",
            interactibles: [{ type: "input", action: "registerEnterPassword" }],
        },
        {
            title: "Create an account",
            subtitle: "Confirm the password:",
            interactibles: [{ type: "input", action: "registerConfirmPassword" }],
        },
    ],
    fast: [
        {
            title: "Setup you fasting schedule",
            subtitle: "For how long do you want to fast?",
            interactibles: [
                { type: "picker", action: "fastDuration" },
                { type: "button", content: "Select", action: "selectFastDuration" },
            ],
        },
        {
            title: "Setup you fasting schedule",
            subtitle: "And at what time would you like to start?",
            interactibles: [
                { type: "picker", action: "fastStartTime" },
                { type: "button", content: "Select", action: "selectFastStartTime" },
            ],
        },
    ],
    health: [
        {
            title: "Tell us about you",
            subtitle: "What is you height?",
            interactibles: [
                { type: "picker", action: "height" },
                { type: "button", content: "Select", action: "selectHeight" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "What is you weight?",
            interactibles: [
                { type: "picker", action: "weight" },
                { type: "button", content: "Select", action: "selectWeight" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "And, what is you weight?",
            interactibles: [
                { type: "picker", action: "objectiveWeight" },
                { type: "button", content: "Select", action: "selectObjectiveWeight" },
            ],
        },
    ],
    registerSuccess: [
        {
            title: "All done!",
            subtitle: "Welcome to Fanfastic!",
            interactibles: [{ type: "auto", action: "registerSuccess" }],
        },
    ],
};

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
                            <Cards
                                cards={CARDS[STAGES[i]]}
                                nextStage={nextStage}
                                prevStage={prevStage}
                                stages={STAGES}
                            />
                            {/* {STAGES[i]}
                            {i + 1 < STAGES.length && (
                                <div className="button" onClick={() => nextStage(i, i + 1)}>
                                    Next
                                </div>
                            )}
                            {i > 0 && (
                                <div className="button" onClick={() => prevStage(i, i - 1)}>
                                    Prev
                                </div>
                            )} */}
                        </animated.div>
                    )
            )}
        </div>
    );
}
