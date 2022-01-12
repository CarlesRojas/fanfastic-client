import { useState, useContext, useRef, useEffect } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import useThrottle from "../../hooks/useThrottle";

import { API } from "../../contexts/API";

import EmailIcon from "../../resources/icons/email.svg";
import UsernameIcon from "../../resources/icons/username.svg";
import PasswordIcon from "../../resources/icons/password.svg";
import UpIcon from "../../resources/icons/up.svg";
import RightIcon from "../../resources/icons/right.svg";

export default function Input({
    data,
    nextPhase,
    handleError,
    isLastInteractible,
    isLastPhase,
    isCurrentPhase,
    registrationData,
}) {
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

    const validating = useRef(false);

    const handleEnter = useThrottle(async () => {
        if (validating.current) return;
        validating.current = true;

        var validate = () => ({ success: true });

        if (inputType === "email") validate = isEmailValid;
        else if (inputType === "text") validate = isUsernameValid;
        else if (inputType === "password") validate = isPasswordValid;

        if (action === "email") var validationResult = await validate(inputRef.current.value, true);
        else validationResult = await validate(inputRef.current.value, false);

        if ("error" in validationResult) handleError(validationResult.error.replaceAll(`"`, ""));
        else nextPhase(inputRef.current.value);
        validating.current = false;
    }, 1500);

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === "Tab") handleEnter();
    };

    const handleFocus = (event) => {
        var temp_value = event.target.value;
        event.target.value = "";
        event.target.value = temp_value;
    };

    useEffect(() => {
        if (isCurrentPhase) inputRef.current.focus();
    }, [isCurrentPhase]);

    useEffect(() => {
        inputRef.current.value = registrationData.current[action];
    }, [registrationData, action]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("Input", { last: isLastInteractible })} onKeyDown={handleKeyDown}>
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
                <SVG className={cn("icon", { down: !hasContent })} src={isLastPhase ? RightIcon : UpIcon} />
            </div>
        </div>
    );
}
