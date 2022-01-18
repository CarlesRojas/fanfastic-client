import { useContext, useState, useRef } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import DatePicker from "../auth/DatePicker";
import Button from "../auth/Button";
import useThrottle from "../../hooks/useThrottle";

import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";
import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";

import LoadingIcon from "../../resources/icons/loading.svg";

export default function ConfirmStartFastingPopup() {
    const { startFasting } = useContext(API);
    const { set, get } = useContext(GlobalState);
    const { user } = useContext(Data);
    const { areSameDate } = useContext(Utils);

    const { fastObjectiveInMinutes, lastTimeUserStartedFasting, timezoneOffsetInMs } = user.current;

    // #################################################
    //   DATE LIMIT
    // #################################################

    // Lower limit
    const fastStartTime = new Date(lastTimeUserStartedFasting);
    fastStartTime.setTime(fastStartTime.getTime() - timezoneOffsetInMs);
    var minHours = 0;

    // Upper limit
    const currTime = new Date();
    var maxHours = currTime.getHours();
    var maxMinutes = currTime.getMinutes();

    // #################################################
    //   STATE
    // #################################################

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [editDate, setEditDate] = useState(false);
    const data = useRef({ date: { h: maxHours, m: maxMinutes } });
    const [update, setUpdate] = useState(true);

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
        const { date } = data.current;
        setLoading(true);

        const startFastingDate = new Date();
        startFastingDate.setHours(date.h);
        startFastingDate.setMinutes(date.m);

        const result = await startFasting(startFastingDate);
        setLoading(false);
        if (checkError(result)) return;

        set("showPopup", { ...get("showPopup"), visible: false });
    }, 2000);

    const handleCancelClick = () => {
        set("showPopup", { ...get("showPopup"), visible: false });
    };

    // #################################################
    //   RENDER
    // #################################################

    const editedStartFastingDate = new Date();
    editedStartFastingDate.setHours(data.current.date.h);
    editedStartFastingDate.setMinutes(data.current.date.m);
    var endFastingDate = new Date(editedStartFastingDate.getTime() + fastObjectiveInMinutes * 60 * 1000);
    var endHours = endFastingDate.getHours();
    var endMinutes = endFastingDate.getMinutes();

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var day = areSameDate(endFastingDate, tomorrow) ? "tomorrow" : "today";

    return (
        <div className="PopupContent">
            <h1>{"Start fasting?"}</h1>
            <div className={"subtitle"}>
                {`You will fast until ${day} at ${endHours < 10 ? `0${endHours}` : endHours}h ${
                    endMinutes < 10 ? `0${endMinutes}` : endMinutes
                }m.`}
                <p className={cn({ visible: error })}>{error || "Error"}</p>
            </div>
            <div className={"loadingContainer"}>
                <SVG className={cn("loadingIcon", "spin", "infinite", { visible: loading })} src={LoadingIcon} />
            </div>

            {editDate ? (
                <DatePicker
                    data={{ pickerType: "date" }}
                    parentData={data}
                    min={minHours}
                    max={maxHours}
                    updateParent={handleUpdateParent}
                />
            ) : (
                <div className="editDateButton" onClick={() => setEditDate(true)}>
                    {"Edit start time"}
                </div>
            )}

            <div className="separation"></div>
            <Button data={{ content: "Start" }} nextPhase={handleConfirmClick} />

            <div className="separation"></div>
            <Button data={{ content: "Cancel" }} low={true} nextPhase={handleCancelClick} isLastInteractible={true} />
        </div>
    );
}
