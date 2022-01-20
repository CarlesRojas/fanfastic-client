import { useState, useEffect, useRef, useContext, useCallback } from "react";
import useGlobalState from "../../hooks/useGlobalState";

import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";
import { GlobalState } from "../../contexts/GlobalState";
import Elem from "./Elem";
import SettingsButton from "./SettingsButton";

export default function SettingsSection() {
    const { user } = useContext(Data);
    const { invlerp, areSameDate } = useContext(Utils);
    const { set } = useContext(GlobalState);

    const { weightInKg, weightObjectiveInKg } = user.current;

    // #################################################
    //   HANDLERS
    // #################################################

    const handleSetFastDuration = () => {};

    const handleSetStartTime = () => {};

    const handleSetHeight = () => {};

    const handleSetWeight = () => {
        // set("showPopup", {
        //     visible: true,
        //     canCloseWithBackground: true,
        //     closeButtonVisible: false,
        //     addPadding: false,
        //     content: <UpdateWeightPopup />,
        // });
    };

    const handleSetWeightObjective = () => {
        // set("showPopup", {
        //     visible: true,
        //     canCloseWithBackground: true,
        //     closeButtonVisible: false,
        //     addPadding: false,
        //     content: <UpdateWeightObjectivePopup />,
        // });
    };

    const handleSubToNotifications = () => {};

    const handleChangeEmail = () => {};

    const handleChangeUsername = () => {};

    const handleChangePassword = () => {};

    const handleLogout = () => {};

    const handleDeleteAccount = () => {};

    // #################################################
    //   USER UPDATED
    // #################################################

    // eslint-disable-next-line
    const [userUpdated] = useGlobalState("userUpdated");

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={"SettingsSection"}>
            <h2 className={"sectionTitle"}>Fasting</h2>
            <Elem title={"Fast start time"} value={"9:30"} actionText={"change"} />
            <Elem title={"Fast duration"} value={"16h"} actionText={"change"} />

            <h2 className={"sectionTitle"}>Health</h2>
            <Elem title={"Height"} value={"1.80m"} actionText={"change"} />
            <Elem title={"Weight"} value={"80.3kg"} actionText={"change"} />
            <Elem title={"Objective weight"} value={"75kg"} actionText={"change"} />

            <h2 className={"sectionTitle"}>Notifications</h2>
            <SettingsButton text={"Get notifications"} blue={true} />

            <h2 className={"sectionTitle"}>Account</h2>
            <SettingsButton text={"Change Email"} />
            <SettingsButton text={"Change Username"} />
            <SettingsButton text={"Change Password"} />
            <SettingsButton text={"Log out"} red={true} />
            <SettingsButton text={"Delete Account"} red={true} />
        </div>
    );
}
