import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number; // initial delay before typing starts
  className?: string;
  cursorClassName?: string;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 22,
  delay = 120,
  className = '',
  cursorClassName = 'text-blue-400 font-mono font-bold animate-pulse ml-0.5',
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);

    if (!text) {
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    let timer: NodeJS.Timeout | null = null;

    const startTimeout = setTimeout(() => {
      timer = setInterval(() => {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));

        if (currentIndex >= text.length) {
          if (timer) clearInterval(timer);
          setIsTyping(false);
          if (onComplete) onComplete();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      <span className={isTyping ? cursorClassName : 'text-blue-400/60 font-mono animate-pulse ml-0.5'}>
        |
      </span>
    </span>
  );
};
