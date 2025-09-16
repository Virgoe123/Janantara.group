
'use client';

import { useState, useEffect } from 'react';

const fullText = "Turning Ideas into Awesome Apps";
const typingSpeed = 120; // milliseconds per character
const pauseDuration = 2000; // milliseconds to pause after typing

export default function TypingTitle() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    let ticker: NodeJS.Timeout;

    const handleTyping = () => {
      if (!isDeleting && text.length < fullText.length) {
        setText(fullText.substring(0, text.length + 1));
      } else if (isDeleting && text.length > 0) {
        setText(fullText.substring(0, text.length - 1));
      } else if (!isDeleting && text.length === fullText.length) {
        // Pause at the end
        ticker = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
        return; // Stop the interval for the pause
      } else if (isDeleting && text.length === 0) {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };
    
    ticker = setTimeout(handleTyping, typingSpeed);

    return () => {
      clearTimeout(ticker);
    };
  }, [text, isDeleting, loopNum]);

  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter font-headline leading-tight" style={{color: '#F9F4F0'}}>
      {text}
      <span className="typing-cursor">|</span>
    </h1>
  );
}
