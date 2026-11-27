import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface DemoAudioControlProps {
  contextLabel: string;
  speechText: string;
  buttonLabel?: string;
  resetKey?: string;
}

type SpeechState = 'idle' | 'speaking' | 'paused';

function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

export const DemoAudioControl: React.FC<DemoAudioControlProps> = ({
  contextLabel,
  speechText,
  buttonLabel = 'Ouvir em voz alta',
  resetKey,
}) => {
  const supported = isSpeechSynthesisSupported();
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (supported) {
      window.speechSynthesis.cancel();
    }
    setSpeechState('idle');
    setStatusMessage('');
  }, [resetKey, speechText, supported]);

  useEffect(() => {
    return () => {
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  const handlePrimaryAction = () => {
    if (!supported) {
      setStatusMessage(
        'Leitura por voz não está disponível neste navegador. Utilize um leitor de tela para navegar pelo conteúdo estruturado.'
      );
      return;
    }

    if (speechState === 'idle') {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(speechText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('pt-br')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('pt'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onend = () => {
        setSpeechState('idle');
        setStatusMessage('Leitura concluída.');
      };

      utterance.onerror = () => {
        setSpeechState('idle');
        setStatusMessage(
          'Não foi possível concluir a síntese de voz neste dispositivo. Utilize seu leitor de tela se preferir.'
        );
      };

      setSpeechState('speaking');
      setStatusMessage(`Lendo: ${contextLabel}.`);
      window.speechSynthesis.speak(utterance);
      return;
    }

    if (speechState === 'speaking') {
      window.speechSynthesis.pause();
      setSpeechState('paused');
      setStatusMessage('Leitura pausada.');
      return;
    }

    if (speechState === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState('speaking');
      setStatusMessage(`Retomando leitura: ${contextLabel}.`);
    }
  };

  const handleStop = () => {
    if (supported) {
      window.speechSynthesis.cancel();
    }
    setSpeechState('idle');
    setStatusMessage('Leitura interrompida.');
  };

  const primaryLabel =
    speechState === 'speaking'
      ? 'Pausar leitura'
      : speechState === 'paused'
      ? 'Retomar leitura'
      : buttonLabel;

  return (
    <div className="demo-audio-box" role="region" aria-label={`Leitura em voz alta: ${contextLabel}`}>
      <div className="actions-row">
        <button
          type="button"
          className={`btn ${speechState !== 'idle' ? 'btn-toggle-active' : 'btn-secondary'}`}
          onClick={handlePrimaryAction}
        >
          <Icon name={speechState === 'speaking' ? 'pause' : 'volume'} size={18} />
          <span>{primaryLabel}</span>
        </button>

        {speechState !== 'idle' && (
          <button type="button" className="btn btn-secondary" onClick={handleStop}>
            <Icon name="stop" size={18} />
            <span>Cancelar leitura</span>
          </button>
        )}
      </div>

      {!supported ? (
        <p className="demo-audio-status" role="status">
          Recurso de fala do navegador indisponível neste dispositivo. Todo o conteúdo possui marcação para leitor de tela.
        </p>
      ) : (
        statusMessage && (
          <p className="demo-audio-status" aria-live="polite">
            {statusMessage}
          </p>
        )
      )}
    </div>
  );
};
