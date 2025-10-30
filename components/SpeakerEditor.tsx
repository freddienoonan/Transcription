
import React, { useState, useRef, useEffect } from 'react';
import { EditIcon } from './Icons';

interface SpeakerEditorProps {
  originalSpeaker: string;
  currentName: string;
  onNameChange: (originalSpeaker: string, newName: string) => void;
}

const SpeakerEditor: React.FC<SpeakerEditorProps> = ({ originalSpeaker, currentName, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);
  
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim() && name.trim() !== currentName) {
      onNameChange(originalSpeaker, name.trim());
    } else {
      setName(currentName); // revert if empty or unchanged
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(currentName);
      setIsEditing(false);
    }
  };
  
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="bg-gray-700 text-white p-2 rounded-md border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    );
  }

  return (
    <div 
        onClick={() => setIsEditing(true)} 
        className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md cursor-pointer group hover:bg-gray-600 transition-colors"
    >
      <span className="font-semibold text-gray-200">{currentName}</span>
      <EditIcon className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
    </div>
  );
};

export default SpeakerEditor;
