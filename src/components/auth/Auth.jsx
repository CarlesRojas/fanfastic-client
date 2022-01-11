import { useState, useCallback, useRef, useEffect } from "react";
import useCssOneTimeAnimation from "../../hooks/useCssOneTimeAnimation";
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

    const [animating, trigger] = useCssOneTimeAnimation(400);
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

    const stageRefs = useRef({});
    const nextAnimation = useRef({ currIndex: -1, newIndex: -1, goingBack: false, animated: true });

    const nextStage = useCallback((currIndex, newIndex) => {
        // Save the animation we want to make and instantiate the appearing stage (out of sight)
        nextAnimation.current = { currIndex, newIndex, goingBack: false, animated: false };
        updateStagesVisible(newIndex, true);
    }, []);

    const prevStage = useCallback((currIndex, newIndex) => {
        // Save the animation we want to make and instantiate the appearing stage (out of sight)
        nextAnimation.current = { currIndex, newIndex, goingBack: true, animated: false };
        updateStagesVisible(newIndex, true);
    }, []);

    useEffect(() => {
        const { currIndex, newIndex, goingBack, animated } = nextAnimation.current;
        if (animated || newIndex < 0) return;
        nextAnimation.current = { ...nextAnimation.current, animated: true };

        // Add classes to animate towards the right (Go back)
        if (goingBack) {
            if (currIndex >= 0) stageRefs.current[currIndex].classList.add("exitToRight");
            if (newIndex >= 0) stageRefs.current[newIndex].classList.add("enterFromLeft");
        }
        // Add classes to animate towards the left (Go next)
        else {
            if (currIndex >= 0) stageRefs.current[currIndex].classList.add("exitToLeft");
            if (newIndex >= 0) stageRefs.current[newIndex].classList.add("enterFromRight");
        }

        trigger();
    }, [stagesVisible, trigger]);

    useEffect(() => {
        if (!animating) {
            // When animation ends -> Deinstantiate the stage that left
            const currIndex = nextAnimation.current.currIndex;
            nextAnimation.current = { currIndex: -1, newIndex: -1, goingBack: false, animated: true };
            updateStagesVisible(currIndex, false);
        }
    }, [animating]);

    useEffect(() => {
        // The first stage starts in the center
        stageRefs.current[0].classList.add("center");
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={"Auth"} style={{ pointerEvents: animating ? "none" : "all" }}>
            {STAGES.map(
                (id, i) =>
                    stagesVisible[i] && (
                        <div key={i} className={"stageContainer"} ref={(elem) => (stageRefs.current[i] = elem)}>
                            <Cards
                                cards={CARDS[id]}
                                nextStage={nextStage}
                                prevStage={prevStage}
                                stages={STAGES}
                                stageId={id}
                            />
                        </div>
                    )
            )}
        </div>
    );
}
