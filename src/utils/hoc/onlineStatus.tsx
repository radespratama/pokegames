import { useState, useEffect, ComponentType } from "react";

interface WithOnlineStatusProps {
  onlineStatus: boolean;
}

const withOnlineStatus = <P extends object>(
  WrappedComponent: ComponentType<P & WithOnlineStatusProps>,
) => {
  return (props: P) => {
    const [onlineStatus, setOnlineStatus] = useState(true);

    useEffect(() => {
      const handleOffline = () => {
        setOnlineStatus(false);
      };
      const handleOnline = () => {
        setOnlineStatus(true);
      };

      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);

      return () => {
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("online", handleOnline);
      };
    }, []);

    return <WrappedComponent {...props} onlineStatus={onlineStatus} />;
  };
};

export default withOnlineStatus;
