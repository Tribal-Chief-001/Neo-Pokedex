import React, { useState, useMemo, useEffect } from 'react';
import { Pokemon } from './types';
import { REGIONS, POKEMON_TYPES, BST_RANGES, EGG_GROUPS } from './constants';
import PokemonCard from './components/PokemonCard';
import PokemonDetailModal from './components/PokemonDetailModal';
import TeamHub from './components/TeamHub';
import AiCreator from './components/AiCreator';
import TeamAnalysisModal from './components/TeamAnalysisModal';
import { GoogleGenAI } from '@google/genai';

const App: React.FC = () => {
    // --- Core Pokedex State ---
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    // --- Advanced Filter State ---
    const [selectedBst, setSelectedBst] = useState<number | 'all'>('all');
    const [selectedEggGroup, setSelectedEggGroup] = useState<string | 'all'>('all');


    // --- Team Builder State ---
    const [team, setTeam] = useState<Pokemon[]>([]);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // --- AI Creator State ---
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');

    // --- Data Fetching & Enrichment ---
    useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const response = await fetch('/pokedex.json');
                if (!response.ok) {
                    throw new Error('Pokedex data not found. If in development, please run `npm run fetch-data`.');
                }
                const data: any[] = await response.json();

                // Check for the placeholder/error object in pokedex.json
                if (Array.isArray(data) && data.length > 0 && data[0].error) {
                    throw new Error(data[0].error);
                }

                // Enrich data with BST
                const enrichedData: Pokemon[] = data.map(p => ({
                    ...p,
                    bst: p.stats?.reduce((sum, stat) => sum + stat.value, 0) ?? 0,
                }));
                
                setAllPokemon(enrichedData);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(errorMessage);
                console.error("Failed to load Pokémon data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPokemonData();
    }, []);

    const filteredPokemon = useMemo(() => {
        return allPokemon.filter(pokemon => {
            const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) || pokemon.id.toString().includes(searchTerm);
            const matchesRegion = selectedRegion === 'all' || pokemon.generation === selectedRegion;
            const matchesType = selectedType === 'all' || pokemon.types.map(t => t.toLowerCase()).includes(selectedType.toLowerCase());
            const matchesBst = selectedBst === 'all' || (pokemon.bst && pokemon.bst >= selectedBst);
            const matchesEggGroup = selectedEggGroup === 'all' || pokemon.eggGroups.includes(selectedEggGroup);
            return matchesSearch && matchesRegion && matchesType && matchesBst && matchesEggGroup;
        }).sort((a, b) => a.id - b.id);
    }, [allPokemon, searchTerm, selectedRegion, selectedType, selectedBst, selectedEggGroup]);
    
    const teamIds = useMemo(() => new Set(team.map(p => p.id)), [team]);

    // --- Team Type Coverage Calculation ---
    const teamTypeCoverage = useMemo(() => {
        const weaknesses = new Set<string>();
        const resistances = new Set<string>();

        const allTypes = new Set<string>();
        team.forEach(p => p.types.forEach(t => allTypes.add(t)));

        team.forEach(pokemon => {
            pokemon.weaknesses.forEach(weakness => weaknesses.add(weakness));
            pokemon.resistances.forEach(resistance => resistances.add(resistance));
            // Immunities also count as a form of resistance
            pokemon.immunities.forEach(immunity => resistances.add(immunity));
        });
        
        // A type shouldn't be a weakness if another team member resists or is immune to it
        const finalWeaknesses = [...weaknesses].filter(w => !resistances.has(w));
        const finalResistances = [...resistances].filter(r => !weaknesses.has(r));

        return { weaknesses: finalWeaknesses.sort(), resistances: finalResistances.sort() };
    }, [team]);


    // --- Event Handlers ---

    const handlePokemonSelect = (pokemon: Pokemon) => setSelectedPokemon(pokemon);
    const handleCloseModal = () => setSelectedPokemon(null);

    const handleSelectPokemonByName = (name: string) => {
        const newPokemon = allPokemon.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (newPokemon) {
            setSelectedPokemon(newPokemon);
        }
    };

    const handleAddToTeam = (pokemon: Pokemon) => {
        if (team.length < 6 && !teamIds.has(pokemon.id)) {
            setTeam(prevTeam => [...prevTeam, pokemon]);
        }
    };
    
    const handleRemoveFromTeam = (pokemonId: number) => {
        setTeam(prevTeam => prevTeam.filter(p => p.id !== pokemonId));
    };

    const handleGeneratePokemon = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        setGeneratedImage('');
        setGenerationError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: `A new Pokémon monster based on this description: "${aiPrompt}". Neo-brutalist pixel art style, on a plain white background.`,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/png',
                  aspectRatio: '1:1',
                },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            setGeneratedImage(`data:image/png;base64,${base64ImageBytes}`);
        } catch (e) {
            console.error(e);
            setGenerationError('Failed to generate. The AI might be busy. Try a different prompt.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnalyzeTeam = async () => {
        if (team.length < 2) return;
        setIsAnalysisModalOpen(true);
        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const teamInfo = team.map(p => `${p.name} (Types: ${p.types.join('/')})`).join(', ');
            const prompt = `Analyze the following Pokémon team: ${teamInfo}. Provide a concise, expert analysis covering:\n1. Overall Strengths: Key type advantages and strategic power.\n2. Potential Weaknesses: Critical type disadvantages to watch out for.\n3. Suggested Strategy: A simple, effective battle plan.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAnalysisResult(response.text);
        } catch (e) {
            console.error(e);
            setAnalysisResult('An error occurred while analyzing the team. The AI might be down.');
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedRegion('all');
        setSelectedType('all');
        setSelectedBst('all');
        setSelectedEggGroup('all');
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = selectedPokemon || isAnalysisModalOpen ? 'hidden' : 'unset';
    }, [selectedPokemon, isAnalysisModalOpen]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-4xl font-bold">LOADING DATABASE...</h1>
                <p className="mt-2 text-black/70">Connecting to the Silph Co. network.</p>
                <div className="mt-8 text-6xl font-bold blinking-cursor">_</div>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-red-200">
                <h1 className="text-4xl font-bold text-red-800">DATABASE ERROR</h1>
                <div className="mt-4 bg-white border-4 border-black p-4 max-w-lg text-left">
                    <p className="font-bold">Failed to load Pokémon data:</p>
                    <pre className="mt-2 text-sm whitespace-pre-wrap bg-gray-100 p-2 border-2 border-gray-400">{error}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-black p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">NEO-POKÉDEX</h1>
                    <p className="text-sm text-black/70">A VISUAL DATABASE POWERED BY AI</p>
                </header>

                <main>
                    <TeamHub 
                        team={team} 
                        onRemoveFromTeam={handleRemoveFromTeam} 
                        onAnalyze={handleAnalyzeTeam} 
                        teamTypeCoverage={teamTypeCoverage}
                    />

                    <AiCreator
                        prompt={aiPrompt}
                        setPrompt={setAiPrompt}
                        onGenerate={handleGeneratePokemon}
                        generatedImage={generatedImage}
                        isGenerating={isGenerating}
                        error={generationError}
                    />

                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-4 sm:p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-4 border-b-4 border-black pb-2">&lt;DATABASE&gt;</h2>
                        {/* Search and Filter */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 bg-white border-4 border-black text-sm focus:outline-none focus:bg-yellow-200"
                                aria-label="Search Pokémon by name or ID"
                            />
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="w-full p-3 bg-white border-4 border-black text-sm appearance-none focus:outline-none focus:bg-yellow-200"
                                aria-label="Filter by region"
                            >
                                <option value="all">All Regions</option>
                                {REGIONS.map(gen => <option key={gen.id} value={gen.id}>{gen.name}</option>)}
                            </select>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full p-3 bg-white border-4 border-black text-sm appearance-none focus:outline-none focus:bg-yellow-200"
                                aria-label="Filter by type"
                            >

                                <option value="all">All Types</option>
                                {POKEMON_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                             <select
                                value={selectedBst}
                                onChange={(e) => setSelectedBst(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="w-full p-3 bg-white border-4 border-black text-sm appearance-none focus:outline-none focus:bg-yellow-200"
                                aria-label="Filter by Base Stat Total"
                            >
                                <option value="all">All BSTs</option>
                                {BST_RANGES.map(range => <option key={range.value} value={range.value}>{range.label}</option>)}
                            </select>
                             <select
                                value={selectedEggGroup}
                                onChange={(e) => setSelectedEggGroup(e.target.value)}
                                className="w-full p-3 bg-white border-4 border-black text-sm appearance-none focus:outline-none focus:bg-yellow-200"
                                aria-label="Filter by Egg Group"
                            >
                                <option value="all">All Egg Groups</option>
                                {EGG_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}
                            </select>
                             <button onClick={handleResetFilters} className="p-3 bg-gray-600 text-white font-bold border-4 border-black shadow-[4px_4px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px sm:col-start-2 lg:col-start-4">
                                RESET FILTERS
                            </button>
                        </div>
                    </div>
                    
                    {/* Pokemon Grid */}
                    {filteredPokemon.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredPokemon.map(pokemon => (
                                <PokemonCard
                                    key={pokemon.id}
                                    pokemon={pokemon}
                                    onSelect={handlePokemonSelect}
                                    onAddToTeam={handleAddToTeam}
                                    isTeamFull={team.length >= 6}
                                    isInTeam={teamIds.has(pokemon.id)}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8 text-center">
                            <h3 className="text-2xl font-bold">NO RESULTS FOUND</h3>
                            <p className="mt-2 text-black/70">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </main>

                {selectedPokemon && (
                    <PokemonDetailModal
                        pokemon={selectedPokemon}
                        onClose={handleCloseModal}
                        onSelectPokemonByName={handleSelectPokemonByName}
                    />
                )}

                <TeamAnalysisModal
                    isOpen={isAnalysisModalOpen}
                    onClose={() => setIsAnalysisModalOpen(false)}
                    analysis={analysisResult}
                    isLoading={isAnalyzing}
                />
            </div>
        </div>
    );
};

export default App;