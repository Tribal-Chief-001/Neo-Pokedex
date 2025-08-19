import React, { useEffect } from 'react';

interface TeamAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysis: string;
    isLoading: boolean;
}

const TeamAnalysisModal: React.FC<TeamAnalysisModalProps> = ({ isOpen, onClose, analysis, isLoading }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-overlay-bg flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div
                className="bg-white w-full max-w-2xl border-4 border-black shadow-[8px_8px_0px_#000] relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white font-bold text-2xl border-4 border-black shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                <div className="p-6 md:p-8">
                     <h2 className="text-3xl font-bold mb-4 border-b-4 border-black pb-2">&lt;TEAM ANALYSIS&gt;</h2>
                     <div className="bg-gray-200 border-4 border-black p-4 min-h-[300px] text-sm">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="text-lg font-bold">ANALYZING TEAM SYNERGY...</p>
                                <div className="mt-4 text-5xl font-bold blinking-cursor">_</div>
                            </div>
                        ) : (
                            <pre className="whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                                {analysis}
                            </pre>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default TeamAnalysisModal;