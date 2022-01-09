import { createContext, useRef } from "react";

const APP_NAME = "fanfastic";

export const Data = createContext();
const DataProvider = (props) => {
    // #################################################
    //   USER INFO
    // #################################################

    const token = useRef(null);
    const user = useRef(null);
    const historic = useRef({});

    return (
        <Data.Provider
            value={{
                APP_NAME,

                // USER INFO
                token,
                user,
                historic,
            }}
        >
            {props.children}
        </Data.Provider>
    );
};

export default DataProvider;
