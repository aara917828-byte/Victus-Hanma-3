import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, SlidersHorizontal, HelpCircle, ArrowUp, LoaderCircle, Download } from 'lucide-react';
import { generateFourImages } from '@/services/gemini';

interface GeneratorPanelProps {
  onClose: () => void;
}

export default function GeneratorPanel({ onClose }: GeneratorPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showDownloadOverlay, setShowDownloadOverlay] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const lastScrollTop = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const handleGenerate = async () => {
    if (!prompt || isLoading) return;
    setIsLoading(true);
    setGeneratedImages([]);
    try {
      const images = await generateFourImages(prompt);
      setGeneratedImages(images);
    } catch (error) {
      console.error('Failed to generate images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const currentScrollTop = scrollRef.current.scrollTop;
    const searchBarHeight = 400; // h-[400px]
    const halfSearchBarHeight = searchBarHeight / 2; // 200px

    // Calculate how much of the search bar should be hidden
    // It should hide up to 200px as we scroll down
    // And reveal as we scroll up
    const newOffset = Math.min(currentScrollTop, halfSearchBarHeight);

    setScrollOffset(newOffset);
    lastScrollTop.current = currentScrollTop;
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const onScroll = () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(handleScroll);
    };

    scrollElement.addEventListener('scroll', onScroll);

    return () => {
      scrollElement.removeEventListener('scroll', onScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleScroll]);

  const searchBarTransform = `translateY(-${scrollOffset}px)`;

  return (
    <motion.div
      ref={scrollRef} // Attach ref here
      className="fixed inset-0 bg-[#0F0F0F] z-10 flex flex-col overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top search bar area */}
      <div
        className="sticky top-0 z-20 flex-shrink-0 p-4 bg-[#1C1C1E] h-[400px] flex flex-col justify-between rounded-b-3xl shadow-lg -mb-40 transition-transform duration-200 ease-out"
        style={{ transform: searchBarTransform }}
      >
        <div className="w-full flex justify-start">
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <textarea
          placeholder="Describe your image..."
          className="w-full h-full bg-transparent text-white text-lg placeholder:text-white/50 focus:outline-none resize-none p-2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-white/10 rounded-full text-white"><Plus size={20} /></button>
            <button className="px-4 py-2 bg-white/10 rounded-full text-white text-sm">Image</button>
            <button className="p-2 bg-white/10 rounded-full text-white"><SlidersHorizontal size={20} /></button>
            <button className="p-2 bg-white/10 rounded-full text-white"><HelpCircle size={20} /></button>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="p-3 bg-white/20 rounded-full text-white flex items-center justify-center disabled:opacity-50 transition-all hover:bg-white/30"
          >
            {isLoading ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <ArrowUp size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Image display area */}
      <div className="flex-grow p-4 pt-40 flex flex-col items-center justify-center">
        {isLoading && (
          <div className="text-center text-white/50">
            <LoaderCircle size={48} className="animate-spin mx-auto mb-4" />
            <p>Generating your vision...</p>
          </div>
        )}

        {!isLoading && generatedImages.length === 0 && (
          <div className="text-center text-white/50">
            <p>Your generated images will appear here.</p>
          </div>
        )}

        {generatedImages.length > 0 && (
          <motion.div
            className="w-full max-w-3xl space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {generatedImages.map((src, index) => (
              <div
                key={index}
                className="relative aspect-square bg-white/5 rounded-lg overflow-hidden"
                onClick={() => setShowDownloadOverlay(index)}
                onContextMenu={(e) => { e.preventDefault(); setShowDownloadOverlay(index); }} 
              >
                <img src={src} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {showDownloadOverlay === index && (
                  <motion.div
                    className="absolute inset-0 bg-black/70 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(src, index); }}
                      className="p-4 bg-white/20 rounded-full text-white flex items-center space-x-2 hover:bg-white/30 transition-colors"
                    >
                      <Download size={24} />
                      <span>Download</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}