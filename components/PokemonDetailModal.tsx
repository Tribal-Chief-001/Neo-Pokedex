import React, { useEffect, useState, useMemo } from 'react';
import { Pokemon, PokemonEvolution, PokemonForm, PokemonMove } from '../types';
import TypeBadge from './TypeBadge';
import StatBar from './StatBar';
import { GoogleGenAI } from '@google/genai';

interface PokemonDetailModalProps {
    pokemon: Pokemon;
    onClose: () => void;
    onSelectPokemonByName: (name: string) => void;
}

type Page = 'About' | 'Stats' | 'Evolutions' | 'Defenses' | 'Moves' | 'Forms' | 'Oracle';

// --- Helper component for navigation icons ---
const FileIcon: React.FC<{ page: Page }> = ({ page }) => {
    const commonClasses = "w-5 h-5 mr-3 inline-block fill-current";
    const icons: { [key in Page]: React.ReactNode } = {
        About: <svg className={commonClasses} viewBox="0 0 24 24"><path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 10h8v2H8v-2zm0 4h8v2H8v-2zm0-8h4v2H8V8z"/></svg>,
        Stats: <svg className={commonClasses} viewBox="0 0 24 24"><path d="M5 21V8h3v13H5zm4-13v13h3V8h-3zm4 4v9h3v-9h-3zm4-5v14h3V7h-3z"/></svg>,
        Evolutions: <svg className={commonClasses} viewBox="0 0 24 24"><path d="M10 5H8v2H6v2H4v2h2v2h2v2h2v-2h3v-2h3v-2h-3V7h-3V5z m4 10h-2v2h-2v2h2v-2h2v-2zm-2 0v2h2v2h2v-2h-2v-2h-2z"/></svg>,
        Defenses: <svg className={commonClasses} viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.23L18 6.13V11c0 4.25-2.73 8.17-6 9.66C8.73 19.17 6 15.25 6 11V6.13L12 3.23z"/></svg>,
        Moves: <svg className={commonClasses} viewBox="0 0 24 24"><path d="M12 2L9 5h6l-3-3z m0 15l-4-4h3v-5h2v5h3l-4 4z m0 5l3-3H9l3 3z"/></svg>,
        Forms: <svg className={commonClasses} viewBox="0 0 24 24"><path d="M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z"/></svg>,
        Oracle: <svg className={commonClasses} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z m-1 15v-2h2v2h-2z m2-4h-2V7h2v6z"/></svg>,
    };
    return icons[page];
};


const PokemonDetailModal: React.FC<PokemonDetailModalProps> = ({ pokemon, onClose, onSelectPokemonByName }) => {
    // --- State for the new Command Console Dossier ---
    const [activePage, setActivePage] = useState<Page>('About');
    
    // --- Poké-Oracle State ---
    const [question, setQuestion] = useState('');
    const [oracleResponse, setOracleResponse] = useState('');
    const [isLoadingOracle, setIsLoadingOracle] = useState(false);
    const [oracleError, setOracleError] = useState('');

    const pages = useMemo<Page[]>(() => {
        const basePages: Page[] = ['About', 'Stats', 'Evolutions', 'Defenses', 'Moves'];
        if (pokemon.forms && pokemon.forms.length > 0) {
            basePages.push('Forms');
        }
        basePages.push('Oracle');
        return basePages;
    }, [pokemon]);

    // Reset state when the Pokémon changes
    useEffect(() => {
        setActivePage('About');
        setQuestion('');
        setOracleResponse('');
        setOracleError('');
        setIsLoadingOracle(false);
    }, [pokemon]);
    
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    const handleAskOracle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isLoadingOracle) return;
        setIsLoadingOracle(true);
        setOracleError('');
        setOracleResponse('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Answer the following question about the Pokémon named ${pokemon.name}: ${question}`,
                config: {
                    systemInstruction: "You are a world-class Pokémon expert, a 'Poké-Oracle'. Answer questions concisely, in 2-3 sentences, and in a style that would fit a classic Pokémon game's Pokedex or an NPC's dialogue.",
                },
            });
            
            setOracleResponse(response.text);
        } catch (e) {
            console.error(e);
            setOracleError('The Poké-Oracle is resting. Please try again later.');
        } finally {
            setIsLoadingOracle(false);
        }
    };

    // --- Sub-components for pages ---
    
    const EvolutionCard: React.FC<{ evo: PokemonEvolution, label: string }> = ({ evo, label }) => (
        <div className="text-center">
            <p className="text-sm font-bold mb-1">{label}</p>
            <div
                onClick={() => onSelectPokemonByName(evo.name)}
                className="bg-gray-200 border-4 border-black p-2 w-28 h-28 mx-auto cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000]"
            >
                <img src={evo.sprite} alt={evo.name} className="w-full h-full object-contain" />
            </div>
            <p className="font-bold mt-1 text-sm">{evo.name}</p>
            <p className="text-xs text-black/70 mt-1">{evo.condition}</p>
        </div>
    );
    
    const FormCard: React.FC<{ form: PokemonForm }> = ({ form }) => (
        <div className="text-center">
             <div className="bg-gray-200 border-4 border-black p-2 w-32 h-32 mx-auto">
                <img src={form.sprite} alt={form.name} className="w-full h-full object-contain" />
            </div>
            <p className="font-bold mt-2 text-sm">{form.name}</p>
            <div className="flex gap-1 justify-center mt-1">
                {form.types.map(type => <TypeBadge key={type} type={type} small />)}
            </div>
        </div>
    );
    
    const renderPageContent = () => {
        switch(activePage) {
            case 'About':
                return (
                    <div className="h-full">
                        <h4 className="text-lg font-bold border-b-2 border-black pb-1 mb-3">DESCRIPTION</h4>
                        <p className="text-sm leading-relaxed mb-6">{pokemon.description}</p>
                        
                        <h4 className="text-lg font-bold border-b-2 border-black pb-1 mb-3">ABILITIES</h4>
                        <ul className="list-disc list-inside text-sm space-y-2">
                            {pokemon.abilities.map(ability => <li key={ability}>{ability}</li>)}
                            {pokemon.hiddenAbility && <li>{pokemon.hiddenAbility} <span className="text-xs text-black/60">(Hidden)</span></li>}
                        </ul>
                    </div>
                );
            case 'Stats':
                return (
                     <div className="grid md:grid-cols-2 gap-8 h-full">
                        <div>
                            <h4 className="text-lg font-bold border-b-2 border-black pb-1 mb-4">BASE STATS</h4>
                            <div className="space-y-2">
                                {pokemon.stats.map(stat => <StatBar key={stat.name} stat={stat} />)}
                            </div>
                        </div>
                        <div className="space-y-6">
                             <div>
                                <h4 className="text-lg font-bold border-b-2 border-black pb-1 mb-3">TRAINING DATA</h4>
                                <div className="text-sm space-y-2">
                                    <p><strong>EV Yield:</strong> {pokemon.evYield}</p>
                                    <p><strong>Egg Groups:</strong> {pokemon.eggGroups.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Evolutions':
                return (pokemon.preevolution || (pokemon.evolutions && pokemon.evolutions.length > 0)) ? (
                    <div className="flex justify-center items-center gap-2 flex-wrap h-full">
                        {pokemon.preevolution && <EvolutionCard evo={{...pokemon.preevolution, condition: ''}} label="PREVIOUS" />}
                        {pokemon.preevolution && pokemon.evolutions && pokemon.evolutions.length > 0 && <div className="text-4xl font-bold mx-2">&rarr;</div>}
                        <div className="flex flex-wrap justify-center gap-4">
                            {pokemon.evolutions?.map(evo => <EvolutionCard key={evo.name} evo={evo} label={pokemon.evolutions.length > 1 ? "NEXT" : "FINAL"} />)}
                        </div>
                    </div>
                ) : <div className="flex items-center justify-center h-full"><p className="text-center text-sm">This Pokémon does not evolve.</p></div>;
            case 'Defenses':
                return (
                    <div className="space-y-6 text-sm h-full">
                        <div>
                            <h4 className="font-bold mb-2 text-base border-b-2 border-black pb-1">Weaknesses (x2)</h4>
                            <div className="flex flex-wrap gap-2">{pokemon.weaknesses.length > 0 ? pokemon.weaknesses.map(t => <TypeBadge key={t} type={t} />) : <span className="text-xs">None</span>}</div>
                        </div>
                         <div>
                            <h4 className="font-bold mb-2 text-base border-b-2 border-black pb-1">Resistances (x0.5)</h4>
                            <div className="flex flex-wrap gap-2">{pokemon.resistances.length > 0 ? pokemon.resistances.map(t => <TypeBadge key={t} type={t} />) : <span className="text-xs">None</span>}</div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-2 text-base border-b-2 border-black pb-1">Immunities (x0)</h4>
                             <div className="flex flex-wrap gap-2">{pokemon.immunities.length > 0 ? pokemon.immunities.map(t => <TypeBadge key={t} type={t} />) : <span className="text-xs">None</span>}</div>
                        </div>
                    </div>
                );
            case 'Moves':
                return pokemon.moves.length > 0 ? (
                     <div className="h-full flex flex-col">
                        <div className="grid grid-cols-12 gap-2 text-xs font-bold border-b-4 border-black pb-2 mb-2 flex-shrink-0">
                            <span className="col-span-4">NAME</span>
                            <span className="col-span-2">TYPE</span>
                            <span className="col-span-2">CAT</span>
                            <span className="col-span-1 text-center">POW</span>
                            <span className="col-span-1 text-center">ACC</span>
                            <span className="col-span-2 text-center">LEARN</span>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            {pokemon.moves.map((move, index) => (
                                <div key={`${move.name}-${index}`} className="grid grid-cols-12 gap-2 text-xs py-1.5 border-b border-gray-300 items-center">
                                    <span className="col-span-4 truncate font-bold">{move.name}</span>
                                    <div className="col-span-2"><TypeBadge type={move.type} small /></div>
                                    <span className="col-span-2">{move.category}</span>
                                    <span className="col-span-1 text-center">{move.power ?? '--'}</span>
                                    <span className="col-span-1 text-center">{move.accuracy ?? '--'}</span>
                                    <span className="col-span-2 text-center">{move.learnMethod}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : <div className="flex items-center justify-center h-full"><p className="text-sm text-center">Move data not available.</p></div>;
            case 'Forms':
                 return pokemon.forms ? (
                     <div className="flex justify-center items-center gap-8 flex-wrap h-full">
                         {pokemon.forms.map(form => <FormCard key={form.name} form={form} />)}
                     </div>
                 ) : null;
            case 'Oracle':
                return (
                     <div>
                        <h3 className="text-xl font-bold border-b-4 border-black pb-1 mb-3">POKÉ-ORACLE</h3>
                        <form onSubmit={handleAskOracle}>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder={`Ask about ${pokemon.name}...`}
                                    className="flex-grow p-3 bg-white border-4 border-black text-sm focus:outline-none focus:bg-purple-200 disabled:bg-gray-300"
                                    disabled={isLoadingOracle}
                                    aria-label={`Ask a question about ${pokemon.name}`}
                                />
                                <button
                                    type="submit"
                                    className="p-3 bg-purple-500 text-white font-bold border-4 border-black shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px disabled:bg-purple-300 disabled:shadow-none disabled:translate-y-0 disabled:translate-x-0"
                                    disabled={isLoadingOracle}
                                    aria-label="Ask the Poké-Oracle"
                                >
                                    {isLoadingOracle ? '...' : 'ASK'}
                                </button>
                            </div>
                        </form>
                        {(isLoadingOracle || oracleResponse || oracleError) && (
                            <div className="mt-4 bg-gray-200 border-4 border-black p-4 text-sm min-h-[80px]">
                                {isLoadingOracle && <p className="blinking-cursor">The Oracle is thinking...</p>}
                                {oracleError && <p className="text-red-600 font-bold">{oracleError}</p>}
                                {oracleResponse && <p className="leading-relaxed">{oracleResponse}</p>}
                            </div>
                        )}
                    </div>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-yellow-100 flex items-center justify-center p-4 sm:p-6 md:p-8 z-50">
             <div className="bg-white w-full max-w-6xl mx-auto border-4 border-black shadow-[8px_8px_0px_#000] h-[90vh] flex flex-row relative">
                
                {/* --- Main Close Button --- */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white font-bold text-2xl border-4 border-black shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px z-30"
                    aria-label="Close Dossier"
                >
                    &times;
                </button>
                
                {/* --- LEFT COLUMN: File Directory Navigation --- */}
                <nav className="w-1/3 md:w-1/4 bg-gray-200 border-r-4 border-black p-4 flex flex-col overflow-y-auto">
                    <h3 className="text-lg font-bold border-b-2 border-black pb-2 mb-3">DOSSIER:/</h3>
                    <div className="space-y-1 text-sm">
                        {pages.map(page => {
                            const fileNames: { [key in Page]: string } = {
                                About: 'ABOUT.TXT',
                                Stats: 'STATS.DAT',
                                Evolutions: 'EVO.LOG',
                                Defenses: 'DEFENSE.CFG',
                                Moves: 'MOVES.LST',
                                Forms: 'FORMS.IMG',
                                Oracle: 'ORACLE.EXE',
                            };
                            const isActive = page === activePage;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setActivePage(page)}
                                    className={`w-full text-left p-2 border-2 border-transparent hover:bg-yellow-200 focus:outline-none focus:bg-yellow-200 flex items-center ${isActive ? 'bg-yellow-300' : ''}`}
                                >
                                    <span className={`mr-2 ${isActive ? 'blinking-cursor font-bold text-lg' : 'opacity-0'}`}>&gt;</span>
                                    <FileIcon page={page} />
                                    <span className={isActive ? 'font-bold' : ''}>{fileNames[page]}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* --- RIGHT COLUMN: Content Viewer --- */}
                <div className="w-2/3 md:w-3/4 flex-1 flex flex-col">
                    {/* --- Header within Right Column --- */}
                    <header className="p-4 sm:p-6 border-b-4 border-black grid grid-cols-1 md:grid-cols-2 gap-4 items-center flex-shrink-0">
                        <div className="flex-shrink-0 text-center md:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold break-words">{pokemon.name}</h2>
                            <p className="text-black/60 text-lg">#{pokemon.id.toString().padStart(4, '0')}</p>
                            <div className="flex gap-2 justify-center md:justify-start mt-2">
                                {pokemon.types.map(type => <TypeBadge key={type} type={type} />)}
                            </div>
                        </div>
                        <div className="flex justify-center items-center order-first md:order-none">
                            <div className="bg-gray-200 border-4 border-black p-2 h-32 w-32 sm:h-40 sm:w-40">
                                <img src={pokemon.sprite} alt={pokemon.name} className="w-full h-full object-contain" />
                            </div>
                        </div>
                    </header>
                    
                    {/* --- Content Area --- */}
                    <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                        <div className="w-full h-full">
                            {renderPageContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PokemonDetailModal;