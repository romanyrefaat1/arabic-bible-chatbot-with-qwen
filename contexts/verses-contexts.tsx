"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Verse {
  reference: string;
  text: string;
  chapter?: string;
  verse?: string;
}

interface MessageVerses {
  messageId: number;
  verses: Verse[];
  timestamp: number;
}

interface VersesContextType {
  // Current verses for display
  verses: Verse[];
  setVerses: (verses: Verse[]) => void;
  clearVerses: () => void;
  hasVerses: boolean;
  
  // Message-specific verses storage
  messageVerses: MessageVerses[];
  setMessageVerses: (messageId: number, verses: Verse[]) => void;
  getMessageVerses: (messageId: number) => Verse[];
  clearMessageVerses: () => void;
  getAllVerses: () => Verse[];
}

const VersesContext = createContext<VersesContextType | undefined>(undefined);

export const VersesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [verses, setVersesState] = useState<Verse[]>([]);
  const [messageVerses, setMessageVersesState] = useState<MessageVerses[]>([]);

  const setVerses = (newVerses: Verse[]) => {
    setVersesState(newVerses);
  };

  const clearVerses = () => {
    setVersesState([]);
  };

  const setMessageVerses = (messageId: number, verses: Verse[]) => {
    setMessageVersesState(prev => {
      // Remove existing entry for this message
      const filtered = prev.filter(mv => mv.messageId !== messageId);
      // Add new entry if verses exist
      if (verses.length > 0) {
        return [...filtered, { messageId, verses, timestamp: Date.now() }];
      }
      return filtered;
    });
    
    // Also update current verses to show latest
    if (verses.length > 0) {
      setVersesState(verses);
    }
  };

  const getMessageVerses = (messageId: number): Verse[] => {
    const found = messageVerses.find(mv => mv.messageId === messageId);
    return found ? found.verses : [];
  };

  const clearMessageVerses = () => {
    setMessageVersesState([]);
    setVersesState([]);
  };

  const getAllVerses = (): Verse[] => {
    // Return all unique verses from all messages
    const allVerses: Verse[] = [];
    const seenRefs = new Set<string>();
    
    messageVerses.forEach(mv => {
      mv.verses.forEach(verse => {
        if (!seenRefs.has(verse.reference)) {
          seenRefs.add(verse.reference);
          allVerses.push(verse);
        }
      });
    });
    
    return allVerses;
  };

  const hasVerses = verses.length > 0;

  return (
    <VersesContext.Provider value={{ 
      verses, 
      setVerses, 
      clearVerses, 
      hasVerses,
      messageVerses,
      setMessageVerses,
      getMessageVerses,
      clearMessageVerses,
      getAllVerses
    }}>
      {children}
    </VersesContext.Provider>
  );
};

export const useVerses = () => {
  const context = useContext(VersesContext);
  if (context === undefined) {
    throw new Error('useVerses must be used within a VersesProvider');
  }
  return context;
};

// Hook for parsing verses from text content
export const useParseVerses = () => {
  const { setVerses, setMessageVerses } = useVerses();

  const parseVersesFromText = (text: string, messageId?: number) => {
    // Enhanced regex patterns for Arabic and English verse references
    const versePatterns = [
      // Pattern for quoted text with reference before: "Reference: Text"
      /([^":\n]+):\s*"([^"]+)"/g,
      // Pattern for Arabic references with quotes
      /([\u0600-\u06FF\s\d:.-]+)\s*"([^"]+)"/g,
      // Pattern for verses in parentheses with reference
      /\(([^)]+)\)\s*"([^"]+)"/g,
      // Pattern for standalone quotes that might be verses
      /"([^"]{10,})"/g
    ];

    const foundVerses: Verse[] = [];
    
    versePatterns.forEach((pattern, index) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        if (index === 3) {
          // For standalone quotes, try to detect if it's a verse
          const quoteText = match[1];
          if (isLikelyVerse(quoteText)) {
            foundVerses.push({
              reference: "آية مقتبسة", // "Quoted verse"
              text: quoteText.trim()
            });
          }
        } else {
          foundVerses.push({
            reference: match[1].trim(),
            text: match[2].trim()
          });
        }
      }
    });

    // Remove duplicates based on text content
    const uniqueVerses = foundVerses.filter((verse, index, self) => 
      index === self.findIndex(v => v.text === verse.text)
    );

    if (uniqueVerses.length > 0) {
      setVerses(uniqueVerses);
      if (messageId) {
        setMessageVerses(messageId, uniqueVerses);
      }
    }

    return uniqueVerses;
  };

  const isLikelyVerse = (text: string): boolean => {
    // Check if text looks like a biblical verse
    const verseIndicators = [
      // Arabic religious terms
      /الله|الرب|يسوع|المسيح|الروح|القدس|الآب|الابن/,
      // Common biblical phrases
      /طوبى|مبارك|أحبب|آمن|صل|اغفر/,
      // Verse-like structure
      /^[^.!?]{20,}[.!]$/
    ];
    
    return verseIndicators.some(pattern => pattern.test(text)) && text.length > 15;
  };

  return { parseVersesFromText };
};