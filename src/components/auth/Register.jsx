import { useCallback, useEffect, useContext, useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import Card from "./Card";

import { Events } from "../../contexts/Events";
import { API } from "../../contexts/API";

const PARENT_ID = "register";
const STAGES = ["register", "fast", "health", "registerSuccess"];
const CARDS = {
    register: [
        {
            title: "Create an account",
            subtitle: "Enter your email:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", inputType: "email", checkExists: true }],
        },
        {
            title: "Create an account",
            subtitle: "Enter a new password:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", inputType: "password" }],
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
                { type: "objectiveWeightButton", action: "completeRegistration", content: "Select" },
            ],
        },
    ],
    registerSuccess: [
        {
            title: "Account created",
            subtitle: "Welcome to Fanfastic!",
            loadingMessage: "Creating your account...",
            interactiblesHeight: 0,
            loadUntilSuccess: true,
            interactibles: [],
        },
    ],
};

export default function Register({ parentId, setLoggedIn }) {
    const { sub, unsub, emit } = useContext(Events);
    const { register, login, setFastDesiredStartTime, setFastObjective, setHeight, setWeight, setWeightObjective } =
        useContext(API);

    // #################################################
    //   DATA
    // #################################################

    const registrationData = useRef({
        email: "",
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
    const [{ renderedPages, nextPage, prevPage, setPage }] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "lateralPages",
        animationSpeed,
        animateFirst: true,
        initialPage: 0,
    });

    // #################################################
    //   HANDLERS
    // #################################################

    const checkError = useCallback(
        (data) => {
            if ("error" in data) {
                setTimeout(async () => {
                    setPage(0);
                    setTimeout(() => emit("onRegisterError", data.error), animationSpeed);
                }, animationSpeed);
                return true;
            }
            return false;
        },
        [setPage, emit]
    );

    const handleRegister = useCallback(async () => {
        const { email, password, fastDuration, fastStartTime, height, weight, objectiveWeight } =
            registrationData.current;

        nextPage();

        const registerResult = await register(email, password);
        if (checkError(registerResult)) return;

        const loginResult = await login(email, password);
        if (checkError(loginResult)) return;

        const fastObjectiveResult = await setFastObjective((12 + fastDuration) * 60);
        if (checkError(fastObjectiveResult)) return;

        const fastDesiredStartResult = await setFastDesiredStartTime(
            fastStartTime % 2 === 0 ? (12 + fastStartTime / 2) * 60 : (12 + (fastStartTime - 1) / 2) * 60 + 30
        );
        if (checkError(fastDesiredStartResult)) return;

        const setHeightResult = await setHeight(height.m * 100 + height.cm);
        if (checkError(setHeightResult)) return;

        const setWeightResult = await setWeight(weight.kg + weight.dg / 10);
        if (checkError(setWeightResult)) return;

        const setWeightObjectiveResult = await setWeightObjective(
            objectiveWeight.kg === -1 ? -1 : objectiveWeight.kg + objectiveWeight.dg / 10
        );
        if (checkError(setWeightObjectiveResult)) return;

        emit("onLoadSuccess");

        setTimeout(() => {
            nextPage();
            setTimeout(() => setLoggedIn(true), animationSpeed);
        }, 2000);
    }, [
        register,
        login,
        setFastObjective,
        setFastDesiredStartTime,
        setHeight,
        setWeight,
        setWeightObjective,
        checkError,
        nextPage,
        setLoggedIn,
        emit,
    ]);

    const handleActionDone = useCallback(
        ({ callerParentId, action }) => {
            if (callerParentId !== PARENT_ID) return;

            if (action === "completeRegistration") handleRegister();
        },
        [handleRegister]
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
