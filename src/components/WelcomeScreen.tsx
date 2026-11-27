import React, { useEffect, useRef, useState } from 'react';
import { AudienceProfile } from '../types';
import { Icon, IconName } from './Icon';

interface WelcomeScreenProps {
  onConfirmAudience: (audience: AudienceProfile) => void;
  focusHeadingOnMount?: boolean;
  logoSrc?: string;
}

interface WelcomeTileOption {
  id: AudienceProfile;
  label: string;
  description: string;
  icon: IconName;
}

export const AUDIENCE_OPTIONS: WelcomeTileOption[] = [
  {
    id: 'idosa',
    label: 'Pessoa idosa',
    description: 'Letra um pouco maior e leitura confortável.',
    icon: 'text-size',
  },
  {
    id: 'cega',
    label: 'Pessoa cega',
    description: 'Alto contraste, leitor de tela e leitura por voz.',
    icon: 'volume',
  },
  {
    id: 'surda',
    label: 'Pessoa surda',
    description: 'Avisos visuais claros e espaço para Libras.',
    icon: 'hands',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onConfirmAudience,
  focusHeadingOnMount = false,
  logoSrc = '/logo-voto-claro.svg',
}) => {
  const [selectedOption, setSelectedOption] = useState<AudienceProfile | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusHeadingOnMount) {
      headingRef.current?.focus();
    }
  }, [focusHeadingOnMount]);

  const chosenItem = AUDIENCE_OPTIONS.find((item) => item.id === selectedOption) ?? null;

  const handleConfirm = () => {
    if (!selectedOption) return;
    onConfirmAudience(selectedOption);
  };

  return (
    <div className="welcome-shell">
      <header className="welcome-header">
        <img
          src={logoSrc}
          alt="Logotipo Voto Claro"
          className="welcome-logo"
        />
      </header>

      <main className="welcome-main" aria-labelledby="welcome-heading">
        <div className="welcome-intro">
          <h1
            ref={headingRef}
            id="welcome-heading"
            tabIndex={-1}
            className="welcome-title"
          >
            Como você prefere começar?
          </h1>
          <p className="welcome-subtitle">
            Selecione um perfil abaixo e toque em <strong>Próximo</strong>. Você poderá personalizar
            qualquer preferência depois em Configurações.
          </p>
        </div>

        <div className="sr-only" aria-live="polite">
          {chosenItem
            ? `Perfil ${chosenItem.label} selecionado. Botão Próximo habilitado.`
            : ''}
        </div>

        <ul
          className="welcome-grid"
          role="group"
          aria-labelledby="welcome-heading"
        >
          {AUDIENCE_OPTIONS.map((option) => {
            const isSelected = option.id === selectedOption;
            return (
              <li key={option.id} className="welcome-grid-item">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  className={`welcome-square-btn ${
                    isSelected ? 'welcome-square-btn--selected' : ''
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <span className="welcome-square-icon" aria-hidden="true">
                    <Icon name={option.icon} size={28} />
                  </span>
                  <strong className="welcome-square-title">{option.label}</strong>
                  <span className="welcome-square-desc">{option.description}</span>
                  <span className="welcome-square-state" aria-hidden="true">
                    {isSelected ? '✓ Selecionado' : 'Toque para selecionar'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </main>

      <footer className="welcome-footer">
        {!chosenItem && (
          <p id="welcome-next-hint" className="welcome-footer-hint">
            Escolha uma das três opções acima para liberar o avanço.
          </p>
        )}
        <button
          type="button"
          className="welcome-next-btn"
          disabled={!chosenItem}
          aria-describedby={!chosenItem ? 'welcome-next-hint' : undefined}
          aria-label={
            chosenItem
              ? `Próximo: entrar no Voto Claro com sugestões para ${chosenItem.label}`
              : 'Próximo (selecione primeiro um perfil acima)'
          }
          onClick={handleConfirm}
        >
          <span>Próximo</span>
          <Icon name="chevron-right" size={20} />
        </button>
      </footer>
    </div>
  );
};
