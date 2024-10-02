import ReactDOM from "react-dom";
import PropTypes from "prop-types";

function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex select-none items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="rounded-md bg-white p-4 md:px-14 md:py-8" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById("modal-portal"),
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
};

export default Modal;
