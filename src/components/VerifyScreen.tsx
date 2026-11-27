import React, { useMemo, useRef } from 'react';
import { OFFICIAL_TSE_REPORTING_URLS } from '../config/sources';
import {
  AccessibilityProfile,
  AnalysisStatus,
  ClaimAssessment,
  VerificationResult,
} from '../types';
import { DemoAudioControl } from './DemoAudioControl';
import { Icon } from './Icon';

interface VerifyScreenProps {
  profile: AccessibilityProfile;
  voiceReadingEnabled: boolean;
  analysisText: string;
  onChangeText: (value: string) => void;
  isRecordingDemo: boolean;
  onToggleRecordingDemo: () => void;
  analysisStatus: AnalysisStatus;
  verificationResult: VerificationResult | null;
  validationError: string | null;
  onRunVerify: (focusInput: () => void) => void;
  onResetVerify: (focusInput: () => void) => void;
}

const OUTCOME_BADGE_LABELS: Record<VerificationResult['outcome'], string> = {
  match_found: 'Referência encontrada',
  insufficient_evidence: 'Evidência insuficiente',
  technical_failure: 'Falha técnica / Indisponível',
};

const ASSESSMENT_LABELS: Record<ClaimAssessment, string> = {
  false: 'Avaliação da fonte: Alegação falsa',
  misleading: 'Avaliação da fonte: Enganosa / Fora de contexto',
  true: 'Avaliação da fonte: Confirmada pela fonte',
  unverified: 'Avaliação da fonte: Sem evidência conclusiva',
  unknown: 'Avaliação da fonte: Orientação institucional',
};

export const VerifyScreen: React.FC<VerifyScreenProps> = ({
  profile,
  voiceReadingEnabled,
  analysisText,
  onChangeText,
  isRecordingDemo,
  onToggleRecordingDemo,
  analysisStatus,
  verificationResult,
  validationError,
  onRunVerify,
  onResetVerify,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sourcesCardHeadingRef = useRef<HTMLHeadingElement>(null);

  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  const handleReturnToSources = () => {
    sourcesCardHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    sourcesCardHeadingRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onRunVerify(focusTextarea);
  };

  const handleInsertSample = () => {
    onChangeText('Urna eletrônica pode ser invadida pela internet ou Wi-Fi durante a votação?');
  };

  const showReportingArea =
    verificationResult?.outcome === 'match_found' &&
    (verificationResult.claimAssessment === 'false' ||
      verificationResult.claimAssessment === 'misleading');

  const screenSpeechText =
    'Tela Verificar antes de compartilhar. Digite ou cole uma mensagem, afirmação ou link no cartão principal e acione Verificar agora para consultar fontes confiáveis. O texto informado é enviado apenas ao serviço de checagem durante a consulta e não fica armazenado.';

  const resultSpeechText = useMemo(() => {
    if (!verificationResult) return '';
    const statusLabel = OUTCOME_BADGE_LABELS[verificationResult.outcome];
    const assessmentLabel =
      verificationResult.outcome === 'match_found'
        ? ASSESSMENT_LABELS[verificationResult.claimAssessment]
        : '';

    const parts: string[] = [
      `Resumo da checagem: ${statusLabel}.`,
      assessmentLabel ? `${assessmentLabel}.` : '',
      verificationResult.headline,
      `Origem consultada: ${verificationResult.providerAttribution}.`,
      `Explicação em linguagem simples: ${verificationResult.explanation}`,
    ].filter(Boolean);

    if (verificationResult.evidences.length > 0) {
      parts.push('Fontes consultadas:');
      verificationResult.evidences.forEach((ev, index) => {
        const ratingPart = ev.rating ? `Classificação: ${ev.rating}.` : '';
        parts.push(
          `Fonte ${index + 1}: ${ev.publisher}. ${ev.title}. ${ratingPart} ${ev.summary}`
        );
      });
    } else if (verificationResult.consultedDirectories.length > 0) {
      const names = verificationResult.consultedDirectories.map((d) => d.name).join(', ');
      parts.push(`Canais oficiais recomendados: ${names}.`);
    }

    parts.push(`Limites do resultado: ${verificationResult.limitationNote}`);

    if (
      verificationResult.outcome === 'match_found' &&
      (verificationResult.claimAssessment === 'false' ||
        verificationResult.claimAssessment === 'misleading')
    ) {
      parts.push(
        'Próximos passos oficiais: Esta fonte classifica a alegação como falsa ou enganosa. O Voto Claro não envia denúncias por você. O Pardal recebe relatos de possíveis irregularidades em propaganda eleitoral. O SIADE recebe alertas de desinformação capaz de afetar a integridade das eleições.'
      );
    }

    return parts.join(' ');
  }, [verificationResult]);

  const describedByIds = ['verify-input-hint', 'verify-privacy-note'];
  if (validationError) {
    describedByIds.push('verify-input-error');
  }

  return (
    <section className="screen-section" aria-labelledby="verify-heading">
      <div className="screen-intro">
        <h1 id="verify-heading">Verifique antes de compartilhar</h1>
        <p>
          Confira mensagens, declarações ou links sobre eleições em fontes oficiais e checagens
          independentes.
        </p>
      </div>

      {voiceReadingEnabled && (
        <DemoAudioControl
          buttonLabel="Ouvir esta tela"
          contextLabel="descrição da tela Verificar"
          speechText={screenSpeechText}
          resetKey="verify-screen-intro"
        />
      )}

      {profile === 'auditiva' && (
        <div className="notice-banner" role="note">
          <Icon name="info" size={20} />
          <div>
            <span className="visual-alert-tag">Avisos em texto visual</span>
            <div>
              Todos os estados, classificações e limites da checagem aparecem descritos em texto
              claro. O acesso a Libras com avatar humano está disponível no botão flutuante.
            </div>
          </div>
        </div>
      )}

      {/* Cartão Destacado de Entrada */}
      <form className="card card--featured" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="verify-input" className="field-label">
            O que você recebeu?
          </label>
          <p id="verify-input-hint" className="field-hint">
            Cole abaixo o texto, mensagem encaminhada ou link que deseja verificar com segurança.
          </p>
          <textarea
            ref={textareaRef}
            id="verify-input"
            className="textarea-input"
            rows={4}
            placeholder="Exemplo: Mais de 50% de votos nulos anulam a eleição? Ou: Urna eletrônica tem conexão com internet?"
            value={analysisText}
            onChange={(e) => onChangeText(e.target.value)}
            aria-invalid={Boolean(validationError)}
            aria-describedby={describedByIds.join(' ')}
          />
          <p id="verify-privacy-note" className="privacy-inline-note">
            <Icon name="shield" size={16} />
            <span>
              <strong>Privacidade:</strong> o conteúdo informado é enviado apenas ao serviço de
              checagem durante esta consulta e não fica salvo.
            </span>
          </p>
        </div>

        {validationError && (
          <div id="verify-input-error" className="field-error" role="alert">
            <Icon name="alert" size={20} />
            <span>{validationError}</span>
          </div>
        )}

        <hr className="card-divider" />

        <div className="actions-stack">
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={analysisStatus === 'loading'}
          >
            <Icon name="search" size={18} />
            <span>{analysisStatus === 'loading' ? 'Consultando fontes...' : 'Verificar agora'}</span>
          </button>

          <button
            type="button"
            className={`btn btn-full ${isRecordingDemo ? 'btn-toggle-active' : 'btn-secondary'}`}
            aria-pressed={isRecordingDemo}
            aria-label={
              isRecordingDemo
                ? 'Microfone demonstrativo em estado Ouvindo. Toque para voltar ao estado Pronto'
                : 'Microfone demonstrativo em estado Pronto. Simulação visual sem captação real de voz'
            }
            onClick={onToggleRecordingDemo}
          >
            {isRecordingDemo ? (
              <span className="status-dot" aria-hidden="true" />
            ) : (
              <Icon name="mic" size={18} />
            )}
            <span>Microfone (demo): {isRecordingDemo ? 'Ouvindo' : 'Pronto'}</span>
          </button>
        </div>

        <div aria-live="polite">
          {isRecordingDemo && (
            <div className="notice-banner">
              <Icon name="mic" size={20} />
              <div>
                {profile === 'auditiva' && (
                  <span className="visual-alert-tag">Demonstração de interface</span>
                )}
                <p style={{ margin: '0 0 0.55rem' }}>
                  <strong>Captação por voz simulada:</strong> nenhum áudio real é gravado. Digite
                  sua dúvida no campo acima ou preencha um exemplo verificável:
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-compact"
                  onClick={handleInsertSample}
                >
                  Preencher exemplo de consulta
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Estados e Blocos Modulares do Resultado */}
      <div aria-live="polite">
        {analysisStatus === 'idle' && (
          <div className="card">
            <p className="card-section-label">Passo a passo</p>
            <h2 className="card-subheading">Como o Voto Claro apoia sua decisão</h2>
            <ol className="quick-steps-grid">
              <li className="quick-step-tile">
                <span className="quick-step-num" aria-hidden="true">1</span>
                <span className="quick-step-text">Cole a mensagem ou dúvida recebida</span>
              </li>
              <li className="quick-step-tile">
                <span className="quick-step-num" aria-hidden="true">2</span>
                <span className="quick-step-text">Veja a avaliação e o resumo das fontes</span>
              </li>
              <li className="quick-step-tile">
                <span className="quick-step-num" aria-hidden="true">3</span>
                <span className="quick-step-text">Abra a publicação original antes de agir</span>
              </li>
            </ol>
          </div>
        )}

        {analysisStatus === 'loading' && (
          <div className="loading-box" role="status">
            <span className="spinner" aria-hidden="true" />
            <span>Consultando esclarecimentos oficiais e checagens verificáveis...</span>
          </div>
        )}

        {analysisStatus === 'done' && verificationResult && (
          <div className="verify-results-stack">
            {/* Bloco 1: Classificação e Resumo da Checagem */}
            <article
              className={`card result-summary-card--${verificationResult.outcome}`}
              aria-labelledby="result-summary-heading"
            >
              <p className="card-section-label">Resumo da checagem</p>

              <div className="attention-header">
                <span
                  className={`result-status-badge result-status-badge--${verificationResult.outcome}`}
                >
                  <Icon
                    name={
                      verificationResult.outcome === 'match_found'
                        ? 'check'
                        : verificationResult.outcome === 'insufficient_evidence'
                        ? 'info'
                        : 'alert'
                    }
                    size={18}
                  />
                  <span>{OUTCOME_BADGE_LABELS[verificationResult.outcome]}</span>
                </span>

                {verificationResult.outcome === 'match_found' && (
                  <span
                    className={`assessment-badge assessment-badge--${verificationResult.claimAssessment}`}
                  >
                    <Icon
                      name={
                        verificationResult.claimAssessment === 'false' ||
                        verificationResult.claimAssessment === 'misleading'
                          ? 'alert'
                          : verificationResult.claimAssessment === 'true'
                          ? 'check'
                          : 'info'
                      }
                      size={16}
                    />
                    <span>{ASSESSMENT_LABELS[verificationResult.claimAssessment]}</span>
                  </span>
                )}
              </div>

              <h2 id="result-summary-heading" style={{ fontSize: '1.18rem', marginBottom: 0 }}>
                {verificationResult.headline}
              </h2>

              <p className="provider-attribution">
                <strong>Origem consultada:</strong> {verificationResult.providerAttribution}
              </p>

              {voiceReadingEnabled && (
                <DemoAudioControl
                  buttonLabel="Ouvir resultado da checagem"
                  contextLabel="resultado completo da checagem"
                  speechText={resultSpeechText}
                  resetKey={`${verificationResult.outcome}-${verificationResult.claimAssessment}-${verificationResult.headline}`}
                />
              )}
            </article>

            {/* Bloco 2: Explicação em Linguagem Simples */}
            <section className="card" aria-labelledby="result-explanation-heading">
              <p className="card-section-label">Entenda o contexto</p>
              <h3 id="result-explanation-heading" className="card-subheading">
                Explicação em linguagem simples
              </h3>
              <p style={{ margin: 0 }}>{verificationResult.explanation}</p>

              {verificationResult.outcome === 'match_found' &&
                verificationResult.claimAssessment === 'true' && (
                  <div className="notice-banner notice-banner--success" role="note">
                    <Icon name="check" size={20} />
                    <div>
                      {profile === 'auditiva' && (
                        <span className="visual-alert-tag">Contexto confirmado</span>
                      )}
                      <strong>Informação respaldada pela fonte:</strong> abra o link original abaixo
                      para conferir se datas, locais ou regras específicas se aplicam ao seu caso.
                    </div>
                  </div>
                )}

              {verificationResult.outcome === 'match_found' &&
                (verificationResult.claimAssessment === 'unknown' ||
                  verificationResult.claimAssessment === 'unverified') && (
                  <div className="notice-banner" role="note">
                    <Icon name="info" size={20} />
                    <div>
                      {profile === 'auditiva' && (
                        <span className="visual-alert-tag">Cautela recomendada</span>
                      )}
                      <strong>Referência temática localizada:</strong> uma referência encontrada não
                      significa automaticamente que a mensagem seja falsa ou verdadeira. Leia a
                      publicação oficial antes de compartilhar.
                    </div>
                  </div>
                )}
            </section>

            {/* Bloco 3: Fontes Consultadas */}
            {(verificationResult.evidences.length > 0 ||
              verificationResult.consultedDirectories.length > 0) && (
              <section className="card" aria-labelledby="result-sources-heading">
                <p className="card-section-label">Referências</p>
                <h3
                  id="result-sources-heading"
                  ref={sourcesCardHeadingRef}
                  tabIndex={-1}
                  className="card-subheading"
                >
                  {verificationResult.evidences.length > 0
                    ? 'Fontes consultadas'
                    : 'Canais oficiais para consulta direta'}
                </h3>

                {verificationResult.evidences.length > 0 ? (
                  <ul className="signals-list">
                    {verificationResult.evidences.map((item) => (
                      <li key={item.id} className="evidence-item">
                        <div className="evidence-meta">
                          <span className="evidence-publisher">{item.publisher}</span>
                          {item.rating && <span className="evidence-rating">{item.rating}</span>}
                        </div>
                        <strong className="evidence-title">{item.title}</strong>
                        <p className="evidence-summary">{item.summary}</p>
                        <div className="evidence-footer">
                          {item.publishedAt && (
                            <span className="evidence-date">Data: {item.publishedAt}</span>
                          )}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="evidence-link"
                            aria-label={`Abrir publicação original em ${item.publisher}. Você sairá do Voto Claro e abrirá uma nova aba`}
                          >
                            <span>Abrir publicação original</span>
                            <Icon name="external" size={15} />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="sources-list">
                    {verificationResult.consultedDirectories.map((source) => (
                      <li key={source.id}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                          aria-label={`${source.name}. Você sairá do Voto Claro e abrirá site externo em nova aba`}
                        >
                          <span className="source-link-title">
                            <span>{source.name}</span>
                            <span className="external-tag">
                              Abrir <Icon name="external" size={15} />
                            </span>
                          </span>
                          <span className="source-link-desc">{source.description}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Bloco 4: Limites do Resultado e Próximos Passos */}
            <section
              className={`card ${showReportingArea ? 'reporting-card' : ''}`}
              aria-labelledby="result-limits-heading"
            >
              <p className="card-section-label">Limites e próximos passos</p>
              <h3 id="result-limits-heading" className="card-subheading">
                {showReportingArea
                  ? 'Limites e canais oficiais de comunicação'
                  : 'Limites deste resultado'}
              </h3>

              <div
                className={`notice-banner ${
                  verificationResult.outcome === 'technical_failure'
                    ? 'notice-banner--error'
                    : 'notice-banner--attention'
                }`}
              >
                <Icon
                  name={verificationResult.outcome === 'technical_failure' ? 'alert' : 'info'}
                  size={20}
                />
                <div>
                  {profile === 'auditiva' && (
                    <span className="visual-alert-tag">
                      {verificationResult.outcome === 'technical_failure'
                        ? 'Sem checagem concluída'
                        : 'Escopo da verificação'}
                    </span>
                  )}
                  <span>{verificationResult.limitationNote}</span>
                </div>
              </div>

              {showReportingArea && (
                <>
                  <hr className="card-divider" />

                  <p style={{ margin: 0 }}>
                    <strong>Esta fonte classifica a alegação como falsa ou enganosa.</strong> Se
                    você também encontrou uma possível irregularidade eleitoral, escolha o canal
                    oficial adequado. <strong>O Voto Claro não envia uma denúncia por você</strong>{' '}
                    — a comunicação é concluída diretamente no serviço oficial do TSE.
                  </p>

                  <div className="reporting-guidance-box">
                    <strong style={{ display: 'block', marginBottom: '0.4rem' }}>
                      Qual canal oficial utilizar?
                    </strong>
                    <ul className="reporting-rules-list">
                      <li>
                        <strong>Pardal:</strong> recebe relatos de possíveis irregularidades na{' '}
                        <strong>propaganda eleitoral</strong>. Exige identificação via{' '}
                        <strong>e-Título</strong> ou <strong>Gov.br</strong> e elementos para
                        apuração. Não se destina a qualquer crítica ou alegação sobre candidaturas.
                      </li>
                      <li>
                        <strong>SIADE:</strong> recebe alertas de desinformação capaz de afetar a{' '}
                        <strong>integridade das eleições</strong>, como conteúdos falsos sobre as
                        urnas, o processo de votação ou a Justiça Eleitoral.
                      </li>
                      <li>
                        <strong>Se tiver dúvida:</strong> nem todo conteúdo falso cabe nesses
                        canais. Consulte antes as{' '}
                        <a
                          href={OFFICIAL_TSE_REPORTING_URLS.guidance}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Orientações oficiais do TSE sobre como denunciar desinformação. Você sairá do Voto Claro e abrirá uma nova aba"
                        >
                          orientações oficiais do TSE (nova aba) ↗
                        </a>
                        .
                      </li>
                    </ul>
                  </div>

                  <div className="sources-list">
                    <a
                      href={OFFICIAL_TSE_REPORTING_URLS.pardal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                      aria-label="Denunciar propaganda eleitoral irregular no Pardal. Você sairá do Voto Claro e abrirá a página oficial do TSE em nova aba"
                    >
                      <span className="source-link-title">
                        <span>Denunciar propaganda eleitoral irregular no Pardal</span>
                        <span className="external-tag">
                          TSE <Icon name="external" size={15} />
                        </span>
                      </span>
                      <span className="source-link-desc">
                        Abre a página oficial do Pardal em nova aba para concluir o relato no
                        serviço do TSE.
                      </span>
                    </a>

                    <a
                      href={OFFICIAL_TSE_REPORTING_URLS.siade}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                      aria-label="Comunicar desinformação que afeta a integridade das eleições no SIADE. Você sairá do Voto Claro e abrirá a página oficial do TSE em nova aba"
                    >
                      <span className="source-link-title">
                        <span>
                          Comunicar desinformação contra a integridade eleitoral no SIADE
                        </span>
                        <span className="external-tag">
                          TSE <Icon name="external" size={15} />
                        </span>
                      </span>
                      <span className="source-link-desc">
                        Abre o Sistema de Alertas do TSE em nova aba para casos envolvendo o
                        processo de votação.
                      </span>
                    </a>
                  </div>
                </>
              )}

              <div className="actions-stack">
                {verificationResult.outcome === 'technical_failure' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={() => onRunVerify(focusTextarea)}
                  >
                    <Icon name="refresh" size={18} />
                    <span>Tentar consultar novamente</span>
                  </button>
                )}

                {showReportingArea && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={handleReturnToSources}
                  >
                    <Icon name="search" size={18} />
                    <span>Voltar às fontes da checagem</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => onResetVerify(focusTextarea)}
                >
                  <Icon name="refresh" size={18} />
                  <span>Limpar e iniciar nova consulta</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
};
