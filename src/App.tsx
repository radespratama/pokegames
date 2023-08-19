import { useEffect } from "react";
import { Global } from "@emotion/react";
import { Toaster, toast } from "react-hot-toast";

import Routes from "./routes";
import { GlobalProvider } from "./context";
import NoSignal from "./components/NoSignal";
import { globalStyle } from "./emotion/global.style";
import withOnlineStatus from "./utils/hoc/onlineStatus";

interface AppProps {
  onlineStatus?: boolean;
}

function App({ onlineStatus }: AppProps) {
  useEffect(() => {
    if (!onlineStatus) {
      toast(() => <NoSignal />, {
        position: "top-right",
        duration: 50000,
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
