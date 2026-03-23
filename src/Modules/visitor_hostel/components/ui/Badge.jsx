import { statusBadgeClass } from '../../utils/helpers';

export default function Badge({ status, children, className = '' }) {
  const text = children ?? status;
  return (
    <span className={`badge ${statusBadgeClass(status)} ${className}`}>
      {text}
    </span>
  );
}
