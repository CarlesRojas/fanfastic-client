import cn from "classnames";

export default function SettingsButton({ text, blue, red, handleClick }) {
    return (
        <div className={cn("SettingsButton", { blue }, { red })} onClick={handleClick}>
            {text}
        </div>
    );
}
