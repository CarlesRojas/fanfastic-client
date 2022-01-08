import { createContext, useRef } from "react";

const APP_NAME = "fanfastic";

export const Data = createContext();
const DataProvider = (props) => {
    // #################################################
    //   USER INFO
    // #################################################

    const token = useRef(null);
    const username = useRef(null);
    const userID = useRef(null);

    return (
        <Data.Provider
            value={{
                APP_NAME,

                // USER INFO
                token,
                username,
                userID,
            }}
        >
            {props.children}
        </Data.Provider>
    );
};

export default DataProvider;
