import cn from "classnames";

export default function SettingsButton({ text, blue, red }) {
    return <div className={cn("SettingsButton", { blue }, { red })}>{text}</div>;
}
