import React, { useEffect, useState } from 'react';
import { AppHeader, PROFILE_LABELS } from './components/AppHeader';
import { Icon, IconName } from './components/Icon';
import { LibrasWidget } from './components/LibrasWidget';
import { QuizScreen } from './components/QuizScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { VerifyScreen } from './components/VerifyScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QUIZ_QUESTIONS } from './config/sources';
import { verifyElectoralContent } from './services/verificationService';
import {
  AccessibilityProfile,
  AnalysisStatus,
  AudienceProfile,
  TabId,
  ThemeMode,
  UserPreferences,
  VerificationResult,
} from './types';

const STORAGE_KEY = 'voto-claro:preferences:v2';

export const AUDIENCE_LABELS: Record<AudienceProfile, string> = {
  idosa: 'Pessoa idosa',
  cega: 'Pessoa cega',
  surda: 'Pessoa surda',
};

/**
 * Sugestões iniciais úteis por perfil de público, sem bloquear a personalização posterior.
 */
export function getSuggestedPreferencesForAudience(
  audience: AudienceProfile
): UserPreferences {
  switch (audience) {
    case 'idosa':
      return {
        audience: 'idosa',
        profile: 'padrao',
        theme: 'light',
        textScale: 115,
        voiceReadingEnabled: false,
        librasEnabled: false,
      };
    case 'cega':
      return {
        audience: 'cega',
        profile: 'visual',
        theme: 'dark',
        textScale: 105,
        voiceReadingEnabled: true,
        librasEnabled: false,
      };
    case 'surda':
      return {
        audience: 'surda',
        profile: 'auditiva',
        theme: 'light',
        textScale: 100,
        voiceReadingEnabled: false,
        librasEnabled: true,
      };
  }
}

const DEFAULT_PREFERENCES: UserPreferences = getSuggestedPreferencesForAudience('idosa');

function loadSavedPreferences(): UserPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;

    const audience: AudienceProfile =
      parsed.audience === 'idosa' || parsed.audience === 'cega' || parsed.audience === 'surda'
        ? parsed.audience
        : DEFAULT_PREFERENCES.audience;

    const fallback = getSuggestedPreferencesForAudience(audience);

    const profile: AccessibilityProfile =
      parsed.profile === 'padrao' || parsed.profile === 'visual' || parsed.profile === 'auditiva'
        ? parsed.profile
        : fallback.profile;

    const theme: ThemeMode =
      parsed.theme === 'light' || parsed.theme === 'dark'
        ? parsed.theme
        : fallback.theme;

    const textScale =
      typeof parsed.textScale === 'number' && parsed.textScale >= 90 && parsed.textScale <= 130
        ? parsed.textScale
        : fallback.textScale;

    const voiceReadingEnabled =
      typeof parsed.voiceReadingEnabled === 'boolean'
        ? parsed.voiceReadingEnabled
        : fallback.voiceReadingEnabled;

    const librasEnabled =
      typeof parsed.librasEnabled === 'boolean'
        ? parsed.librasEnabled
        : fallback.librasEnabled;

    return {
      audience,
      profile,
      theme,
      textScale,
      voiceReadingEnabled,
      librasEnabled,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

const NAV_TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'verificar', label: 'Verificar', icon: 'search' },
  { id: 'quiz', label: 'Quiz', icon: 'quiz' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings' },
];

const TAB_NAMES: Record<TabId, string> = {
  verificar: 'Verificar',
  quiz: 'Desafio da Checagem',
  configuracoes: 'Configurações',
};

export const App: React.FC = () => {
  const initialPrefs = loadSavedPreferences();

  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [returnedToWelcome, setReturnedToWelcome] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabId>('verificar');

  // Perfil de público (sugestão de entrada) separado dos controles técnicos de acessibilidade
  const [audience, setAudience] = useState<AudienceProfile>(initialPrefs.audience);
  const [profile, setProfile] = useState<AccessibilityProfile>(initialPrefs.profile);
  const [theme, setTheme] = useState<ThemeMode>(initialPrefs.theme);
  const [textScale, setTextScale] = useState<number>(initialPrefs.textScale);
  const [voiceReadingEnabled, setVoiceReadingEnabled] = useState<boolean>(
    initialPrefs.voiceReadingEnabled
  );
  const [librasEnabled, setLibrasEnabled] = useState<boolean>(initialPrefs.librasEnabled);

  // Estados da tela Verificar (consulta real ao serviço configurado, sem persistir textos)
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isRecordingDemo, setIsRecordingDemo] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Estados do Desafio da Checagem
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [firstAttemptResults, setFirstAttemptResults] = useState<Record<string, boolean>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  // Estado do painel de Libras
  const [isLibrasOpen, setIsLibrasOpen] = useState<boolean>(false);

  // Anúncios concisos para tecnologias assistivas
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-profile', profile);
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-libras', librasEnabled ? 'on' : 'off');
    root.style.setProperty('--font-scale', String(textScale / 100));

    try {
      const prefsToSave: UserPreferences = {
        audience,
        profile,
        theme,
        textScale,
        voiceReadingEnabled,
        librasEnabled,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave));
    } catch {
      // Ignora indisponibilidade de localStorage
    }
  }, [audience, profile, theme, textScale, voiceReadingEnabled, librasEnabled]);

  useEffect(() => {
    if (!librasEnabled) {
      setIsLibrasOpen(false);
    }
  }, [librasEnabled]);

  const handleSelectTab = (nextTab: TabId) => {
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    setLiveAnnouncement(`Aba ${TAB_NAMES[nextTab]} selecionada.`);
  };

  const handleApplyAudienceSuggestion = (nextAudience: AudienceProfile) => {
    const suggested = getSuggestedPreferencesForAudience(nextAudience);
    setAudience(suggested.audience);
    setProfile(suggested.profile);
    setTheme(suggested.theme);
    setTextScale(suggested.textScale);
    setVoiceReadingEnabled(suggested.voiceReadingEnabled);
    setLibrasEnabled(suggested.librasEnabled);

    const summaryByAudience: Record<AudienceProfile, string> = {
      idosa: 'Sugestão aplicada para Pessoa idosa: texto ampliado em 115%. Personalizável em Configurações.',
      cega: 'Sugestão aplicada para Pessoa cega: alto contraste preto com amarelo, suporte a leitor de tela e leitura por voz ativada. Personalizável em Configurações.',
      surda: 'Sugestão aplicada para Pessoa surda: avisos visuais reforçados e atalho de Libras ativado. Personalizável em Configurações.',
    };
    setLiveAnnouncement(summaryByAudience[nextAudience]);
  };

  const handleSelectTechnicalProfile = (nextProfile: AccessibilityProfile) => {
    setProfile(nextProfile);
    if (nextProfile === 'visual') {
      setVoiceReadingEnabled(true);
    } else if (nextProfile === 'auditiva') {
      setLibrasEnabled(true);
    }
    setLiveAnnouncement(`Modo visual alterado para ${PROFILE_LABELS[nextProfile]}.`);
  };

  const handleTextChange = (value: string) => {
    setAnalysisText(value);
    if (validationError && value.trim().length > 0) {
      setValidationError(null);
    }
  };

  const handleRunVerify = async (focusInput: () => void) => {
    const trimmed = analysisText.trim();
    if (trimmed.length === 0) {
      setValidationError(
        'Digite ou cole um texto, mensagem ou link no campo acima antes de verificar.'
      );
      setAnalysisStatus('idle');
      setVerificationResult(null);
      focusInput();
      return;
    }

    setValidationError(null);
    setIsRecordingDemo(false);
    setAnalysisStatus('loading');
    setVerificationResult(null);

    const result = await verifyElectoralContent(trimmed);
    setVerificationResult(result);
    setAnalysisStatus('done');
  };

  const handleResetVerify = (focusInput: () => void) => {
    setAnalysisText('');
    setValidationError(null);
    setIsRecordingDemo(false);
    setVerificationResult(null);
    setAnalysisStatus('idle');
    focusInput();
  };

  const handleSelectQuizOption = (optionId: string, isCorrect: boolean) => {
    const currentQuestion = QUIZ_QUESTIONS[quizIndex];
    setSelectedQuizOption(optionId);
    if (currentQuestion && !(currentQuestion.id in firstAttemptResults)) {
      const nextFirstAttempts = {
        ...firstAttemptResults,
        [currentQuestion.id]: isCorrect,
      };
      setFirstAttemptResults(nextFirstAttempts);
      const nextScore = Object.values(nextFirstAttempts).filter(Boolean).length * 10;
      setLiveAnnouncement(
        isCorrect
          ? `Passo recomendado. Mais 10 pontos. Pontuação atual: ${nextScore} de ${QUIZ_QUESTIONS.length * 10}.`
          : `Opção não recomendada. Pontuação mantida em ${nextScore} de ${QUIZ_QUESTIONS.length * 10}.`
      );
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizOption(null);
    if (quizIndex >= QUIZ_QUESTIONS.length - 1) {
      setIsQuizCompleted(true);
      const finalScore = Object.values(firstAttemptResults).filter(Boolean).length * 10;
      setLiveAnnouncement(
        `Desafio da Checagem concluído com ${finalScore} de ${QUIZ_QUESTIONS.length * 10} pontos.`
      );
    } else {
      const nextIndex = quizIndex + 1;
      setQuizIndex(nextIndex);
      setLiveAnnouncement(`Pergunta ${nextIndex + 1} de ${QUIZ_QUESTIONS.length}.`);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedQuizOption(null);
    setFirstAttemptResults({});
    setIsQuizCompleted(false);
    setLiveAnnouncement('Desafio da Checagem reiniciado na pergunta 1 de 10.');
  };

  const correctCount = Object.values(firstAttemptResults).filter(Boolean).length;
  const currentQuizQuestion = QUIZ_QUESTIONS[quizIndex];
  const didScoreCurrentQuestion = Boolean(
    currentQuizQuestion && firstAttemptResults[currentQuizQuestion.id] === true
  );

  const handleReturnToWelcome = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsLibrasOpen(false);
    setReturnedToWelcome(true);
    setShowWelcomeScreen(true);
  };

  if (showWelcomeScreen) {
    return (
      <WelcomeScreen
        focusHeadingOnMount={returnedToWelcome}
        onConfirmAudience={(chosenAudience) => {
          handleApplyAudienceSuggestion(chosenAudience);
          setShowWelcomeScreen(false);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>

      <div className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </div>

      <AppHeader
        profile={profile}
        isOnSettings={activeTab === 'configuracoes'}
        onOpenSettings={() => handleSelectTab('configuracoes')}
        onReturnToWelcome={handleReturnToWelcome}
      />

      <main id="conteudo-principal" className="app-main" tabIndex={-1}>
        {activeTab === 'verificar' && (
          <VerifyScreen
            profile={profile}
            voiceReadingEnabled={voiceReadingEnabled}
            analysisText={analysisText}
            onChangeText={handleTextChange}
            isRecordingDemo={isRecordingDemo}
            onToggleRecordingDemo={() => setIsRecordingDemo((prev) => !prev)}
            analysisStatus={analysisStatus}
            verificationResult={verificationResult}
            validationError={validationError}
            onRunVerify={handleRunVerify}
            onResetVerify={handleResetVerify}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizScreen
            profile={profile}
            voiceReadingEnabled={voiceReadingEnabled}
            questionIndex={quizIndex}
            selectedOptionId={selectedQuizOption}
            correctCount={correctCount}
            isQuizCompleted={isQuizCompleted}
            didScoreCurrentQuestion={didScoreCurrentQuestion}
            onSelectOption={handleSelectQuizOption}
            onRetryQuestion={() => setSelectedQuizOption(null)}
            onNextQuestion={handleNextQuizQuestion}
            onRestartQuiz={handleRestartQuiz}
          />
        )}

        {activeTab === 'configuracoes' && (
          <SettingsScreen
            audience={audience}
            onApplyAudienceSuggestion={handleApplyAudienceSuggestion}
            onReturnToWelcome={handleReturnToWelcome}
            profile={profile}
            onSelectProfile={handleSelectTechnicalProfile}
            voiceReadingEnabled={voiceReadingEnabled}
            onChangeVoiceReading={setVoiceReadingEnabled}
            librasEnabled={librasEnabled}
            onChangeLibras={setLibrasEnabled}
            textScale={textScale}
            onChangeTextScale={setTextScale}
            theme={theme}
            onChangeTheme={setTheme}
          />
        )}
      </main>

      {librasEnabled && (
        <LibrasWidget
          isOpen={isLibrasOpen}
          onToggle={() => setIsLibrasOpen((prev) => !prev)}
          onClose={() => setIsLibrasOpen(false)}
        />
      )}

      <nav className="bottom-nav" aria-label="Navegação principal">
        <ul className="bottom-nav-list">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  className="nav-tab-btn"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleSelectTab(tab.id)}
                >
                  <Icon name={tab.icon} size={20} />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default App;
