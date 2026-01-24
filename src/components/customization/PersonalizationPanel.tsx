'use client';

import { useState, useCallback } from 'react';
import {
  CHARM_OPTIONS,
  ENGRAVING_OPTIONS,
  BEAD_COLORS,
  calculateCustomizationPrice,
} from '@/lib/customization-data';

interface PersonalizationPanelProps {
  basePrice: number;
  onCustomizationChange?: (customization: CustomizationState) => void;
}

export interface CustomizationState {
  engraving: string;
  font: string;
  charms: string[];
  beadColors: string[];
  customizationPrice: number;
}

export default function PersonalizationPanel({
  basePrice,
  onCustomizationChange,
}: PersonalizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'engraving' | 'charms' | 'colors'>('engraving');
  const [engraving, setEngraving] = useState('');
  const [font, setFont] = useState('Script');
  const [selectedCharms, setSelectedCharms] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>(['turquoise']);
  const [charmFilter, setCharmFilter] = useState<string>('all');

  const customizationPrice = calculateCustomizationPrice(engraving, selectedCharms, font);
  const totalPrice = basePrice + customizationPrice;

  const handleEngravingChange = useCallback((text: string) => {
    // Only allow valid characters
    if (text === '' || ENGRAVING_OPTIONS.allowedChars.test(text)) {
      if (text.length <= ENGRAVING_OPTIONS.maxLength) {
        setEngraving(text);
        onCustomizationChange?.({
          engraving: text,
          font,
          charms: selectedCharms,
          beadColors: selectedColors,
          customizationPrice: calculateCustomizationPrice(text, selectedCharms, font),
        });
      }
    }
  }, [font, selectedCharms, selectedColors, onCustomizationChange]);

  const handleCharmToggle = useCallback((charmId: string) => {
    setSelectedCharms(prev => {
      const newCharms = prev.includes(charmId)
        ? prev.filter(id => id !== charmId)
        : prev.length < 3
          ? [...prev, charmId]
          : prev;

      onCustomizationChange?.({
        engraving,
        font,
        charms: newCharms,
        beadColors: selectedColors,
        customizationPrice: calculateCustomizationPrice(engraving, newCharms, font),
      });

      return newCharms;
    });
  }, [engraving, font, selectedColors, onCustomizationChange]);

  const handleColorToggle = useCallback((colorId: string) => {
    setSelectedColors(prev => {
      const newColors = prev.includes(colorId)
        ? prev.filter(id => id !== colorId)
        : prev.length < 5
          ? [...prev, colorId]
          : prev;

      onCustomizationChange?.({
        engraving,
        font,
        charms: selectedCharms,
        beadColors: newColors,
        customizationPrice: calculateCustomizationPrice(engraving, selectedCharms, font),
      });

      return newColors;
    });
  }, [engraving, font, selectedCharms, onCustomizationChange]);

  const filteredCharms = charmFilter === 'all'
    ? CHARM_OPTIONS
    : CHARM_OPTIONS.filter(c => c.category === charmFilter);

  const colorCategories = ['ocean', 'earth', 'sunset', 'neutral'] as const;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>✨</span>
          Personalize Your Bracelet
        </h3>
        <p className="text-cyan-100 text-sm">Make it uniquely yours</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('engraving')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'engraving'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="mr-2">✍️</span>
          Engraving
        </button>
        <button
          onClick={() => setActiveTab('charms')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'charms'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="mr-2">🐢</span>
          Charms
          {selectedCharms.length > 0 && (
            <span className="ml-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
              {selectedCharms.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'colors'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="mr-2">🎨</span>
          Colors
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Engraving Tab */}
        {activeTab === 'engraving' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <input
                type="text"
                value={engraving}
                onChange={(e) => handleEngravingChange(e.target.value)}
                placeholder="Enter text to engrave..."
                maxLength={ENGRAVING_OPTIONS.maxLength}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{engraving.length}/{ENGRAVING_OPTIONS.maxLength} characters</span>
                {engraving.length > 0 && (
                  <span className="text-teal-600">
                    +${(ENGRAVING_OPTIONS.baseCost + engraving.length * ENGRAVING_OPTIONS.pricePerChar).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Style
              </label>
              <div className="flex gap-3">
                {ENGRAVING_OPTIONS.fonts.map((fontOption) => (
                  <button
                    key={fontOption}
                    onClick={() => setFont(fontOption)}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      font === fontOption
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={
                      fontOption === 'Script' ? 'font-serif italic' :
                      fontOption === 'Block' ? 'font-bold' :
                      'italic'
                    }>
                      {fontOption}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            {engraving && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">Preview</p>
                <p className={`text-2xl ${
                  font === 'Script' ? 'font-serif italic' :
                  font === 'Block' ? 'font-bold tracking-wider' :
                  'italic'
                }`}>
                  {engraving}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Charms Tab */}
        {activeTab === 'charms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Select up to 3 charms ({selectedCharms.length}/3)
              </p>
              <select
                value={charmFilter}
                onChange={(e) => setCharmFilter(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1"
              >
                <option value="all">All Categories</option>
                <option value="ocean">🌊 Ocean</option>
                <option value="animals">🦋 Animals</option>
                <option value="symbols">❤️ Symbols</option>
                <option value="nature">🌸 Nature</option>
              </select>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {filteredCharms.map((charm) => {
                const isSelected = selectedCharms.includes(charm.id);
                const isDisabled = !isSelected && selectedCharms.length >= 3;

                return (
                  <button
                    key={charm.id}
                    onClick={() => handleCharmToggle(charm.id)}
                    disabled={isDisabled}
                    title={charm.description}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50'
                        : isDisabled
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{charm.emoji}</div>
                    <div className="text-xs font-medium text-gray-700 truncate">
                      {charm.name}
                    </div>
                    <div className="text-xs text-teal-600">+${charm.price}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Charms Summary */}
            {selectedCharms.length > 0 && (
              <div className="bg-teal-50 rounded-xl p-4">
                <p className="text-sm font-medium text-teal-800 mb-2">Selected Charms:</p>
                <div className="flex gap-2">
                  {selectedCharms.map(charmId => {
                    const charm = CHARM_OPTIONS.find(c => c.id === charmId);
                    return charm ? (
                      <span
                        key={charmId}
                        className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm"
                      >
                        {charm.emoji} {charm.name}
                        <button
                          onClick={() => handleCharmToggle(charmId)}
                          className="ml-1 text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select bead colors ({selectedColors.length}/5) - colors will be mixed in your bracelet
            </p>

            {colorCategories.map(category => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {category} Tones
                </h4>
                <div className="flex flex-wrap gap-2">
                  {BEAD_COLORS.filter(c => c.category === category).map((color) => {
                    const isSelected = selectedColors.includes(color.id);
                    const isDisabled = !isSelected && selectedColors.length >= 5;

                    return (
                      <button
                        key={color.id}
                        onClick={() => handleColorToggle(color.id)}
                        disabled={isDisabled}
                        title={color.name}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'border-teal-500 ring-2 ring-teal-200 scale-110'
                            : isDisabled
                              ? 'opacity-50 cursor-not-allowed border-gray-200'
                              : 'border-gray-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-lg">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Color Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Color Mix</p>
              <div className="flex justify-center gap-1">
                {selectedColors.map(colorId => {
                  const color = BEAD_COLORS.find(c => c.id === colorId);
                  return color ? (
                    <div
                      key={colorId}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="border-t bg-gray-50 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </span>
              {customizationPrice > 0 && (
                <span className="text-sm text-teal-600">
                  (+${customizationPrice.toFixed(2)} personalization)
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Base: ${basePrice.toFixed(2)}</p>
            {customizationPrice > 0 && (
              <p className="text-xs text-gray-500">
                Customization: +${customizationPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
