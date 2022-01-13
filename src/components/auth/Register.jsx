import { useCallback, useEffect, useContext, useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import { Events } from "../../contexts/Events";
import Card from "./Card";

const PARENT_ID = "register";
const STAGES = ["fast", "register", "health", "registerSuccess"];
const CARDS = {
    register: [
        {
            title: "Create an account",
            subtitle: "Enter your email:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", inputType: "email", action: "email" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new username:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", inputType: "text", action: "username" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new password:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", inputType: "password", action: "password" }],
        },
    ],
    fast: [
        {
            title: "Setup you fasting schedule",
            subtitle: "For how long do you want to fast?",
            interactiblesHeight: 13,
            interactibles: [
                { type: "picker", action: "pickfastDuration", pickerType: "fastDuration" },
                { type: "button", action: "fastDuration", content: "Select" },
            ],
        },
        {
            title: "Setup you fasting schedule",
            subtitle: "And at what time would you like to start?",
            interactiblesHeight: 13,
            interactibles: [
                { type: "picker", action: "pickfastStartTime", pickerType: "fastStartTime" },
                { type: "button", action: "fastStartTime", content: "Select" },
            ],
        },
    ],
    health: [
        {
            title: "Tell us about you",
            subtitle: "What is you height?",
            interactiblesHeight: 13,
            interactibles: [
                { type: "picker", action: "pickHeight", pickerType: "height" },
                { type: "button", action: "height", content: "Select" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "What is you weight?",
            interactiblesHeight: 13,
            interactibles: [
                { type: "picker", action: "pickWeight", pickerType: "weight" },
                { type: "button", action: "weight", content: "Select" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "And, what is you weight?",
            interactiblesHeight: 13,
            interactibles: [
                { type: "picker", action: "pickObjectiveWeight", pickerType: "objectiveWeight" },
                { type: "button", action: "objectiveWeight", content: "Select" },
            ],
        },
    ],
    registerSuccess: [
        {
            title: "All done",
            subtitle: "Welcome to Fanfastic!",
            interactiblesHeight: 0,
            interactibles: [],
            auto: true,
        },
    ],
};

export default function Register({ parentId }) {
    const { sub, unsub, emit } = useContext(Events);

    // #################################################
    //   DATA
    // #################################################

    const registrationData = useRef({
        email: "",
        username: "",
        password: "",
        fastDuration: "",
        fastStartTime: "",
        heigth: "",
        weight: "",
        objectiveWeight: "",
    });

    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const animationSpeed = 400;
    const content = STAGES.map((id) => (
        <Card
            cardPhases={CARDS[id]}
            canGoBack={id !== "registerSuccess"}
            parentData={registrationData}
            parentId={PARENT_ID}
        />
    ));
    const [renderedPages, nextPage, prevPage] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "lateralPages",
        animationSpeed,
        animateFirst: true,
    });

    // #################################################
    //   HANDLERS
    // #################################################

    const handleActionDone = useCallback(
        ({ callerParentId, action, data }) => {
            if (callerParentId !== PARENT_ID) return;

            if (action in registrationData.current) registrationData.current[action] = data;

            if (action === "objectiveWeight") {
                console.log("CALL ALL THE LOGIN APIS");
                console.log(registrationData.current);

                // ROJAS REMOVE TIMEOUT and just wait for the api to response to decide to go to next or to show error
                setTimeout(() => {
                    nextPage();
                }, 2000);
            }
        },
        [nextPage]
    );

    const handleNextStage = useCallback(
        (callerParentId) => {
            if (callerParentId !== PARENT_ID) return;
            nextPage();
        },
        [nextPage]
    );

    const handlePrevStage = useCallback(
        (callerParentId) => {
            if (callerParentId !== PARENT_ID) return;
            if (!prevPage()) emit("onPrevStage", parentId);
        },
        [prevPage, emit, parentId]
    );

    // #################################################
    //   EVENTS
    // #################################################

    useEffect(() => {
        sub("onNextStage", handleNextStage);
        sub("onPrevStage", handlePrevStage);
        sub("onActionDone", handleActionDone);

        return () => {
            unsub("onNextStage", handleNextStage);
            unsub("onPrevStage", handlePrevStage);
            unsub("onActionDone", handleActionDone);
        };
    }, [handleNextStage, handlePrevStage, handleActionDone, sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    return renderedPages;
}
