'use client';

import React from 'react';
import { Facet, useSearchContext } from '../../../contexts/SearchContext';
import { cn } from '@/lib/utils';

interface SearchFacetsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchFacetsModal: React.FC<SearchFacetsModalProps> = ({ isOpen, onClose }) => {
    const { facets, allFacets, selectedFacets, toggleFacet, clearFacets } = useSearchContext();

    if (!isOpen) return null;

    // sourceFacets are the ones we iterate over to build the UI
    const sourceFacets = allFacets.length > 0 ? allFacets : facets;

    return (
        <div className="fixed inset-0 z-70 flex justify-end overflow-hidden outline-none focus:outline-none">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 transition-opacity"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:max-w-lg',
                    isOpen ? 'translate-x-0' : 'translate-x-full',
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-black">Filter</h2>
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={clearFacets}
                            className="text-sm font-semibold text-black hover:text-[#eb0045]"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-2xl font-light text-black hover:text-[#eb0045]"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                    </div>
                </div>

                {/* Facets List */}
                <div className="h-[calc(100vh-160px)] overflow-y-auto px-6 py-4">
                    {facets.length === 0 ? (
                        <p className="py-10 text-center text-gray-500">
                            No filters available for this search.
                        </p>
                    ) : (
                        <div className="space-y-8">
                            {(() => {
                                // 1. Identify "Content Type"
                                const contentTypeFacet = sourceFacets.find((f) => f.name === 'type');

                                // 2. Identify all Tag-like facets (News Tags, Certifications, Know-how, Solutions, etc.)
                                // Based on user feedback, we group everything that isn't "type" under "Tags"
                                const tagFacets = sourceFacets.filter(
                                    (f) => f.name !== 'type'
                                );

                                // 3. Identify other facets (if any were excluded above)
                                const otherFacets: Facet[] = [];

                                const sections = [];

                                // Helper to get current count for a facet value from the 'facets' array (current search results)
                                const getCurrentCount = (fName: string, vText: string) => {
                                    const currentFacet = facets.find((f) => f.name === fName);
                                    const currentVal = currentFacet?.value.find((v) => v.text === vText);
                                    return currentVal?.count ?? 0;
                                };

                                // Add Content Type section
                                if (contentTypeFacet) {
                                    sections.push({
                                        id: 'type',
                                        label: 'Content Type',
                                        originalFacets: [contentTypeFacet],
                                        values: contentTypeFacet.value.map(v => ({
                                            ...v,
                                            count: getCurrentCount(contentTypeFacet.name, v.text)
                                        })),
                                    });
                                }

                                // Add Tags section (merged)
                                if (tagFacets.length > 0) {
                                    const mergedValues: any[] = [];
                                    const seenValues = new Set();

                                    tagFacets.forEach((tf) => {
                                        tf.value.forEach((v) => {
                                            const key = `${tf.name}|${v.text}`;
                                            if (!seenValues.has(key)) {
                                                mergedValues.push({
                                                    ...v,
                                                    facetName: tf.name,
                                                    count: getCurrentCount(tf.name, v.text)
                                                });
                                                seenValues.add(key);
                                            }
                                        });
                                    });

                                    sections.push({
                                        id: 'tags',
                                        label: 'Tags',
                                        originalFacets: tagFacets,
                                        values: mergedValues,
                                    });
                                }

                                // Add Other sections
                                otherFacets.forEach((f) => {
                                    sections.push({
                                        id: f.name,
                                        label: f.label || f.name,
                                        originalFacets: [f],
                                        values: f.value.map(v => ({
                                            ...v,
                                            count: getCurrentCount(f.name, v.text)
                                        })),
                                    });
                                });

                                return sections.map((section) => (
                                    <div key={section.id} className="facet-group">
                                        <h3 className="mb-4 text-base font-bold text-black">
                                            {section.label}
                                        </h3>
                                        <div className="flex flex-col gap-3">
                                            {section.values.map((val: any, idx: number) => {
                                                const fName = val.facetName || section.id;
                                                const isChecked =
                                                    selectedFacets[fName]?.includes(val.text);
                                                return (
                                                    <label
                                                        key={`${fName}-${val.id}-${idx}`}
                                                        className="flex cursor-pointer items-center gap-3 text-sm font-medium text-black transition-colors hover:text-[#eb0045]"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-5 w-5 rounded border-gray-300 text-black focus:ring-0 focus:ring-offset-0"
                                                            checked={isChecked || false}
                                                            onChange={() =>
                                                                toggleFacet(fName, val.text)
                                                            }
                                                        />
                                                        <span>
                                                            {val.text}{' '}
                                                            {val.count > 0 && `(${val.count})`}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-full border-2 border-black py-4 text-base font-bold text-black transition hover:bg-black hover:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchFacetsModal;
