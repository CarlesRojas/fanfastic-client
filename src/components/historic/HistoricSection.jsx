import { useState, useEffect, useContext, useCallback } from "react";
import SVG from "react-inlinesvg";
import cn from "classnames";
import useGlobalState from "../../hooks/useGlobalState";
import useForceUpdate from "../../hooks/useForceUpdate";

import WeightIcon from "../../resources/icons/weight.svg";
import FlameIcon from "../../resources/icons/fire.svg";
import TargetIcon from "../../resources/icons/target.svg";
import LeftIcon from "../../resources/icons/left.svg";
import RightIcon from "../../resources/icons/right.svg";

import { API } from "../../contexts/API";
import { Data } from "../../contexts/Data";
import { Utils } from "../../contexts/Utils";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function HistoricSection() {
    const { getMonthFastEntries } = useContext(API);
    const { fastHistoric, user } = useContext(Data);
    const { clamp } = useContext(Utils);

    const forceUpdate = useForceUpdate();

    const {
        isFasting,
        fastObjectiveInMinutes,
        lastTimeUserStartedFasting,
        timezoneOffsetInMs,
        weightInKg,
        veryFirstWeightInKg,
        fastingStreak,
        totalDaysUserReachedGoal,
    } = user.current;

    // #################################################
    //   LOAD DATA
    // #################################################

    const [date, setDate] = useState({ month: -1, year: -1 });
    const [firstWeekDisplacement, setFirstWeekDisplacement] = useState(0);

    const getData = useCallback(
        async (m, y) => {
            await getMonthFastEntries(m, y);
            forceUpdate();
        },

        // eslint-disable-next-line
        [getMonthFastEntries]
    );

    useEffect(() => {
        const { month, year } = date;
        if (month < 0 || year < 0) return;

        const firstDay = new Date();
        firstDay.setMonth(month - 1);
        firstDay.setYear(year);
        firstDay.setDate(1);
        var weekDay = firstDay.getDay() - 1;
        if (weekDay === -1) weekDay = 6;
        setFirstWeekDisplacement(weekDay);

        getData(month, year);
    }, [date, getData]);

    useEffect(() => {
        const date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        setDate({ month, year });
    }, []);

    // #################################################
    //   HANDLERS
    // #################################################

    const prevMonth = () => {
        setDate(({ month: prevMonth, year: prevYear }) => {
            if (prevMonth === 1) return { month: 12, year: prevYear - 1 };
            else return { month: prevMonth - 1, year: prevYear };
        });
    };

    const nextMonth = () => {
        setDate(({ month: prevMonth, year: prevYear }) => {
            if (prevMonth === 12) return { month: 1, year: prevYear + 1 };
            else return { month: prevMonth + 1, year: prevYear };
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

    var emptyDaysStart = [];
    for (let i = 0; i < firstWeekDisplacement; i++) emptyDaysStart.push(i);

    var numEmptyDaysEnd =
        fastHistoric.current && date.year in fastHistoric.current && date.month in fastHistoric.current[date.year]
            ? firstWeekDisplacement + fastHistoric.current[date.year][date.month].length
            : firstWeekDisplacement;

    var emptyDaysEnd = [];
    for (let i = numEmptyDaysEnd; i < 37; i++) emptyDaysEnd.push(i);

    var startfastingDate = new Date(lastTimeUserStartedFasting);
    startfastingDate.setTime(startfastingDate.getTime() - timezoneOffsetInMs);
    const startfastingDay = isFasting ? startfastingDate.getDate() : -1;

    const today = new Date();
    const currMonth = today.getMonth() + 1;
    const currYear = today.getFullYear();

    return (
        <div className={"HistoricSection"}>
            <div className="ticketContainer">
                <div className="ticket">
                    <SVG className="icon" src={WeightIcon}></SVG>
                    <p className="value">
                        {+Math.abs(veryFirstWeightInKg - weightInKg).toFixed(1)}
                        <span>kg</span>
                    </p>
                    <p className="description">
                        {veryFirstWeightInKg - weightInKg >= 0 ? "Lost weight" : "Gained weight"}
                    </p>
                </div>

                <div className="ticket">
                    <SVG className="icon" src={TargetIcon}></SVG>
                    <p className="value">{totalDaysUserReachedGoal}</p>
                    <p className="description">Fasting days</p>
                </div>

                <div className="ticket">
                    <SVG className="icon" src={FlameIcon}></SVG>
                    <p className="value">
                        {fastingStreak} <span>days</span>
                    </p>
                    <p className="description">Fast Streak</p>
                </div>
            </div>

            <div className="monthSelector">
                <SVG
                    className={cn("icon", { disabled: date.month === 1 && date.year === 2020 })}
                    src={LeftIcon}
                    onClick={prevMonth}
                ></SVG>
                <h2>
                    {MONTHS[date.month - 1]} <span>{date.year}</span>
                </h2>
                <SVG
                    className={cn("icon", { disabled: currMonth === date.month && currYear === date.year })}
                    src={RightIcon}
                    onClick={nextMonth}
                ></SVG>
            </div>

            <div className="calendar">
                {emptyDaysStart.map((_, i) => (
                    <div className="day hidden" key={`empty_${i}`}>
                        <div className="box">
                            <div className="boxContents">
                                <div className={"fill"}></div>
                                <p className="fastDuration">{`0h`}</p>
                            </div>
                        </div>
                        <p className="monthDay">no</p>
                    </div>
                ))}

                {fastHistoric.current &&
                    date.year in fastHistoric.current &&
                    date.month in fastHistoric.current[date.year] &&
                    fastHistoric.current[date.year][date.month].map((elem, i) => {
                        if (currMonth === date.month && currYear === date.year && startfastingDay === i + 1) {
                            const now = new Date();
                            const fastingDurationInMs = Math.abs(now - startfastingDate);
                            const fastingDurationInMinutes = Math.ceil(fastingDurationInMs / 1000 / 60);

                            var fastDurationHours = Math.floor(fastingDurationInMinutes / 60);

                            return (
                                <div className="day" key={i}>
                                    <div className="box">
                                        <div className="boxContents">
                                            <div
                                                className={cn("fill", {
                                                    fail: fastObjectiveInMinutes > fastingDurationInMinutes,
                                                })}
                                                style={{
                                                    height: `${
                                                        clamp(fastingDurationInMinutes / fastObjectiveInMinutes) * 100
                                                    }%`,
                                                }}
                                            ></div>
                                            <p className="fastDuration">{`${fastDurationHours}h`}</p>
                                        </div>
                                    </div>
                                    <p className="monthDay">{i + 1} </p>
                                </div>
                            );
                        }
                        if (!elem)
                            return (
                                <div className="day" key={i}>
                                    <div className="box"></div>
                                    <p className="monthDay">{i + 1} </p>
                                </div>
                            );

                        const { fastDurationInMinutes, fastObjectiveInMinutes: obectiveMinutes, usedWeeklyPass } = elem;
                        fastDurationHours = Math.floor(fastDurationInMinutes / 60);

                        return (
                            <div className="day" key={i}>
                                <div className="box">
                                    <div className="boxContents">
                                        {usedWeeklyPass ? (
                                            <div className="pass"></div>
                                        ) : (
                                            <>
                                                <div
                                                    className={cn("fill", {
                                                        fail: obectiveMinutes > fastDurationInMinutes,
                                                    })}
                                                    style={{
                                                        height: `${
                                                            clamp(fastDurationInMinutes / obectiveMinutes) * 100
                                                        }%`,
                                                    }}
                                                ></div>
                                                <p className="fastDuration">{`${fastDurationHours}h`}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className="monthDay">{i + 1} </p>
                            </div>
                        );
                    })}

                {emptyDaysEnd.map((_, i) => (
                    <div className="day hidden" key={`empty_${i}`}>
                        <div className="box">
                            <div className="boxContents">
                                <div className={"fill"}></div>
                                <p className="fastDuration">{`0h`}</p>
                            </div>
                        </div>
                        <p className="monthDay">no</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
