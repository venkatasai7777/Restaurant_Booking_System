import { CheckCircle, XCircle } from 'lucide-react';

export default function BookingActionButtons({ reservation, onConfirm, onReject, onCancel }) {
  return (
    <div className="row-actions">
      {reservation.status === 'pending' && (
        <>
          <button className="icon-button success" type="button" onClick={() => onConfirm(reservation.id)} aria-label="Confirm reservation">
            <CheckCircle size={17} />
          </button>
          <button className="icon-button warning" type="button" onClick={() => onReject(reservation.id)} aria-label="Reject reservation">
            <XCircle size={17} />
          </button>
        </>
      )}
      {reservation.status !== 'cancelled' && (
        <button className="button button-small danger" type="button" onClick={() => onCancel(reservation.id)}>
          Cancel
        </button>
      )}
    </div>
  );
}
