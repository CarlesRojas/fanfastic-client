import { useState, useContext, useRef, useEffect } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";

import { API } from "../../contexts/API";

import EmailIcon from "../../resources/icons/email.svg";
import UsernameIcon from "../../resources/icons/username.svg";
import PasswordIcon from "../../resources/icons/password.svg";
import UpIcon from "../../resources/icons/up.svg";
import RightIcon from "../../resources/icons/right.svg";

export default function Input({ data, handleAction, last, lastCard, handleError, current }) {
    const { isEmailValid, isUsernameValid, isPasswordValid } = useContext(API);

    const { inputType, action } = data;

    // #################################################
    //   CHECK VALIDITY
    // #################################################

    const [hasContent, setHasContent] = useState(false);
    const inputRef = useRef();

    const handleChange = () => {
        setHasContent(inputRef.current.value.length > 0);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === "Tab") handleEnter();
    };

    const handleEnter = async () => {
        var validate = () => ({ success: true });

        if (inputType === "email") validate = isEmailValid;
        else if (inputType === "text") validate = isUsernameValid;
        else if (inputType === "password") validate = isPasswordValid;

        if (action === "registerEnterEmail") var validationResult = await validate(inputRef.current.value, true);
        else validationResult = await validate(inputRef.current.value, false);

        if ("error" in validationResult) handleError(validationResult.error.replaceAll(`"`, ""));
        else {
            handleAction(inputRef.current.value);
        }
    };

    const handleFocus = (event) => {
        var temp_value = event.target.value;
        event.target.value = "";
        event.target.value = temp_value;
    };

    useEffect(() => {
        if (current) inputRef.current.focus();
    }, [current, inputType]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("Input", { last })} onKeyDown={handleKeyDown}>
            <input
                type={inputType}
                autoComplete="new-password"
                onChange={handleChange}
                onFocus={handleFocus}
                ref={inputRef}
            />

            <div className="enter" onClick={handleEnter}>
                <SVG
                    className={cn("icon", { up: hasContent })}
                    src={inputType === "email" ? EmailIcon : inputType === "text" ? UsernameIcon : PasswordIcon}
                />
                <SVG className={cn("icon", { down: !hasContent })} src={lastCard ? RightIcon : UpIcon} />
            </div>
        </div>
    );
}
