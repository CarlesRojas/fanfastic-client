import { useContext, useState, useRef } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import DatePicker from "../auth/DatePicker";
import Button from "../auth/Button";
import useThrottle from "../../hooks/useThrottle";

import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";
import { Data } from "../../contexts/Data";

import LoadingIcon from "../../resources/icons/loading.svg";

export default function ConfirmEndFastingPopup() {
    const { stopFasting } = useContext(API);
    const { set, get } = useContext(GlobalState);
    const { user } = useContext(Data);

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
        const { date } = data.current;
        setLoading(true);

        const stopFastingDate = new Date();
        stopFastingDate.setHours(date.h);
        stopFastingDate.setMinutes(date.m);

        const result = await stopFasting(stopFastingDate);
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

    const editedStopFastingDate = new Date();
    editedStopFastingDate.setHours(data.current.date.h);
    editedStopFastingDate.setMinutes(data.current.date.m);

    const fastDurationInMilliseconds = Math.abs(editedStopFastingDate - fastStartTime);
    const fastDurationInMinutes = Math.ceil(fastDurationInMilliseconds / 1000 / 60);
    const fastDurationInSeconds = Math.ceil(fastDurationInMilliseconds / 1000);

    const hasReachedGoal = fastDurationInMinutes >= fastObjectiveInMinutes;

    const durationHours = Math.floor(fastDurationInSeconds / 3600);
    const durationUpdatedSeconds = fastDurationInSeconds % 3600;
    const durationMinutes = Math.floor(durationUpdatedSeconds / 60);

    return (
        <div className="PopupContent">
            <h1>{hasReachedGoal ? "Well done!" : "Stop fasting early?"}</h1>
            <div className={"subtitle"}>
                {`You've fasted for a total of ${durationHours < 10 ? `0${durationHours}` : durationHours}h ${
                    durationMinutes < 10 ? `0${durationMinutes}` : durationMinutes
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
                    {"Edit end time"}
                </div>
            )}

            <div className="separation"></div>
            <Button data={{ content: "Finish now" }} nextPhase={handleConfirmClick} />

            <div className="separation"></div>
            <Button
                data={{ content: "Continue fasting" }}
                low={true}
                nextPhase={handleCancelClick}
                isLastInteractible={true}
            />
        </div>
    );
}
