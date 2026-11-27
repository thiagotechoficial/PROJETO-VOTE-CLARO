import React from 'react';

interface ToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  activeText?: string;
  inactiveText?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  activeText = 'Ativado',
  inactiveText = 'Desativado',
}) => {
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;

  return (
    <div className="toggle-row">
      <div className="toggle-text">
        <span id={labelId} className="toggle-label">
          {label}
        </span>
        {description && (
          <span id={descId} className="toggle-desc">
            {description}
          </span>
        )}
        <span className="toggle-desc" aria-hidden="true">
          Estado atual: <strong>{checked ? activeText : inactiveText}</strong>
        </span>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        className="toggle-switch"
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-track" aria-hidden="true">
          <span className="toggle-thumb" />
        </span>
      </button>
    </div>
  );
};
