import { useContext, useRef, useEffect, useCallback } from "react";

import { Events } from "../../contexts/Events";
import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

import Card from "../auth/Card";

const PARENT_ID = "changeEmailPopup";
const PHASES = [
    {
        title: "Change your password",
        subtitle: "Enter a new password:",
        interactiblesHeight: 4,
        interactibles: [{ type: "input", inputType: "newPassword" }],
    },
    {
        title: "Change your password",
        subtitle: "Confirm by entering your old password:",
        interactiblesHeight: 4,
        interactibles: [{ type: "input", inputType: "password", action: "complete" }],
    },
];

export default function ChangePasswordPopup() {
    const { sub, unsub, emit } = useContext(Events);
    const { changePassword } = useContext(API);
    const { set, get } = useContext(GlobalState);

    // #################################################
    //   STATE
    // #################################################

    const data = useRef({ password: "", newPassword: "" });

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

            const { password, newPassword } = data.current;

            if (action === "complete") {
                const result = await changePassword(password, newPassword);
                if (checkError(result)) return;

                set("showPopup", { ...get("showPopup"), visible: false });
            }
        },
        [changePassword, checkError, set, get]
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
