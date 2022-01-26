import { useContext } from "react";
import useGlobalState from "../../hooks/useGlobalState";
import Elem from "./Elem";
import SettingsButton from "./SettingsButton";

import SetFastStartTimePopup from "./SetFastStartTimePopup";
import SetFastDurationPopup from "./SetFastDurationPopup";
import UpdateHeightPopup from "./UpdateHeightPopup";
import UpdateWeightPopup from "../weight/UpdateWeightPopup";
import UpdateWeightObjectivePopup from "../weight/UpdateWeightObjectivePopup";
import SubNotificationsPopup from "./SubNotificationsPopup";
import UnsubNotificationsPopup from "./UnsubNotificationsPopup";
import ChangeEmailPopup from "./ChangeEmailPopup";
import ChangePasswordPopup from "./ChangePasswordPopup";
import DeleteAccountPopup from "./DeleteAccountPopup";
import LogoutPopup from "./LogoutPopup";

import { Data } from "../../contexts/Data";
import { GlobalState } from "../../contexts/GlobalState";

export default function SettingsSection() {
    const { user } = useContext(Data);
    const { set } = useContext(GlobalState);

    if (!user.current) return null;

    const { heightInCm, weightInKg, weightObjectiveInKg, fastDesiredStartTimeInMinutes, fastObjectiveInMinutes } =
        user.current;

    const getTimeFormated = () => {
        const hours = Math.floor(fastDesiredStartTimeInMinutes / 60);
        const minutes = fastDesiredStartTimeInMinutes % 60;

        return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    };

    // #################################################
    //   HANDLERS
    // #################################################

    const handleSetStartTime = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <SetFastStartTimePopup />,
        });
    };

    const handleSetFastDuration = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <SetFastDurationPopup />,
        });
    };

    const handleSetHeight = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <UpdateHeightPopup />,
        });
    };

    const handleSetWeight = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <UpdateWeightPopup />,
        });
    };

    const handleSetWeightObjective = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <UpdateWeightObjectivePopup />,
        });
    };

    const handleSubToNotifications = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <SubNotificationsPopup />,
        });
    };

    const handleUnsubToNotifications = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <UnsubNotificationsPopup />,
        });
    };

    const handleChangeEmail = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: true,
            content: <ChangeEmailPopup />,
        });
    };

    const handleChangePassword = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: true,
            content: <ChangePasswordPopup />,
        });
    };

    const handleLogout = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: false,
            content: <LogoutPopup />,
        });
    };

    const handleDeleteAccount = () => {
        set("showPopup", {
            visible: true,
            canCloseWithBackground: true,
            closeButtonVisible: false,
            addPadding: false,
            fullscreen: true,
            content: <DeleteAccountPopup />,
        });
    };

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
            <Elem
                title={"Fast start time"}
                value={getTimeFormated()}
                actionText={"change"}
                handleClick={handleSetStartTime}
            />
            <Elem
                title={"Fast duration"}
                value={`${fastObjectiveInMinutes / 60}h`}
                actionText={"change"}
                handleClick={handleSetFastDuration}
            />

            <h2 className={"sectionTitle"}>Health</h2>
            <Elem title={"Height"} value={heightInCm} actionText={"change"} handleClick={handleSetHeight} />
            <Elem title={"Weight"} value={weightInKg} actionText={"change"} handleClick={handleSetWeight} />
            <Elem
                title={"Objective weight"}
                value={weightObjectiveInKg}
                actionText={"change"}
                handleClick={handleSetWeightObjective}
            />

            <h2 className={"sectionTitle"}>Notifications</h2>
            <SettingsButton text={"Get notifications"} blue={true} handleClick={handleSubToNotifications} />
            <SettingsButton text={"Stop notifications"} red={true} handleClick={handleUnsubToNotifications} />

            <h2 className={"sectionTitle"}>Account</h2>
            <SettingsButton text={"Change Email"} handleClick={handleChangeEmail} />
            <SettingsButton text={"Change Password"} handleClick={handleChangePassword} />
            <SettingsButton text={"Log out"} red={true} handleClick={handleLogout} />
            <SettingsButton text={"Delete Account"} red={true} handleClick={handleDeleteAccount} />
        </div>
    );
}
