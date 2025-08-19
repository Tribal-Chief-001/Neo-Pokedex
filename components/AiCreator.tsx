import React from 'react';

interface AiCreatorProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onGenerate: () => void;
    generatedImage: string;
    isGenerating: boolean;
    error: string;
}

const AiCreator: React.FC<AiCreatorProps> = ({ prompt, setPrompt, onGenerate, generatedImage, isGenerating, error }) => {
    
    const loadingMessages = [
        "Connecting to Silph Co...",
        "Calibrating dimensional matrix...",
        "Rerouting power from Cerulean Gym...",
        "Waking up Snorlax...",
        "Polishing a Pokéball..."
    ];
    const [loadingMessage, setLoadingMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        let interval: number;
        if (isGenerating) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    return loadingMessages[(currentIndex + 1) % loadingMessages.length];
                });
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isGenerating]);


    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-4 sm:p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 border-b-4 border-black pb-2">&lt;POKÉMON GENESIS&gt;</h2>
            <div className="md:grid md:grid-cols-2 md:gap-6">
                <div>
                    <p className="mb-2 text-sm">Describe a new Pokémon and our AI will bring it to life.</p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A crystal turtle with moss on its back, a small fiery ghost lion, a robotic cactus pokemon..."
                        className="w-full p-3 bg-white border-4 border-black text-sm h-32 resize-none focus:outline-none focus:bg-pink-200 disabled:bg-gray-300"
                        disabled={isGenerating}
                        aria-label="Describe a new Pokémon"
                    />
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="mt-2 w-full p-3 bg-pink-500 text-white font-bold border-4 border-black shadow-[4px_4px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px disabled:bg-pink-300 disabled:shadow-none disabled:translate-y-0 disabled:translate-x-0 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'GENERATING...' : 'GENERATE'}
                    </button>
                </div>
                <div className="bg-gray-200 border-4 border-black aspect-square mt-4 md:mt-0 flex items-center justify-center p-4 text-center">
                    {isGenerating && (
                        <div>
                            <p className="text-lg font-bold">{loadingMessage}</p>
                            <div className="mt-4 text-5xl font-bold blinking-cursor">_</div>
                        </div>
                    )}
                    {error && <p className="text-red-600 font-bold p-4">{error}</p>}
                    {!isGenerating && !error && generatedImage && (
                        <img src={generatedImage} alt="AI Generated Pokémon" className="w-full h-full object-contain"/>
                    )}
                     {!isGenerating && !error && !generatedImage && (
                        <p className="text-black/60">IMAGE WILL APPEAR HERE</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiCreator;