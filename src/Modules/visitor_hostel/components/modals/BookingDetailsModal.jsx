import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import { api } from '../../api/client';
import { formatDate } from '../../utils/helpers';

function DetailRow({ label, value }) {
  return (
    <div className="info-row" style={{ marginBottom: 8 }}>
      <div className="info-key">{label}</div>
      <div className="info-val">{value || '—'}</div>
    </div>
  );
}

export default function BookingDetailsModal({ isOpen, onClose, booking }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!isOpen || !booking?.backendId) return;

    let mounted = true;
    setLoading(true);
    setError('');

    api.getBooking(booking.backendId)
      .then((data) => {
        if (mounted) setDetails(data);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load booking details.');
          setDetails(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, booking?.backendId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="lg" footer={<button className="btn" onClick={onClose}>Close</button>}>
      {loading && <Alert type="info">Loading booking details...</Alert>}
      {error && <Alert type="danger">{error}</Alert>}

      {!loading && !error && details && (
        <div className="info-grid">
          <DetailRow label="Booking Number" value={details.booking_number} />
          <DetailRow 
            label="Status" 
            value={
              <span>
                {details.status}
                {details.is_offline && (
                  <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 6px', borderRadius: 4, background: '#ffd700', color: '#000', fontWeight: 500 }}>
                    OFFLINE
                  </span>
                )}
              </span>
            } 
          />
          <DetailRow label="Intender" value={details.intender_name} />
          <DetailRow label="Intender Email" value={details.intender_email} />
          <DetailRow label="Department" value={details.department} />

          <DetailRow label="Visitor Name" value={details.visitor_name} />
          <DetailRow label="Visitor Category" value={details.visitor_category} />
          <DetailRow label="Visitor Phone" value={details.visitor_phone} />
          <DetailRow label="Visitor Email" value={details.visitor_email} />
          <DetailRow label="Organization" value={details.visitor_organization} />
          <DetailRow label="Designation" value={details.visitor_designation} />
          <DetailRow label="Address" value={details.visitor_address} />

          <DetailRow label="Check-in" value={formatDate(details.check_in_date)} />
          <DetailRow label="Check-out" value={formatDate(details.check_out_date)} />
          <DetailRow label="Guests" value={String(details.number_of_guests || '')} />
          <DetailRow label="Rooms" value={String(details.number_of_rooms || '')} />
          <DetailRow label="Preferred Room Type" value={details.preferred_room_type} />

          <DetailRow label="Purpose" value={details.purpose} />
          <DetailRow label="Purpose Details" value={details.purpose_details} />
          <DetailRow label="Bill Settled By" value={details.bill_to_be_settled_by} />
          <DetailRow label="Project Number" value={details.project_number} />
          <DetailRow label="Remark" value={details.remark} />

          <DetailRow label="Forwarded By" value={details.forwarded_by_name} />
          <DetailRow label="Approved By" value={details.approved_by_name} />
          <DetailRow label="Rejection Reason" value={details.rejection_reason} />
          <DetailRow label="Booking Date" value={formatDate(details.booking_date)} />
          <DetailRow label="Last Updated" value={formatDate(details.updated_at)} />
        </div>
      )}
    </Modal>
  );
}
