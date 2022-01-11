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
            interactibles: [{ type: "input", inputType: "email", action: "loginEnterEmail" }],
        },
        {
            title: "Log in",
            subtitle: "Enter your password:",
            interactibles: [{ type: "input", inputType: "password", action: "loginEnterPassword" }],
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
            interactibles: [{ type: "input", inputType: "email", action: "registerEnterEmail" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new username:",
            interactibles: [{ type: "input", inputType: "text", action: "registerEnterUsername" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new password:",
            interactibles: [{ type: "input", inputType: "password", action: "registerEnterPassword" }],
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
    // #################################################
    //   STATE
    // #################################################

    const [springs, api] = useSprings(STAGES.length, (i) => ({ x: i === 0 ? "0vw" : "100vw" }));
    const [stagesVisible, setStagesVisible] = useState(STAGES.map((_, i) => i === 0));

    const updateStagesVisible = (index, newValue) => {
        setStagesVisible((prev) => {
            const newArray = [...prev];
            newArray[index] = newValue;
            return newArray;
        });
    };

    // #################################################
    //   NEXT & PREV
    // #################################################

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

    // #################################################
    //   RENDER
    // #################################################

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
                            }}
                        >
                            <Cards
                                cards={CARDS[STAGES[i]]}
                                nextStage={nextStage}
                                prevStage={prevStage}
                                stages={STAGES}
                                stageId={STAGES[i]}
                                stageAnimation={x}
                            />
                        </animated.div>
                    )
            )}
        </div>
    );
}
