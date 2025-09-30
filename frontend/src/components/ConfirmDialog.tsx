import React from 'react'
import styled from 'styled-components'
import Modal from './Modal'

const Message = styled.p``

const ButtonGroup = styled.div``

const Button = styled.button<{ variant?: 'danger' | 'secondary' }>``

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const footer = (
    <ButtonGroup>
      <Button variant="secondary" onClick={onClose} data-testid="cancel-button">
        {cancelText}
      </Button>
      <Button
        variant="danger"
        onClick={handleConfirm}
        data-testid="confirm-button"
      >
        {confirmText}
      </Button>
    </ButtonGroup>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <Message data-testid="confirm-message">{message}</Message>
    </Modal>
  )
}

export default ConfirmDialog
