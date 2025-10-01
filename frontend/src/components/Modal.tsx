import React, { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      data-testid="modal-overlay"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="modal"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2
            className="text-xl font-semibold text-gray-900"
            data-testid="modal-title"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            data-testid="modal-close"
          >
            ✕
          </button>
        </div>
        <div
          className="px-6 py-4 overflow-y-auto flex-1"
          data-testid="modal-body"
        >
          {children}
        </div>
        {footer && (
          <div
            className="px-6 py-4 border-t border-gray-200"
            data-testid="modal-footer"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
