export default function Elem({ title, value, actionText }) {
    return (
        <div className={"Elem"}>
            <div className="info">
                <p className="title">{title}</p>
                <p className="value">{value}</p>
            </div>
            <p className="actionText">{actionText}</p>
        </div>
    );
}
