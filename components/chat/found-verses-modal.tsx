import React from 'react';
import { BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Verse {
  reference: string;
  text: string;
  chapter?: string;
  verse?: string;
}

interface VersesDialogButtonProps {
  verses: Verse[];
  className?: string;
  isVisible?: boolean;
}

const VersesDialogButton: React.FC<VersesDialogButtonProps> = ({ 
  verses, 
  className = "",
  isVisible = true
}) => {
  if (!verses || verses.length === 0 || !isVisible) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`
            inline-flex items-center gap-2 px-4 py-2 
            bg-gradient-to-r from-amber-50 to-orange-50 
            hover:from-amber-100 hover:to-orange-100
            border border-amber-200 hover:border-amber-300
            rounded-full shadow-sm hover:shadow-md
            transition-all duration-200 ease-in-out
            text-amber-800 hover:text-amber-900
            font-medium text-sm
            group
            ${className}
          `}
        >
          <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span>عرض الآيات ({verses.length})</span>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-amber-50 to-orange-50 -m-6 p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-800">الآيات المقدسة</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {verses.length} آية
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <div className="space-y-6">
            {verses.map((verse, index) => (
              <div 
                key={index}
                className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200"
              >
                {/* Verse Reference */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-blue-800 text-lg">
                    {verse.reference}
                  </h3>
                </div>

                {/* Verse Text */}
                <div className="mr-10">
                  <p className="text-gray-700 leading-relaxed text-base font-medium">
                    "{verse.text}"
                  </p>
                  
                  {/* Additional verse info if available */}
                  {(verse.chapter || verse.verse) && (
                    <div className="mt-3 flex gap-4 text-sm text-gray-500">
                      {verse.chapter && (
                        <span>الفصل: {verse.chapter}</span>
                      )}
                      {verse.verse && (
                        <span>الآية: {verse.verse}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
          <p className="text-sm text-gray-600 text-center">
            "كلامك مصباح لرجلي ونور لسبيلي" - مزمور ١١٩:١٠٥
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersesDialogButton;