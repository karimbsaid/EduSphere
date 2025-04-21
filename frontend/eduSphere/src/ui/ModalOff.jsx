/* eslint-disable react/prop-types */
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import Button from "./Button";

const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = setOpenName;

  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opens: opensWindowName }) {
  const { open } = useContext(ModalContext);

  return cloneElement(children, { onClick: () => open(opensWindowName) });
}

function Window({ children, name }) {
  const { openName, close } = useContext(ModalContext);
  const modalElement = useRef();
  useEffect(
    function () {
      function callback(e) {
        if (modalElement.current && !modalElement.current.contains(e.target)) {
          close();
        }
      }
      document.addEventListener("click", callback, true);
      return () => document.removeEventListener("click", callback);
    },
    [close]
  );

  if (name !== openName) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] overflow-y-auto">
      <div
        ref={modalElement}
        className="bg-white rounded-xl shadow-2xl p-8  max-w-4xl w-full mx-4 my-auto relative"
      >
        <button onClick={close}>
          <HiXMark />
        </button>

        <div>{cloneElement(children, { onClose: close })}</div>
      </div>
    </div>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
