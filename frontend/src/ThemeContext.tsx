import React, { createContext, useState } from "react";

export const DarkTheme = {
    colors: {
        primary: '#0070f3',
        bg: '#fff',
        text: '#333',
        grey: '#aaa',
    },
};

export const ThemeContext = createContext({ theme: DarkTheme, changeTheme: (theme: any) => { } });

export function ThemeContextWrapper(props: any) {
    const [theme, setTheme] = useState(DarkTheme);

    function changeTheme(theme: any) {
        setTheme(theme);
    }

    function test() {
        console.log(props.children)
        return props.children
    }

    return (
        <ThemeContext.Provider value={{ theme: DarkTheme, changeTheme: changeTheme }}>
            {test()}
        </ThemeContext.Provider>
    );
}
