import React, { useEffect, useState, useContext } from "react";
import cn from "classnames";

import { Utils } from "../../contexts/Utils";

const ProgressLine = ({
    totalWidth,
    progress,
    steps,
    strokeWidth,
    strokeColor,
    fillColor,
    strokeLinecap,
    trackStrokeColor,
    trackStrokeWidth,
    trackStrokeLinecap,
    text,
    fontSize,
}) => {
    const { clamp } = useContext(Utils);

    const getBiggerStrokeWidth = () => {
        if (strokeWidth > trackStrokeWidth) return strokeWidth;
        return trackStrokeWidth;
    };

    const getExtendedWidth = () => {
        if (strokeWidth > trackStrokeWidth) return strokeWidth * 2;
        return trackStrokeWidth * 2;
    };

    const getProgressWidth = () => {
        return clamp(progress / steps) * width;
    };

    const width = totalWidth - getExtendedWidth();

    const [animateProgress, setAnimateProgress] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => setAnimateProgress(true), 0);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div
            className={cn("ProgressLine", { animateProgress })}
            style={{
                position: "relative",
                width: `${totalWidth}px`,
                height: `${getExtendedWidth() + fontSize}px`,
            }}
        >
            <svg
                width={totalWidth}
                height={getExtendedWidth() + fontSize}
                viewBox={`0 0 ${totalWidth} ${getExtendedWidth() + fontSize}`}
            >
                {trackStrokeWidth > 0 && (
                    <line
                        x1={getBiggerStrokeWidth()}
                        y1={getBiggerStrokeWidth() + fontSize}
                        x2={totalWidth - getBiggerStrokeWidth()}
                        y2={getBiggerStrokeWidth() + fontSize}
                        fill="none"
                        stroke={trackStrokeColor}
                        strokeWidth={trackStrokeWidth}
                        strokeLinecap={trackStrokeLinecap}
                        className="track"
                    />
                )}
                {strokeWidth > 0 && (
                    <line
                        x1={getBiggerStrokeWidth()}
                        y1={getBiggerStrokeWidth() + fontSize}
                        x2={totalWidth - getBiggerStrokeWidth()}
                        y2={getBiggerStrokeWidth() + fontSize}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap={strokeLinecap}
                        strokeDasharray={`${getProgressWidth()}, ${width + 1}`}
                        className="progress"
                    />
                )}

                {text.length && (
                    <text
                        x={getBiggerStrokeWidth()}
                        y={fontSize}
                        className="progresslabel"
                        style={{
                            textAnchor: "middle",
                            fontSize,
                            transform: `translateX(${getProgressWidth()}px)`,
                            transition: "all 0.2s linear",
                        }}
                    >
                        {text}
                    </text>
                )}
            </svg>
        </div>
    );
};

ProgressLine.defaultProps = {
    totalWidth: 100,
    progress: 0,
    steps: 100,

    strokeWidth: 20,
    strokeColor: "indianred",
    fillColor: "none",
    strokeLinecap: "round",

    trackStrokeColor: "#e6e6e6",
    trackStrokeWidth: 20,
    trackStrokeLinecap: "round",

    text: "",
    fontSize: 12,
};

export default ProgressLine;
