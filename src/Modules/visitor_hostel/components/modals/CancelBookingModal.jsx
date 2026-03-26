import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { api } from '../../api/client';
import { formatCurrency } from '../../utils/helpers';

export default function CancelBookingModal({ isOpen, onClose, booking }) {
  const { dispatch } = useApp();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen || !booking?.backendId) return;

    let mounted = true;
    setLoading(true);
    setError('');
    setPreview(null);

    api.previewCancellation({ booking_id: booking.backendId })
      .then((data) => {
        if (mounted) setPreview(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Unable to calculate cancellation charges.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, booking?.backendId]);

  const requestCancellation = async () => {
    if (!booking?.id) return;
    await dispatch({
      type: 'REQUEST_CANCELLATION',
      id: booking.id,
      reason,
    });
    toast.success(`Cancellation request submitted for ${booking.id}`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Booking"
      size="md"
      footer={(
        <>
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-danger" onClick={() => void requestCancellation()} disabled={loading || !preview}>Confirm Cancellation Request</button>
        </>
      )}
    >
      {loading && <Alert type="info">Calculating cancellation charges...</Alert>}
      {error && <Alert type="danger">{error}</Alert>}

      {!loading && !error && preview && (
        <div className="info-grid">
          <div className="info-row">
            <div className="info-key">Booking</div>
            <div className="info-val">{booking.id}</div>
          </div>
          <div className="info-row">
            <div className="info-key">Estimated Room Rent</div>
            <div className="info-val">{formatCurrency(preview.room_rent)}</div>
          </div>
          <div className="info-row">
            <div className="info-key">Days to Arrival</div>
            <div className="info-val">{preview.days_to_arrival}</div>
          </div>
          <div className="info-row">
            <div className="info-key">Penalty Rate</div>
            <div className="info-val">{preview.penalty_percent}%</div>
          </div>
          <div className="info-row">
            <div className="info-key">Cancellation Charge</div>
            <div className="info-val" style={{ fontWeight: 700 }}>{formatCurrency(preview.cancellation_charge)}</div>
          </div>

          <div className="form-group form-full" style={{ marginTop: 8 }}>
            <label>Reason for Cancellation</label>
            <textarea
              placeholder="Provide cancellation reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
