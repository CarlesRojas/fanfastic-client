import { useContext, useState, useRef } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import FastDurationPicker from "../auth/FastDurationPicker";
import Button from "../auth/Button";
import useThrottle from "../../hooks/useThrottle";

import { Data } from "../../contexts/Data";
import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

import LoadingIcon from "../../resources/icons/loading.svg";

export default function SetFastDurationPopup() {
    const { user } = useContext(Data);
    const { setFastObjective } = useContext(API);
    const { set, get } = useContext(GlobalState);

    const { fastDesiredStartTimeInMinutes, fastObjectiveInMinutes } = user.current;

    // #################################################
    //   STATE
    // #################################################

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const data = useRef({
        fastDuration: fastObjectiveInMinutes / 60 - 12,
        fastStartTime:
            (Math.floor(fastDesiredStartTimeInMinutes / 60) - 12) * 2 +
            (fastDesiredStartTimeInMinutes % 60 === 30 ? 1 : 0),
    });
    const [, setUpdate] = useState(true);

    // #################################################
    //   UPDATE PARENT
    // #################################################

    const handleUpdateParent = () => {
        setUpdate((prev) => !prev);
    };

    // #################################################
    //   HANDLERS
    // #################################################

    const checkError = (data) => {
        if ("error" in data) {
            setError(data.error);
            return true;
        }
        return false;
    };

    const handleConfirmClick = useThrottle(async () => {
        const { fastDuration } = data.current;
        setLoading(true);

        const result = await setFastObjective((12 + fastDuration) * 60);
        setLoading(false);
        if (checkError(result)) return;

        set("showPopup", { ...get("showPopup"), visible: false });
    }, 1500);

    const handleCancelClick = () => {
        set("showPopup", { ...get("showPopup"), visible: false });
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="PopupContent">
            <h1>{"Set a new fasting duration"}</h1>
            <div className={"subtitle"}>
                <p className={cn({ visible: error })}>{error || "Error"}</p>
            </div>

            <div className={"loadingContainer"}>
                <SVG className={cn("loadingIcon", "spin", "infinite", { visible: loading })} src={LoadingIcon} />
            </div>

            <FastDurationPicker
                data={{ pickerType: "fastDuration" }}
                parentData={data}
                updateParent={handleUpdateParent}
            />

            <div className="separation"></div>
            <Button data={{ content: "Update Fasting Duration" }} nextPhase={handleConfirmClick} />

            <div className="separation"></div>
            <Button data={{ content: "Cancel" }} low={true} nextPhase={handleCancelClick} isLastInteractible={true} />
        </div>
    );
}
