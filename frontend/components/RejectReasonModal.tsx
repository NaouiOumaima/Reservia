// frontend/app/components/RejectReasonModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@/components/ui/Icons';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectReasonModal({ isOpen, onClose, onConfirm }: RejectReasonModalProps) {
  const [reason, setReason] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleConfirm = () => {
    onConfirm(reason);
    onClose();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const predefinedReasons = [
    'Créneau déjà réservé',
    'Service temporairement indisponible',
    'Prix non convenu',
    'Horaires incompatibles',
    'Client non éligible',
    'Autre raison'
  ];

  return (
    <div className={`reject-modal-overlay ${isOpen ? 'open' : 'closed'}`} onClick={handleClose}>
      <div className={`reject-modal-container ${isOpen ? 'open' : 'closed'}`} onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="reject-modal-close">
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="reject-modal-header">
          <div className="reject-modal-icon">
            <XMarkIcon className="w-6 h-6" />
          </div>
          <h2 className="reject-modal-title">Refuser la réservation</h2>
          <p className="reject-modal-description">
            Veuillez indiquer la raison du refus. Cela aidera le client à comprendre votre décision.
          </p>
        </div>

        <div className="reject-modal-content">
          <div className="reject-modal-predefined">
            <label className="reject-modal-label">Raisons courantes :</label>
            <div className="reject-modal-buttons">
              {predefinedReasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`reject-predefined-btn ${reason === r ? 'active' : ''}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="reject-modal-custom">
            <label htmlFor="custom-reason" className="reject-modal-label">
              Ou écrivez votre propre raison :
            </label>
            <textarea
              id="custom-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez la raison du refus..."
              className="reject-modal-textarea"
              rows={4}
            />
          </div>
        </div>

        <div className="reject-modal-footer">
          <button onClick={handleClose} className="reject-modal-btn reject-modal-btn-cancel">
            Annuler
          </button>
          <button onClick={handleConfirm} className="reject-modal-btn reject-modal-btn-confirm">
            <XMarkIcon className="w-4 h-4" />
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  );
}