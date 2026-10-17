interface SpinnerProps {
  className?: string;
  label?: string;
}

// Indicador de carga discreto reutilizable (usa color actual del contexto).
export default function Spinner({
  className = "h-5 w-5",
  label = "Cargando…",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
