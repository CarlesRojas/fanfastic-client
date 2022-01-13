import { useCallback, useEffect, useContext, useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import { Events } from "../../contexts/Events";
import Card from "./Card";

const PARENT_ID = "register";
const STAGES = ["register", "fast", "health", "registerSuccess"];
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
            interactiblesHeight: 14,
            interactibles: [
                { type: "fastDurationPicker", pickerType: "fastDuration" },
                { type: "button", content: "Select" },
            ],
        },
        {
            title: "Setup you fasting schedule",
            subtitle: "And at what time would you like to start?",
            interactiblesHeight: 14,
            interactibles: [
                { type: "fastStartTimePicker", pickerType: "fastStartTime" },
                { type: "button", content: "Select" },
            ],
        },
    ],
    health: [
        {
            title: "Tell us about you",
            subtitle: "What is you height?",
            interactiblesHeight: 13,
            interactibles: [
                { type: "heightPicker", pickerType: "height" },
                { type: "button", content: "Select" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "What is you weight?",
            interactiblesHeight: 13,
            interactibles: [
                { type: "weightPicker", pickerType: "weight" },
                { type: "button", content: "Select" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "And, what weight would you like to have?",
            interactiblesHeight: 13,
            interactibles: [
                { type: "weightPicker", pickerType: "objectiveWeight" },
                { type: "objectiveWeightButton", action: "callAPIs", content: "Select" },
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
        fastDuration: 2,
        fastStartTime: 18,
        height: { m: 1, cm: 65 },
        weight: { kg: 80, dg: 0 },
        objectiveWeight: { kg: -2, dg: -2 },
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

            if (action === "callAPIs") {
                console.log("CALL ALL THE LOGIN APIS");
                console.log(`email: ${registrationData.current.email}`);
                console.log(`username: ${registrationData.current.username}`);
                console.log(`password: ${registrationData.current.password}`);
                console.log(`fastDuration: ${(12 + registrationData.current.fastDuration) * 60}`);
                console.log(
                    `fastStartTime: ${
                        registrationData.current.fastStartTime % 2 === 0
                            ? (12 + registrationData.current.fastStartTime / 2) * 60
                            : (12 + (registrationData.current.fastStartTime - 1) / 2) * 60 + 30
                    }`
                );
                console.log(`height: ${registrationData.current.height.m * 100 + registrationData.current.height.cm}`);
                console.log(`weight: ${registrationData.current.weight.kg + registrationData.current.weight.dg / 10}`);
                console.log(
                    `objectiveWeight: ${
                        registrationData.current.objectiveWeight.kg === -1
                            ? "Skip"
                            : registrationData.current.objectiveWeight.kg +
                              registrationData.current.objectiveWeight.dg / 10
                    }`
                );

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
