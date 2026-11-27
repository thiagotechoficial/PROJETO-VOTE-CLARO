import React, { useMemo } from 'react';
import {
  getQuizProgressTier,
  POINTS_PER_QUESTION,
  QUIZ_QUESTIONS,
} from '../config/sources';
import { AccessibilityProfile } from '../types';
import { DemoAudioControl } from './DemoAudioControl';
import { Icon } from './Icon';

interface QuizScreenProps {
  profile: AccessibilityProfile;
  voiceReadingEnabled: boolean;
  questionIndex: number;
  selectedOptionId: string | null;
  correctCount: number;
  isQuizCompleted: boolean;
  didScoreCurrentQuestion: boolean;
  onSelectOption: (optionId: string, isCorrect: boolean) => void;
  onRetryQuestion: () => void;
  onNextQuestion: () => void;
  onRestartQuiz: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  profile,
  voiceReadingEnabled,
  questionIndex,
  selectedOptionId,
  correctCount,
  isQuizCompleted,
  didScoreCurrentQuestion,
  onSelectOption,
  onRetryQuestion,
  onNextQuestion,
  onRestartQuiz,
}) => {
  const totalQuestions = QUIZ_QUESTIONS.length;
  const maxScore = totalQuestions * POINTS_PER_QUESTION;
  const currentScore = correctCount * POINTS_PER_QUESTION;
  const currentQuestion = QUIZ_QUESTIONS[questionIndex] ?? QUIZ_QUESTIONS[0];
  const progressPercent = isQuizCompleted
    ? 100
    : Math.round(((questionIndex + 1) / totalQuestions) * 100);

  const selectedAlternative = currentQuestion.alternatives.find(
    (alt) => alt.id === selectedOptionId
  );
  const hasAnswered = Boolean(selectedAlternative);
  const isCorrect = Boolean(selectedAlternative?.isCorrect);
  const isLastQuestion = questionIndex >= totalQuestions - 1;

  const progressTier = useMemo(() => getQuizProgressTier(currentScore), [currentScore]);

  const screenSpeechText = useMemo(() => {
    if (isQuizCompleted) {
      return `Desafio da Checagem concluído. Pontuação final: ${currentScore} de ${maxScore} pontos. Acertos na primeira escolha: ${correctCount} de ${totalQuestions}. Etapa alcançada: ${progressTier.title}. ${progressTier.encouragement} ${progressTier.practicalTip}`;
    }
    const optionsNarration = currentQuestion.alternatives
      .map((alt, idx) => `Opção ${String.fromCharCode(65 + idx)}: ${alt.label}`)
      .join(' ');
    return `Desafio da Checagem. Pergunta ${questionIndex + 1} de ${totalQuestions}. Pontuação atual: ${currentScore} de ${maxScore} pontos. Tema: ${currentQuestion.topic}. ${currentQuestion.question} ${optionsNarration}`;
  }, [
    correctCount,
    currentQuestion,
    currentScore,
    isQuizCompleted,
    maxScore,
    progressTier,
    questionIndex,
    totalQuestions,
  ]);

  const feedbackSpeechText = useMemo(() => {
    if (!hasAnswered) return '';
    const prefix = isCorrect
      ? 'Passo recomendado selecionado.'
      : 'Opção não recomendada. Veja o motivo:';
    const body = isCorrect
      ? currentQuestion.explanationCorrect
      : currentQuestion.explanationIncorrect;
    return `${prefix} ${body} Pontuação atual: ${currentScore} de ${maxScore} pontos. Fonte indicada: ${currentQuestion.sourceLabel}.`;
  }, [currentQuestion, currentScore, hasAnswered, isCorrect, maxScore]);

  if (isQuizCompleted) {
    return (
      <section className="screen-section" aria-labelledby="quiz-summary-heading">
        <div className="screen-intro">
          <h1 id="quiz-summary-heading">Desafio da Checagem</h1>
          <p>Rodada concluída! Confira seu progresso educativo e uma dica prática.</p>
        </div>

        {voiceReadingEnabled && (
          <DemoAudioControl
            buttonLabel="Ouvir conclusão do desafio"
            contextLabel="resumo final do Desafio da Checagem"
            speechText={screenSpeechText}
            resetKey="quiz-completed"
          />
        )}

        <div className="card card--featured" aria-live="polite">
          <div className="quiz-summary-center">
            <span className="hero-medallion" aria-hidden="true">
              <Icon name="check" size={28} />
            </span>
            <span className="result-status-badge result-status-badge--match_found">
              <span>Etapa: {progressTier.title}</span>
            </span>
            <h2 className="card-subheading" style={{ fontSize: '1.25rem' }}>
              {currentScore} de {maxScore} pontos simbólicos
            </h2>
            <p className="card-muted-copy">{progressTier.encouragement}</p>
          </div>

          <hr className="card-divider" />

          <div className="quiz-metrics-row">
            <div className="quiz-metric-block">
              <span className="quiz-metric-label">Acertos de 1ª</span>
              <span className="quiz-metric-value">
                {correctCount} / {totalQuestions}
              </span>
            </div>
            <div className="quiz-metric-block quiz-metric-block--end">
              <span className="quiz-metric-label">Perguntas concluídas</span>
              <span className="quiz-metric-value">{totalQuestions}</span>
            </div>
          </div>

          <div className="notice-banner" role="note">
            <Icon name="info" size={20} />
            <div>
              {profile === 'auditiva' && (
                <span className="visual-alert-tag">Dica de checagem</span>
              )}
              <div>{progressTier.practicalTip}</div>
            </div>
          </div>

          <p className="privacy-inline-note" style={{ marginTop: 0 }}>
            <span>
              Pontuação simbólica válida durante esta sessão para apoiar seu aprendizado — sem
              cadastro, ranking público ou recompensas externas.
            </span>
          </p>

          <button type="button" className="btn btn-primary btn-full" onClick={onRestartQuiz}>
            <Icon name="refresh" size={18} />
            <span>Reiniciar Desafio da Checagem</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen-section" aria-labelledby="quiz-heading">
      <div className="screen-intro">
        <h1 id="quiz-heading">Desafio da Checagem</h1>
        <p>
          Escolha o próximo passo mais seguro em cada situação. Acertos na 1ª tentativa valem{' '}
          {POINTS_PER_QUESTION} pontos, sem perda por erro.
        </p>
      </div>

      {voiceReadingEnabled && (
        <DemoAudioControl
          buttonLabel="Ouvir esta pergunta"
          contextLabel={`pergunta ${questionIndex + 1} de ${totalQuestions}`}
          speechText={screenSpeechText}
          resetKey={`quiz-q-${currentQuestion.id}`}
        />
      )}

      {/* Cartão de Progresso e Pontuação */}
      <div className="card">
        <div className="quiz-metrics-row" aria-label="Pontuação e progresso da rodada">
          <div className="quiz-metric-block">
            <span className="quiz-metric-label">Pontuação simbólica</span>
            <span className="quiz-metric-value">
              {currentScore} <small style={{ fontSize: '0.82rem', fontWeight: 600 }}>/ {maxScore} pts</small>
            </span>
          </div>
          <div className="quiz-metric-block quiz-metric-block--end">
            <span id="quiz-progress-label" className="quiz-metric-label">
              Progresso da rodada
            </span>
            <span className="quiz-metric-value">
              {questionIndex + 1} <small style={{ fontSize: '0.82rem', fontWeight: 600 }}>de {totalQuestions}</small>
            </span>
          </div>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-labelledby="quiz-progress-label"
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-valuenow={questionIndex + 1}
        >
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="quiz-meta-row">
          <span className="quiz-topic-tag">Tema: {currentQuestion.topic}</span>
          <span className="quiz-stat-pill">
            Acertos de 1ª: <strong>{correctCount}</strong>
          </span>
        </div>
      </div>

      {/* Cartão da Pergunta Atual */}
      <div className="card card--featured">
        <fieldset className="quiz-fieldset">
          <legend className="quiz-legend">{currentQuestion.question}</legend>

          {currentQuestion.alternatives.map((alternative, idx) => {
            const isSelected = selectedOptionId === alternative.id;
            let stateClass = '';
            let statusTag: string | null = null;

            if (isSelected && hasAnswered) {
              if (alternative.isCorrect) {
                stateClass = 'quiz-option--correct';
                statusTag = '✓ Passo recomendado selecionado';
              } else {
                stateClass = 'quiz-option--incorrect';
                statusTag = '✕ Opção selecionada — confira o motivo abaixo';
              }
            } else if (hasAnswered && alternative.isCorrect) {
              stateClass = 'quiz-option--selected';
              statusTag = '→ Passo mais seguro recomendado';
            } else if (isSelected) {
              stateClass = 'quiz-option--selected';
            }

            const letter = String.fromCharCode(65 + idx);

            return (
              <label
                key={alternative.id}
                htmlFor={alternative.id}
                className={`quiz-option ${stateClass}`}
              >
                <input
                  id={alternative.id}
                  type="radio"
                  name={`quiz-${currentQuestion.id}`}
                  value={alternative.id}
                  checked={isSelected}
                  onChange={() => onSelectOption(alternative.id, alternative.isCorrect)}
                />
                <div>
                  <div>
                    <strong>{letter})</strong> {alternative.label}
                  </div>
                  {statusTag && <span className="quiz-option-tag">{statusTag}</span>}
                </div>
              </label>
            );
          })}
        </fieldset>
      </div>

      {/* Cartão Dedicado de Feedback Imediato */}
      <div aria-live="polite">
        {hasAnswered && (
          <div className="card">
            <p className="card-section-label">Feedback imediato</p>

            <div
              className={`notice-banner ${
                isCorrect ? 'notice-banner--success' : 'notice-banner--error'
              }`}
            >
              <Icon name={isCorrect ? 'check' : 'alert'} size={22} />
              <div>
                {profile === 'auditiva' && (
                  <span className="visual-alert-tag">
                    {isCorrect ? 'Passo recomendado' : 'Revisão educativa'}
                  </span>
                )}
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                  {isCorrect
                    ? didScoreCurrentQuestion
                      ? `Passo recomendado! (+${POINTS_PER_QUESTION} pontos na 1ª escolha)`
                      : 'Passo recomendado! (revisão concluída — pontos valem na 1ª escolha)'
                    : 'Opção não recomendada — sem perda de pontos:'}
                </strong>
                <p style={{ margin: '0 0 0.55rem' }}>
                  {isCorrect
                    ? currentQuestion.explanationCorrect
                    : currentQuestion.explanationIncorrect}
                </p>
                <a
                  href={currentQuestion.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-banner-link"
                  aria-label={`${currentQuestion.sourceLabel}. Você sairá do Voto Claro e abrirá site oficial externo em nova aba`}
                >
                  Fonte relevante: {currentQuestion.sourceLabel} (abre em nova aba) ↗
                </a>
              </div>
            </div>

            {voiceReadingEnabled && (
              <DemoAudioControl
                buttonLabel="Ouvir explicação da resposta"
                contextLabel="feedback da resposta selecionada"
                speechText={feedbackSpeechText}
                resetKey={`${currentQuestion.id}-${selectedOptionId}`}
              />
            )}

            <div className="actions-stack">
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={onNextQuestion}
              >
                <span>{isLastQuestion ? 'Ver conclusão do desafio' : 'Próxima pergunta'}</span>
                <Icon name="chevron-right" size={18} />
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={onRetryQuestion}
              >
                <Icon name="refresh" size={18} />
                <span>Tentar novamente</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
