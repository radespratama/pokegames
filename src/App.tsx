import { Global } from "@emotion/react";
import { Toaster, toast } from "react-hot-toast";

import Routes from "routes";
import { GlobalProvider } from "context";
import { globalStyle } from "emotion/global.style";
import withOnlineStatus from "utils/hoc/onlineStatus";
import { useEffect } from "react";

interface AppProps {
  onlineStatus?: boolean;
}

function App({ onlineStatus }: AppProps) {
  useEffect(() => {
    if (!onlineStatus) {
      toast.error("You are offline", {
        position: "top-right",
      });
    }

    return () => {
      toast.dismiss();
    };
  }, [onlineStatus]);

  return (
    <>
      <Global styles={globalStyle} />
      <GlobalProvider>
        <Routes />
      </GlobalProvider>
      <Toaster position="top-right" />
    </>
  );
}

export default withOnlineStatus(App);
