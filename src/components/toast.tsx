import { ReactChild, ReactNode, useState } from "react";
import { EuiGlobalToastList } from "@elastic/eui";
import { Toast } from "@elastic/eui/src/components/toast/global_toast_list";

let addToastHandler: (color: string, title: ReactNode, text: ReactChild) => void;
let removeAllToastsHandler: () => void;
let toastId = 0;

export function addToast({ color, title, text }: Toast) {
  addToastHandler(color, title, text);
}
export function removeAllToasts() {
  removeAllToastsHandler();
}
const GlobalToastList = () => {
  const [toasts, setToasts] = useState([]);

  addToastHandler = (color: string, title: string, text: string) => {
    setToasts(
      toasts.concat({
        id: `toast-${toastId++}`,
        color,
        title,
        text,
      }),
    );
  };

  const removeToast = (removedToast: Toast) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== removedToast.id));
  };

  removeAllToastsHandler = () => {
    setToasts([]);
  };

  return <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={6000} />;
};

export default GlobalToastList;
