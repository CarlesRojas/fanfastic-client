export default function Elem({ title, value, actionText, handleClick }) {
    return (
        <div className={"Elem"} onClick={handleClick}>
            <div className="info">
                <p className="title">{title}</p>
                <p className="value">{value}</p>
            </div>
            <p className="actionText">{actionText}</p>
        </div>
    );
}
