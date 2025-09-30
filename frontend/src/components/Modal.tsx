import React, { ReactNode } from 'react'
import styled from 'styled-components'

const Overlay = styled.div``

const ModalContainer = styled.div``

const ModalHeader = styled.div``

const ModalTitle = styled.h2``

const CloseButton = styled.button``

const ModalBody = styled.div``

const ModalFooter = styled.div``

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
    <Overlay onClick={onClose} data-testid="modal-overlay">
      <ModalContainer onClick={(e) => e.stopPropagation()} data-testid="modal">
        <ModalHeader>
          <ModalTitle data-testid="modal-title">{title}</ModalTitle>
          <CloseButton onClick={onClose} data-testid="modal-close">
            ✕
          </CloseButton>
        </ModalHeader>
        <ModalBody data-testid="modal-body">{children}</ModalBody>
        {footer && (
          <ModalFooter data-testid="modal-footer">{footer}</ModalFooter>
        )}
      </ModalContainer>
    </Overlay>
  )
}

export default Modal
