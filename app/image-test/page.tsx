
'use client';

import { useState, useEffect } from 'react';
import { generateImage } from '../../lib/ai/image';

export default function ImageTestPage() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const testPrompt = "A futuristic cityscape with flying cars and neon signs.";
        generateImage(testPrompt)
            .then(setImageUrl)
            .catch(err => {
                console.error(err);
                setError(err.message);
            });
    }, []);

    return (
        <div>
            <h1>Image Generation Test</h1>
            {error && <p>Error: {error}</p>}
            {imageUrl ? (
                <img src={imageUrl} alt="Generated Image" />
            ) : (
                <p>Loading image...</p>
            )}
        </div>
    );
}
