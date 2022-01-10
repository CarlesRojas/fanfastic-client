import cn from "classnames";

export default function Button({ content, handleClick, last }) {
    return (
        <div className={cn("Button", { last })} onClick={handleClick}>
            {content}
        </div>
    );
}
