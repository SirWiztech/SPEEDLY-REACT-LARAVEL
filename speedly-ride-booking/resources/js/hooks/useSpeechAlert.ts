export function useSpeechAlert() {
    const getVoice = (): Promise<SpeechSynthesisVoice | null> => {
        return new Promise((resolve) => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length) {
                resolve(voices.find(v => v.lang.startsWith('en')) || null);
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices();
                    resolve(voices.find(v => v.lang.startsWith('en')) || null);
                };
            }
        });
    };

    const speak = async (message: string) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const clean = message
            .replace(/[^\w\s,.'!?₦-]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'en-NG';
        utterance.rate = 0.88;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        const voice = await getVoice();
        if (voice) utterance.voice = voice;

        window.speechSynthesis.speak(utterance);
    };

    const cancelSpeech = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    return { speak, cancelSpeech };
}
