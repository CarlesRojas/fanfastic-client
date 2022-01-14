import { useCallback, useEffect, useContext, useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import Card from "./Card";

import { Events } from "../../contexts/Events";
import { API } from "../../contexts/API";

const PARENT_ID = "login";
const STAGES = ["login", "loginSuccess"];

const CARDS = {
    login: [
        {
            title: "Log in",
            subtitle: "Enter your email:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", inputType: "email", checkExists: false }],
        },
        {
            title: "Log in",
            subtitle: "Enter your password:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", action: "completeLogin", inputType: "password" }],
        },
    ],
    loginSuccess: [
        {
            title: "Welcome back",
            subtitle: "Happy to see you again!",
            loadingMessage: "Logging you in...",
            interactiblesHeight: 0,
            loadUntilSuccess: true,
            interactibles: [],
        },
    ],
};

export default function Login({ parentId, setLoggedIn }) {
    const { sub, unsub, emit } = useContext(Events);
    const { login } = useContext(API);

    // #################################################
    //   LOGIN
    // #################################################

    const loginData = useRef({
        email: "",
        password: "",
    });

    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const animationSpeed = 400;
    const content = STAGES.map((id) => (
        <Card cardPhases={CARDS[id]} canGoBack={id !== "loginSuccess"} parentData={loginData} parentId={PARENT_ID} />
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
                setPage(0);
                setTimeout(() => emit("onLoginError", data.error), animationSpeed);
                return true;
            }
            return false;
        },
        [setPage, emit]
    );

    const handleLogin = useCallback(async () => {
        nextPage();
        const { email, password } = loginData.current;

        const result = await login(email, password);
        if (checkError(result)) return;

        const sleep = (ms) => {
            return new Promise((resolve) => setTimeout(resolve, ms));
        };

        await sleep(3000);

        emit("onLoadSuccess");

        setTimeout(() => {
            nextPage();
            setTimeout(() => setLoggedIn(true), animationSpeed);
        }, 2000);
    }, [login, nextPage, setLoggedIn, checkError, emit]);

    const handleActionDone = useCallback(
        ({ callerParentId, action }) => {
            if (callerParentId !== PARENT_ID) return;
            if (action === "completeLogin") handleLogin();
        },
        [handleLogin]
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
