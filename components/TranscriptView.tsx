import React from 'react';
import { TranscriptSegment } from '../types';
import SpeakerEditor from './SpeakerEditor';

interface TranscriptViewProps {
  transcript: TranscriptSegment[];
  speakerNames: Record<string, string>;
  onSpeakerNameChange: (originalName: string, newName: string) => void;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ transcript, speakerNames, onSpeakerNameChange }) => {
  // FIX: Explicitly type `uniqueSpeakers` as `string[]` to resolve index type error on line 24.
  const uniqueSpeakers: string[] = [...new Set(transcript.map(segment => segment.speaker))];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700 space-y-4">
        <div className="mb-6 pb-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Speakers</h3>
            <div className="flex flex-wrap gap-4">
                {uniqueSpeakers.map(speaker => (
                    <SpeakerEditor
                        key={speaker}
                        originalSpeaker={speaker}
                        currentName={speakerNames[speaker] || speaker}
                        onNameChange={onSpeakerNameChange}
                    />
                ))}
            </div>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {transcript.map((segment, index) => (
            <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 font-mono text-xs text-purple-400 bg-gray-900 px-2 py-1 rounded">
                <p>{segment.startTime}</p>
                <p>{segment.endTime}</p>
            </div>
            <div className="flex-grow">
                <p className="font-bold text-gray-200">{speakerNames[segment.speaker] || segment.speaker}</p>
                <p className="text-gray-300 leading-relaxed">{segment.text}</p>
            </div>
            </div>
        ))}
        </div>
    </div>
  );
};

export default TranscriptView;