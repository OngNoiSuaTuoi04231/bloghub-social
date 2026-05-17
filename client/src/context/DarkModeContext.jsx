import {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  const DarkModeContext = createContext();
  
  export function DarkModeProvider({ children }) {
  
    const [dark, setDark] = useState(() => {
  
      const savedTheme =
        localStorage.getItem("darkMode");
  
      // Nếu user đã chọn trước đó
      if (savedTheme !== null) {
        return savedTheme === "true";
      }
  
      // Nếu chưa có thì lấy theo hệ thống
      return window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    });
  
    // Lưu lại theme
    useEffect(() => {
      localStorage.setItem("darkMode", dark);
    }, [dark]);
  
    const toggleDark = () => {
      setDark((prev) => !prev);
    };
  
    return (
      <DarkModeContext.Provider
        value={{
          dark,
          toggleDark,
          setDark,
        }}
      >
        {children}
      </DarkModeContext.Provider>
    );
  }
  
  export function useDarkMode() {
    return useContext(DarkModeContext);
  }