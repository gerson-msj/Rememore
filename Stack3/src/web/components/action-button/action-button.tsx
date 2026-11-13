

interface ActionButtonProps {
  label: string;
  onClick: () => void;
}

export function ActionButton({ label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}