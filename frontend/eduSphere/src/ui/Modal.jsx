/* eslint-disable react/prop-types */
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import ReactDOM from "react-dom";

// Création du contexte pour le modal
const ModalContext = createContext();

// Composant principal Modal
function Modal({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

// Composant Trigger pour ouvrir le modal
function Trigger({ children, ...props }) {
  const { openModal } = useContext(ModalContext);

  return (
    <button onClick={openModal} {...props}>
      {children}
    </button>
  );
}

// Composant Content pour le contenu du modal
function Content({ children }) {
  const { isOpen, closeModal } = useContext(ModalContext);
  const modalContentRef = useRef();

  // Gestion de la fermeture avec la touche ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] overflow-y-auto"
      onClick={closeModal}
    >
      <div
        ref={modalContentRef}
        className="bg-white rounded-xl shadow-2xl p-8 min-w-[500px] max-w-4xl w-full mx-4 my-auto relative" // Modification ici
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

// Composants enfants
function Header({ children }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">{children}</h3>
      <CloseButton />
    </div>
  );
}

function Body({ children }) {
  return <div className="mb-4">{children}</div>;
}

function Footer({ children }) {
  const { closeModal } = useContext(ModalContext);

  return (
    <div className="flex justify-end gap-2">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Fusionne onClick original avec closeModal
        const originalOnClick = child.props.onClick;
        if (child.props.closeOnClick) {
          return React.cloneElement(child, {
            onClick: (e) => {
              if (originalOnClick) originalOnClick(e);
              closeModal();
            },
          });
        }
      })}
    </div>
  );
}

function CloseButton({ children, ...props }) {
  const { closeModal } = useContext(ModalContext);

  return (
    <button
      onClick={closeModal}
      className="text-gray-500 hover:text-gray-700"
      aria-label="Fermer"
      {...props}
    >
      {children || "×"}
    </button>
  );
}

// Attribution des composants enfants au parent Modal
Modal.Trigger = Trigger;
Modal.Content = Content;
Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.CloseButton = CloseButton;

export default Modal;
export { ModalContext };
