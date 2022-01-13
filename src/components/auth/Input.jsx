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
import LoadingIcon from "../../resources/icons/loading.svg";

export default function Input({
    data,
    nextPhase,
    handleError,
    isLastInteractible,
    isLastPhase,
    isCurrentPhase,
    parentData,
}) {
    const { isEmailValid, isUsernameValid, isPasswordValid } = useContext(API);
    const { inputType } = data;

    // #################################################
    //   STATE
    // #################################################

    const [hasContent, setHasContent] = useState(false);
    const inputRef = useRef();

    // #################################################
    //   CHECK VALIDITY
    // #################################################

    const validatingRef = useRef(false);
    const [validating, setValidating] = useState(false);

    const handleEnter = useThrottle(async () => {
        if (validatingRef.current) return;
        validatingRef.current = true;
        setValidating(true);

        const value = inputRef.current.value;

        var validate = () => ({ success: true });

        if (inputType === "email") validate = isEmailValid;
        else if (inputType === "username") validate = isUsernameValid;
        else if (inputType === "password") validate = isPasswordValid;

        if (inputType === "email") var validationResult = await validate(value, true);
        else validationResult = await validate(value, false);

        if ("error" in validationResult) handleError(validationResult.error.replaceAll(`"`, ""));
        else {
            parentData.current[inputType] = value;
            nextPhase();
        }
        setValidating(false);
        validatingRef.current = false;
    }, 1500);

    // #################################################
    //   HANDLERS
    // #################################################

    const handleChange = () => {
        setHasContent(inputRef.current.value.length > 0);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === "Tab") handleEnter();
    };

    const handleFocus = (event) => {
        var temp_value = event.target.value;
        event.target.value = "";
        event.target.value = temp_value;
    };

    // #################################################
    //   FOCUS & INITIAL DATA
    // #################################################

    useEffect(() => {
        if (isCurrentPhase) inputRef.current.focus();
    }, [isCurrentPhase]);

    useEffect(() => {
        inputRef.current.value = parentData.current[inputType];
    }, [parentData, inputType]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("Input", { last: isLastInteractible })} onKeyDown={handleKeyDown}>
            <input
                type={inputType === "email" ? "email" : inputType === "username" ? "text" : "password"}
                autoComplete="new-password"
                onChange={handleChange}
                onFocus={handleFocus}
                ref={inputRef}
            />

            <div className={cn("enter", { validating })} onClick={handleEnter}>
                <SVG
                    className={cn("icon", { up: hasContent })}
                    src={inputType === "email" ? EmailIcon : inputType === "username" ? UsernameIcon : PasswordIcon}
                />
                <SVG
                    className={cn("icon", { down: !hasContent }, { spin: validating }, { infinite: validating })}
                    src={validating ? LoadingIcon : isLastPhase ? RightIcon : UpIcon}
                />
            </div>
        </div>
    );
}
