import React, { useEffect, useState } from "react";
import cn from "classnames";

const ProgressCircle = ({
    radius,
    progress,
    steps,
    cut,
    rotate,
    strokeWidth,
    strokeColor,
    fillColor,
    strokeLinecap,
    trackStrokeColor,
    trackStrokeWidth,
    trackStrokeLinecap,
    counterClockwise,
    inverse,
    children,
}) => {
    const getProgress = () => progress;

    const getStrokeDashoffset = (strokeLength) => {
        const progress = getProgress();
        const progressLength = (strokeLength / steps) * (steps - progress);

        if (inverse) {
            return counterClockwise ? 0 : progressLength - strokeLength;
        }

        return counterClockwise ? -1 * progressLength : progressLength;
    };

    const getStrokeDashArray = (strokeLength, circumference) => {
        const progress = getProgress();
        const progressLength = (strokeLength / steps) * (steps - progress);

        if (inverse) {
            return `${progressLength}, ${circumference}`;
        }

        return counterClockwise
            ? `${strokeLength * (progress / 100)}, ${circumference}`
            : `${strokeLength}, ${circumference}`;
    };

    const getTrackStrokeDashArray = (strokeLength, circumference) => {
        return `${strokeLength}, ${circumference}`;
    };

    const getExtendedWidth = () => {
        if (strokeWidth > trackStrokeWidth) {
            return strokeWidth * 2;
        }

        return trackStrokeWidth * 2;
    };

    const d = 2 * radius;
    const width = d + getExtendedWidth();

    const circumference = 2 * Math.PI * radius;
    const strokeLength = (circumference / 360) * (360 - cut);

    const [animateProgress, setAnimateProgress] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => setAnimateProgress(true), 0);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div
            className={cn("ProgressCircle", { animateProgress })}
            style={{
                position: "relative",
                width: `${width}px`,
                height: `${width}px`,
            }}
        >
            <svg
                width={width}
                height={width}
                viewBox={`0 0 ${width} ${width}`}
                style={{ transform: `rotate(${rotate}deg)` }}
            >
                {trackStrokeWidth > 0 && (
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke={trackStrokeColor}
                        strokeWidth={trackStrokeWidth}
                        strokeDasharray={getTrackStrokeDashArray(strokeLength, circumference)}
                        strokeLinecap={trackStrokeLinecap}
                        className="track"
                    />
                )}
                {strokeWidth > 0 && (
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={getStrokeDashArray(strokeLength, circumference)}
                        strokeDashoffset={getStrokeDashoffset(strokeLength)}
                        strokeLinecap={strokeLinecap}
                        className="progress"
                    />
                )}
            </svg>

            {children}
        </div>
    );
};

ProgressCircle.defaultProps = {
    radius: 100,
    progress: 0,
    steps: 100,
    cut: 0,
    rotate: -90,

    strokeWidth: 20,
    strokeColor: "indianred",
    fillColor: "none",
    strokeLinecap: "round",

    trackStrokeColor: "#e6e6e6",
    trackStrokeWidth: 20,
    trackStrokeLinecap: "round",

    counterClockwise: false,
    inverse: false,
};

export default ProgressCircle;
