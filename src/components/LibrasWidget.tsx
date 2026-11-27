import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface LibrasWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

interface HumanAvatarSvgProps {
  size: number;
  label?: string;
}

const HumanAvatarSvg: React.FC<HumanAvatarSvgProps> = ({ size, label }) => {
  const a11yProps = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: false as const };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className="human-avatar-svg"
      {...a11yProps}
    >
      {/* Fundo circular acolhedor */}
      <circle cx="40" cy="40" r="38" className="human-avatar-backdrop" />

      {/* Cabelo posterior */}
      <path
        d="M20 36c0-13 9-22 20-22s20 9 20 22v12H20V36z"
        className="human-avatar-hair"
      />

      {/* Ombros e blusa com gola de intérprete */}
      <path
        d="M14 72c3-13 13-19 26-19s23 6 26 19H14z"
        className="human-avatar-shirt"
      />
      <path d="M33 53l7 8 7-8" className="human-avatar-collar" />

      {/* Pescoço */}
      <rect x="35" y="45" width="10" height="10" rx="4" className="human-avatar-skin" />

      {/* Orelhas */}
      <circle cx="25" cy="36" r="3.5" className="human-avatar-skin" />
      <circle cx="55" cy="36" r="3.5" className="human-avatar-skin" />

      {/* Rosto humano acolhedor */}
      <rect x="26" y="21" width="28" height="28" rx="13" className="human-avatar-skin" />

      {/* Franja / contorno superior do cabelo */}
      <path
        d="M25 32c1-9 8-14 16-14 7 0 13 4 14 12-4-3-9-4-15-4-6 0-11 2-15 6z"
        className="human-avatar-hair"
      />

      {/* Sobrancelhas, olhos e sorriso sereno (postura estática sem gestos simulados) */}
      <path d="M32 32c1.5-1 3.5-1 5 0" className="human-avatar-feature-stroke" />
      <path d="M43 32c1.5-1 3.5-1 5 0" className="human-avatar-feature-stroke" />
      <circle cx="34.5" cy="35.5" r="1.7" className="human-avatar-feature-fill" />
      <circle cx="45.5" cy="35.5" r="1.7" className="human-avatar-feature-fill" />
      <path d="M40 36.5v3.2" className="human-avatar-feature-stroke" />
      <path d="M35.5 43c2.5 2.4 6.5 2.4 9 0" className="human-avatar-feature-stroke" />
    </svg>
  );
};

export const LibrasWidget: React.FC<LibrasWidgetProps> = ({
  isOpen,
  onToggle,
  onClose,
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCloseClick = () => {
    onClose();
    triggerRef.current?.focus();
  };

  return (
    <aside className="libras-container" aria-label="Canal de Libras">
      <div className="sr-only" aria-live="polite">
        {isOpen
          ? 'Painel de Libras aberto. Tradução em Libras não ativa nesta versão.'
          : ''}
      </div>

      {isOpen && (
        <div
          id="libras-demo-panel"
          className="libras-panel"
          role="region"
          aria-labelledby="libras-panel-title"
        >
          <div className="settings-row-between">
            <h2 id="libras-panel-title" style={{ margin: 0, fontSize: '1rem' }}>
              Acessibilidade em Libras
            </h2>
            <button
              ref={closeBtnRef}
              type="button"
              className="btn btn-secondary btn-compact"
              onClick={handleCloseClick}
            >
              <Icon name="close" size={16} />
              <span>Fechar</span>
            </button>
          </div>

          <div className="libras-avatar-box">
            <HumanAvatarSvg
              size={68}
              label="Avatar humano representando o espaço reservado para intérprete de Libras"
            />
            <div style={{ fontSize: '0.88rem' }}>
              <span className="visual-alert-tag">Tradução real não ativa</span>
              <strong style={{ display: 'block' }}>Espaço de intérprete de Libras</strong>
              <p className="card-muted-copy" style={{ marginTop: '0.2rem' }}>
                Presença visual dedicada para futura janela de vídeo ou intérprete em Libras.
              </p>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            <strong>Estado atual:</strong> não há tradução automática ou vídeo em Libras ativo no
            momento. Para garantir compreensão segura, todas as instruções, fontes e estados de
            checagem estão descritos integralmente em texto na tela.
          </p>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        className="libras-fab"
        aria-expanded={isOpen}
        aria-controls="libras-demo-panel"
        aria-label={
          isOpen
            ? 'Fechar painel de Libras'
            : 'Abrir painel de Libras (com avatar humano; tradução real não ativa)'
        }
        onClick={onToggle}
      >
        <HumanAvatarSvg size={28} />
        <span>{isOpen ? 'Ocultar Libras' : 'Libras'}</span>
      </button>
    </aside>
  );
};
