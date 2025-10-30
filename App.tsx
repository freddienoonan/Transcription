import React, { useState, useCallback, useEffect } from 'react';
import { transcribeAudio } from './services/geminiService';
import { TranscriptSegment } from './types';
import FileUploader from './components/FileUploader';
import TranscriptView from './components/TranscriptView';
import { DownloadIcon, LoaderIcon } from './components/Icons';

const App: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transcript.length > 0) {
      // FIX: Explicitly type `uniqueSpeakers` as `string[]` to resolve index type error on line 21.
      const uniqueSpeakers: string[] = [...new Set(transcript.map(segment => segment.speaker))];
      const initialSpeakerNames: Record<string, string> = {};
      uniqueSpeakers.forEach(speaker => {
        initialSpeakerNames[speaker] = speaker;
      });
      setSpeakerNames(initialSpeakerNames);
    }
  }, [transcript]);

  const handleFileChange = (file: File | null) => {
    setAudioFile(file);
    setTranscript([]);
    setError(null);
    setSpeakerNames({});
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove data:mime/type;base64, part
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTranscribe = useCallback(async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    setError(null);
    setTranscript([]);

    try {
      const base64Audio = await fileToBase64(audioFile);
      const mimeType = audioFile.type;
      
      const result = await transcribeAudio(base64Audio, mimeType);
      
      setTranscript(result);
    } catch (err) {
      console.error(err);
      setError('Failed to transcribe audio. Please try another file or check the API key.');
    } finally {
      setIsProcessing(false);
    }
  }, [audioFile]);

  const handleSpeakerNameChange = (originalName: string, newName: string) => {
    setSpeakerNames(prev => ({ ...prev, [originalName]: newName }));
  };

  const formatTranscriptForDownload = (): string => {
    return transcript.map(segment => {
      const speaker = speakerNames[segment.speaker] || segment.speaker;
      return `[${segment.startTime} - ${segment.endTime}] ${speaker}: ${segment.text}`;
    }).join('\n');
  };

  const handleDownload = () => {
    const transcriptText = formatTranscriptForDownload();
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audioFile?.name.split('.')[0]}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Gemini Audio Transcriber
          </h1>
          <p className="text-gray-400 mt-2">Upload an audio file to get a timestamped, speaker-separated transcript.</p>
        </header>

        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
          <FileUploader
            onFileChange={handleFileChange}
            onTranscribe={handleTranscribe}
            isProcessing={isProcessing}
            disabled={!audioFile || isProcessing}
          />
        </section>

        {isProcessing && (
          <div className="text-center my-8 flex items-center justify-center space-x-3">
            <LoaderIcon />
            <span className="text-lg text-purple-300 animate-pulse">Processing audio... this may take a few moments.</span>
          </div>
        )}

        {error && (
          <div className="text-center my-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {transcript.length > 0 && !isProcessing && (
          <section className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-200">Transcript</h2>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
              >
                <DownloadIcon />
                <span>Download</span>
              </button>
            </div>
            <TranscriptView 
              transcript={transcript}
              speakerNames={speakerNames}
              onSpeakerNameChange={handleSpeakerNameChange}
            />
          </section>
        )}
      </main>
      <footer className="w-full max-w-4xl text-center text-gray-500 mt-12 text-sm">
        <p>Powered by Google Gemini. UI designed for clarity and function.</p>
      </footer>
    </div>
  );
};

export default App;