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

    const currTime = new Date();
    var hours = currTime.getHours();
    var minutes = currTime.getMinutes();

    // #################################################
    //   STATE
    // #################################################

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [editDate, setEditDate] = useState(false);
    const data = useRef({ date: { h: hours, m: minutes } });

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

        const result = await stopFasting();
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

    const now = new Date();
    const fastStartTime = new Date(lastTimeUserStartedFasting);
    fastStartTime.setTime(fastStartTime.getTime() - timezoneOffsetInMs);

    const fastDurationInMilliseconds = Math.abs(now - fastStartTime);
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
                <DatePicker data={{ pickerType: "date" }} parentData={data} />
            ) : (
                <div className="editDateButton" onClick={() => setEditDate(true)}>
                    {"Edit end date & time"}
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
