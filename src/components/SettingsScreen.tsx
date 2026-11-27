import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityProfile, AudienceProfile, ThemeMode } from '../types';
import { DemoAudioControl } from './DemoAudioControl';
import { Icon } from './Icon';
import { Toggle } from './Toggle';

interface SettingsScreenProps {
  audience: AudienceProfile;
  onApplyAudienceSuggestion: (audience: AudienceProfile) => void;
  onReturnToWelcome: () => void;
  profile: AccessibilityProfile;
  onSelectProfile: (profile: AccessibilityProfile) => void;
  voiceReadingEnabled: boolean;
  onChangeVoiceReading: (enabled: boolean) => void;
  librasEnabled: boolean;
  onChangeLibras: (enabled: boolean) => void;
  textScale: number;
  onChangeTextScale: (scale: number) => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
}

type InfoSectionId = 'idioma' | 'privacidade' | 'ajuda' | 'sobre';

interface InfoDetail {
  id: InfoSectionId;
  title: string;
  summary: string;
  content: string;
}

const INFO_SECTIONS: InfoDetail[] = [
  {
    id: 'idioma',
    title: 'Idioma',
    summary: 'Português (Brasil)',
    content:
      'O aplicativo Voto Claro está configurado em Português do Brasil (pt-BR), incluindo rótulos acessíveis e leitura em voz alta.',
  },
  {
    id: 'privacidade',
    title: 'Privacidade e dados',
    summary: 'Sem histórico de consultas',
    content:
      'Textos informados na aba Verificar são processados apenas durante a consulta ao serviço de checagem e não são gravados em banco de dados nem salvos no navegador. Somente suas preferências de acessibilidade ficam salvas neste dispositivo.',
  },
  {
    id: 'ajuda',
    title: 'Ajuda rápida',
    summary: 'Como usar cada aba',
    content:
      'Use Verificar para buscar esclarecimentos e checagens em fontes confiáveis, Quiz para praticar leitura crítica no Desafio da Checagem e esta tela para personalizar livremente contraste, tamanho do texto, leitura por voz e Libras.',
  },
  {
    id: 'sobre',
    title: 'Informações do aplicativo',
    summary: 'Voto Claro v0.3',
    content:
      'Ferramenta web acessível de apoio à checagem eleitoral com integração a serviço verificável do TSE e suporte configurável a agências de checagem. Microfone e tradução em Libras permanecem claramente identificados quando demonstrativos.',
  },
];

const AUDIENCE_SUGGESTION_CARDS: {
  id: AudienceProfile;
  name: string;
  suggestion: string;
}[] = [
  {
    id: 'idosa',
    name: 'Pessoa idosa',
    suggestion: 'Sugere texto ampliado (115%) sobre visual acolhedor.',
  },
  {
    id: 'cega',
    name: 'Pessoa cega',
    suggestion:
      'Sugere alto contraste preto com amarelo, suporte a leitor de tela e leitura em voz alta.',
  },
  {
    id: 'surda',
    name: 'Pessoa surda',
    suggestion: 'Sugere avisos visuais reforçados e atalho de Libras visível.',
  },
];

const PROFILE_CARDS: {
  id: AccessibilityProfile;
  name: string;
  description: string;
}[] = [
  {
    id: 'padrao',
    name: 'Padrão',
    description: 'Identidade acolhedora em azul e verde-água sobre superfícies claras e legíveis.',
  },
  {
    id: 'visual',
    name: 'Visual (Alto contraste)',
    description:
      'Contraste reforçado em preto, branco e amarelo, espaçamento ampliado e foco espesso.',
  },
  {
    id: 'auditiva',
    name: 'Auditiva (Reforço visual)',
    description:
      'Avisos visuais estruturados com tarja e etiquetas explícitas de estado em texto.',
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  audience,
  onApplyAudienceSuggestion,
  onReturnToWelcome,
  profile,
  onSelectProfile,
  voiceReadingEnabled,
  onChangeVoiceReading,
  librasEnabled,
  onChangeLibras,
  textScale,
  onChangeTextScale,
  theme,
  onChangeTheme,
}) => {
  const [openInfoId, setOpenInfoId] = useState<InfoSectionId | null>(null);
  const closeDialogBtnRef = useRef<HTMLButtonElement>(null);

  const activeInfo = INFO_SECTIONS.find((section) => section.id === openInfoId) ?? null;

  useEffect(() => {
    if (activeInfo) {
      closeDialogBtnRef.current?.focus();
    }
  }, [activeInfo]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openInfoId) {
        setOpenInfoId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openInfoId]);

  const clampScale = (value: number) => Math.min(130, Math.max(90, value));

  const screenSpeechText = useMemo(() => {
    const themeLabel = theme === 'dark' ? 'escuro' : 'claro';
    const profileLabel =
      PROFILE_CARDS.find((c) => c.id === profile)?.name ?? 'Padrão';
    const audienceLabel =
      AUDIENCE_SUGGESTION_CARDS.find((a) => a.id === audience)?.name ?? 'Pessoa idosa';
    return `Tela Configurações e acessibilidade. Sugestão de público escolhida: ${audienceLabel}. Modo de contraste ativo: ${profileLabel}. Tamanho do texto: ${textScale} por cento. Tema atual: ${themeLabel}. Todos os recursos abaixo podem ser ligados ou ajustados livremente conforme sua preferência pessoal.`;
  }, [audience, profile, textScale, theme]);

  return (
    <section className="screen-section" aria-labelledby="settings-heading">
      <div className="screen-intro">
        <h1 id="settings-heading">Configurações e acessibilidade</h1>
        <p>
          Combine e ajuste cada preferência livremente — os perfis iniciais são apenas sugestões de
          ponto de partida.
        </p>
      </div>

      {voiceReadingEnabled && (
        <DemoAudioControl
          buttonLabel="Ouvir esta tela"
          contextLabel="descrição da tela Configurações"
          speechText={screenSpeechText}
          resetKey={`settings-${audience}-${profile}-${theme}`}
        />
      )}

      {/* Cartão 1: Sugestões por Público (separadas dos controles técnicos) */}
      <div className="card">
        <p className="card-section-label">Ponto de partida</p>
        <h2 id="settings-audience-heading" className="settings-group-title">
          Sugestões rápidas por público
        </h2>
        <p className="field-hint" style={{ margin: 0 }}>
          Aplica uma combinação inicial sugerida, que você pode personalizar nos controles abaixo.
        </p>
        <div
          className="profile-cards"
          role="group"
          aria-labelledby="settings-audience-heading"
        >
          {AUDIENCE_SUGGESTION_CARDS.map((item) => {
            const isSelected = audience === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className="profile-card-btn"
                aria-pressed={isSelected}
                onClick={() => onApplyAudienceSuggestion(item.id)}
              >
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.2rem' }}>
                    {item.name}
                  </strong>
                  <span className="profile-card-desc">{item.suggestion}</span>
                </div>
                <span className="profile-card-badge">
                  {isSelected ? '✓ Sugerido' : 'Aplicar'}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={onReturnToWelcome}
        >
          <Icon name="arrow-left" size={18} />
          <span>Voltar à tela inicial</span>
        </button>
      </div>

      {/* Cartão 2: Controles Técnicos de Modo Visual e Recursos Assistivos */}
      <div className="card card--featured">
        <p className="card-section-label">Controles técnicos independentes</p>
        <h2 id="settings-profile-heading" className="settings-group-title">
          Modo visual e contraste
        </h2>
        <div
          className="profile-cards"
          role="group"
          aria-labelledby="settings-profile-heading"
        >
          {PROFILE_CARDS.map((item) => {
            const isSelected = profile === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className="profile-card-btn"
                aria-pressed={isSelected}
                onClick={() => onSelectProfile(item.id)}
              >
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.2rem' }}>
                    {item.name}
                  </strong>
                  <span className="profile-card-desc">{item.description}</span>
                </div>
                <span className="profile-card-badge">
                  {isSelected ? '✓ Ativo' : 'Selecionar'}
                </span>
              </button>
            );
          })}
        </div>

        <hr className="settings-divider" />

        <Toggle
          id="voice-reading-toggle"
          label="Botões de leitura em voz alta"
          description="Exibe controles para ouvir telas, perguntas e resultados usando a fala do navegador."
          checked={voiceReadingEnabled}
          onChange={onChangeVoiceReading}
          activeText="Visíveis"
          inactiveText="Ocultos"
        />

        <hr className="settings-divider" />

        <Toggle
          id="libras-widget-toggle"
          label="Atalho de Libras com avatar humano"
          description="Exibe o botão flutuante de acesso ao painel de Libras em qualquer modo visual."
          checked={librasEnabled}
          onChange={onChangeLibras}
          activeText="Visível"
          inactiveText="Oculto"
        />
      </div>

      {/* Cartão 3: Tamanho do Texto e Tema */}
      <div className="card">
        <p className="card-section-label">Conforto visual</p>

        <div className="settings-row-between">
          <label
            htmlFor="text-scale-slider"
            className="settings-group-title heading-font"
          >
            Tamanho do texto
          </label>
          <output htmlFor="text-scale-slider" aria-live="polite" className="scale-readout">
            {textScale}%
          </output>
        </div>
        <p className="field-hint" style={{ margin: 0 }}>
          Ajuste a escala de leitura entre 90% e 130%.
        </p>
        <div className="scale-controls">
          <button
            type="button"
            className="scale-step-btn"
            aria-label="Diminuir tamanho do texto em 5%"
            disabled={textScale <= 90}
            onClick={() => onChangeTextScale(clampScale(textScale - 5))}
          >
            −
          </button>
          <input
            id="text-scale-slider"
            type="range"
            className="scale-range"
            min={90}
            max={130}
            step={5}
            value={textScale}
            onChange={(e) => onChangeTextScale(clampScale(Number(e.target.value)))}
          />
          <button
            type="button"
            className="scale-step-btn"
            aria-label="Aumentar tamanho do texto em 5%"
            disabled={textScale >= 130}
            onClick={() => onChangeTextScale(clampScale(textScale + 5))}
          >
            +
          </button>
        </div>
        {textScale !== 100 && (
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-compact"
              onClick={() => onChangeTextScale(100)}
            >
              Redefinir para 100%
            </button>
          </div>
        )}

        <hr className="settings-divider" />

        <Toggle
          id="theme-toggle"
          label="Tema escuro"
          description="Alterna entre superfícies claras e escuras preservando o contraste."
          checked={theme === 'dark'}
          onChange={(isDark) => onChangeTheme(isDark ? 'dark' : 'light')}
          activeText="Escuro"
          inactiveText="Claro"
        />
      </div>

      {/* Seção 4: Linhas Empilhadas de Informações e Suporte */}
      <div className="screen-section" style={{ gap: '0.65rem' }}>
        <h2 className="settings-group-title" style={{ paddingLeft: '0.2rem' }}>
          Informações e suporte
        </h2>
        <ul className="info-links-list">
          {INFO_SECTIONS.map((item) => {
            const isOpen = openInfoId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="info-item-btn"
                  aria-expanded={isOpen}
                  aria-controls="settings-info-panel"
                  onClick={() => setOpenInfoId(isOpen ? null : item.id)}
                >
                  <div>
                    <span style={{ display: 'block' }}>{item.title}</span>
                    <span className="info-item-summary">{item.summary}</span>
                  </div>
                  <Icon name={isOpen ? 'close' : 'chevron-right'} size={18} />
                </button>
              </li>
            );
          })}
        </ul>

        {activeInfo && (
          <div
            id="settings-info-panel"
            className="info-dialog-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="info-dialog-title"
          >
            <div className="settings-row-between">
              <h3 id="info-dialog-title" style={{ margin: 0, fontSize: '1.05rem' }}>
                {activeInfo.title}
              </h3>
              <button
                ref={closeDialogBtnRef}
                type="button"
                className="btn btn-secondary btn-compact"
                onClick={() => setOpenInfoId(null)}
              >
                <Icon name="close" size={16} />
                <span>Fechar</span>
              </button>
            </div>
            <p style={{ margin: 0 }}>{activeInfo.content}</p>
          </div>
        )}
      </div>
    </section>
  );
};
