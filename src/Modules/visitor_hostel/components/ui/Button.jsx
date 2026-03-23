export default function Button({
  children, onClick, variant = 'default', size = 'md',
  disabled = false, type = 'button', className = '', icon = null,
}) {
  const variants = {
    default: 'btn',
    primary: 'btn btn-primary',
    success: 'btn btn-success',
    danger:  'btn btn-danger',
    ghost:   'btn btn-ghost',
    icon:    'btn-icon',
  };
  const sizes = { sm: 'btn-sm', md: '', lg: '' };
  return (
    <button
      type={type}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && icon}
      {children}
    </button>
  );
}
