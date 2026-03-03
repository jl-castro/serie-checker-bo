export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start(): void;
  stop(): void;
  abort?(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function getSpeechRecognitionConstructor(
  targetWindow: Window = window
): SpeechRecognitionConstructor | null {
  const speechWindow = targetWindow as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function getPreferredSpeechLanguage(targetNavigator: Navigator = navigator): 'es-BO' | 'es-ES' {
  const languages = (targetNavigator.languages ?? []).map((language) => language.toLowerCase());
  return languages.includes('es-bo') ? 'es-BO' : 'es-ES';
}
