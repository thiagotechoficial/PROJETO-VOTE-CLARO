import React from 'react';
import { AccessibilityProfile } from '../types';
import { Icon } from './Icon';

interface AppHeaderProps {
  profile: AccessibilityProfile;
  isOnSettings: boolean;
  onOpenSettings: () => void;
  onReturnToWelcome: () => void;
}

export const PROFILE_LABELS: Record<AccessibilityProfile, string> = {
  padrao: 'Padrão',
  visual: 'Visual',
  auditiva: 'Auditiva',
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  profile,
  isOnSettings,
  onOpenSettings,
  onReturnToWelcome,
}) => {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="shield" size={19} />
          </span>
          <div>
            <p className="brand-title">Voto Claro</p>
            <p className="brand-subtitle">Checagem eleitoral acessível</p>
          </div>
        </div>

        <div className="header-actions">
          {!isOnSettings && (
            <button
              type="button"
              className="header-icon-btn"
              aria-label="Ir para Configurações e preferências de acessibilidade"
              onClick={onOpenSettings}
            >
              <Icon name="settings" size={19} />
            </button>
          )}
        </div>
      </div>

      <div className="header-utility-row">
        <button
          type="button"
          className="header-back-welcome-btn"
          onClick={onReturnToWelcome}
        >
          <Icon name="arrow-left" size={16} />
          <span>Voltar à tela inicial</span>
        </button>

        <span className="active-profile-pill">
          Perfil: {PROFILE_LABELS[profile]}
        </span>
      </div>
    </header>
  );
};
