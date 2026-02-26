/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import GeneratorPanel from '@/components/GeneratorPanel';

export default function App() {
  const [isGeneratorOpen, setGeneratorOpen] = useState(true); // Generator is always open

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans">
      <AnimatePresence>
        {isGeneratorOpen && <GeneratorPanel onClose={() => setGeneratorOpen(false)} />} {/* onClose will now effectively close the app or do nothing */}
      </AnimatePresence>
    </div>
  );
}
