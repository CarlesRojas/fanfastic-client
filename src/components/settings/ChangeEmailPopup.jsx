import { useContext, useRef, useEffect, useCallback } from "react";

import { Events } from "../../contexts/Events";
import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

import Card from "../auth/Card";

const PARENT_ID = "changeEmailPopup";
const PHASES = [
    {
        title: "Change your email",
        subtitle: "Enter a new email:",
        interactiblesHeight: 4,
        interactibles: [{ type: "input", inputType: "email", checkExists: true }],
    },
    {
        title: "Change your email",
        subtitle: "Confirm change by entering your password:",
        interactiblesHeight: 4,
        interactibles: [{ type: "input", inputType: "password", action: "complete" }],
    },
];

export default function ChangeEmailPopup() {
    const { sub, unsub, emit } = useContext(Events);
    // const { user } = useContext(Data);
    const { changeEmail } = useContext(API);
    const { set, get } = useContext(GlobalState);

    // #################################################
    //   STATE
    // #################################################

    const data = useRef({ email: "", password: "" });

    // #################################################
    //   HANDLERS
    // #################################################

    const checkError = useCallback(
        (data) => {
            if ("error" in data) {
                emit("onRegisterError", data.error);
                return true;
            }
            return false;
        },
        [emit]
    );

    const handleActionDone = useCallback(
        async ({ callerParentId, action }) => {
            if (callerParentId !== PARENT_ID) return;

            const { password, email } = data.current;

            if (action === "complete") {
                const result = await changeEmail(password, email);
                if (checkError(result)) return;

                set("showPopup", { ...get("showPopup"), visible: false });
            }
        },
        [changeEmail, checkError, set, get]
    );

    // #################################################
    //   EVENTS
    // #################################################

    useEffect(() => {
        sub("onActionDone", handleActionDone);

        return () => {
            unsub("onActionDone", handleActionDone);
        };
    }, [handleActionDone, sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    return <Card cardPhases={PHASES} canGoBack={false} parentData={data} parentId={PARENT_ID} hideClip={true} />;
}
