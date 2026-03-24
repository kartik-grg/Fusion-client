import Alert from './Alert';

export default function RoleRestricted({
  title = 'Access Restricted',
  message = 'You do not have permission to access this section.',
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <Alert type="danger">
        <strong>{title}</strong>
        <div style={{ marginTop: 6 }}>{message}</div>
      </Alert>
    </div>
  );
}
