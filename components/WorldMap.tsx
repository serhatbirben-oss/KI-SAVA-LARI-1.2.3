import React, { useState, useRef, useEffect } from 'react';
import { MAP_NODES, MapNode, KINGDOMS, GameTime } from '../types';
import { Castle, Tent, Flag, Skull, Mountain, ArrowDown, ZoomIn, ZoomOut, Compass, LocateFixed, Eye } from 'lucide-react';

interface WorldMapProps {
  currentLocationId: string | null;
  time: GameTime;
  onTravel: (node: MapNode) => void;
  isTraveling: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ currentLocationId, time, onTravel, isTraveling }) => {
  // --- CAMERA STATE ---
  const [scale, setScale] = useState(1.2); 
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  
  // REFS FOR DRAG CALCULATION
  const mapRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{x: number, y: number}>({x: 0, y: 0});
  const currentPosRef = useRef<{x: number, y: number}>({x: 0, y: 0});

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // --- AMBIENCE ---
  let ambienceFilter = "";
  if (time.phase === 'NIGHT') ambienceFilter = "brightness(0.4) contrast(1.2) saturate(0.6) hue-rotate(200deg)";
  else if (time.phase === 'DUSK') ambienceFilter = "brightness(0.7) sepia(0.4) contrast(1.1) hue-rotate(-10deg)";
  else if (time.phase === 'DAWN') ambienceFilter = "brightness(0.9) saturate(0.8) hue-rotate(10deg)";
  else ambienceFilter = "brightness(1.05) saturate(1.1)"; 

  // --- CONTROLS ---
  const handleWheel = (e: React.WheelEvent) => {
    if (isCinematic) return;
    const newScale = Math.min(Math.max(scale - e.deltaY * 0.001, 0.8), 3.0);
    setScale(newScale);
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCinematic) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    dragStartRef.current = { x: clientX, y: clientY };
    currentPosRef.current = { x: position.x, y: position.y };
    setIsDragging(true);
  };

  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isCinematic) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    setPosition({
      x: currentPosRef.current.x + deltaX,
      y: currentPosRef.current.y + deltaY
    });
  };

  const stopDrag = () => {
      setIsDragging(false);
  };

  // --- CRITICAL FIX: DISTANCE CHECK ---
  // Only trigger click if the mouse moved less than 5 pixels
  const handleNodeClick = (e: React.MouseEvent | React.TouchEvent, node: MapNode) => {
      e.stopPropagation();
      // If we are cinemtaic or traveling, ignore
      if(isCinematic || isTraveling) return;

      const clientX = 'touches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
      
      const dist = Math.sqrt(
          Math.pow(clientX - dragStartRef.current.x, 2) + 
          Math.pow(clientY - dragStartRef.current.y, 2)
      );

      // 5px threshold for "Click" vs "Drag"
      if (dist < 5) {
          onTravel(node);
      }
  };

  const centerOnPlayer = () => {
    setPosition({ x: 0, y: 0 }); 
    setScale(1.5);
  };

  return (
    <div 
        className="relative w-full h-full overflow-hidden bg-black cursor-move no-select"
        onWheel={handleWheel}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={startDrag}
        onTouchMove={onDrag}
        onTouchEnd={stopDrag}
    >
      {/* UI LAYER */}
      {!isCinematic && (
          <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
             <button onClick={() => setScale(s => Math.min(s + 0.5, 3))} className="p-3 bg-slate-900/80 text-white border border-slate-700 rounded-full hover:bg-slate-700 active:scale-95 transition-all shadow-xl"><ZoomIn size={20}/></button>
             <button onClick={() => setScale(s => Math.max(s - 0.5, 0.8))} className="p-3 bg-slate-900/80 text-white border border-slate-700 rounded-full hover:bg-slate-700 active:scale-95 transition-all shadow-xl"><ZoomOut size={20}/></button>
             <button onClick={centerOnPlayer} className="p-3 bg-slate-900/80 text-yellow-500 border border-slate-700 rounded-full hover:bg-slate-700 active:scale-95 transition-all shadow-xl"><LocateFixed size={20}/></button>
             <button onClick={() => setIsCinematic(true)} className="p-3 bg-slate-900/80 text-cyan-400 border border-slate-700 rounded-full hover:bg-slate-700 active:scale-95 transition-all shadow-xl"><Eye size={20}/></button>
          </div>
      )}

      {isCinematic && (
          <div className="absolute bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
              <button onClick={() => setIsCinematic(false)} className="pointer-events-auto px-8 py-3 bg-black/50 backdrop-blur-md border border-white/20 text-white font-cinzel tracking-[0.3em] uppercase hover:bg-black/80 transition-all animate-pulse">Gözlem Modundan Çık</button>
          </div>
      )}

      {/* MAP CANVAS */}
      <div 
        ref={mapRef}
        className="absolute inset-0 w-full h-full origin-center gpu-accelerated"
        style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            filter: ambienceFilter,
            transition: isDragging ? 'none' : 'transform 0.1s linear' // Faster response
        }}
      >
         {/* TERRAIN */}
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] bg-[#0f172a]">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-50 z-0"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#1e293b] to-[#0f172a] opacity-80 z-0"></div>
             <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

             {/* LINES */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                {MAP_NODES.map((node, i) => (
                    MAP_NODES.map((target, j) => {
                        if (i < j && Math.abs(node.x - target.x) + Math.abs(node.y - target.y) < 45) {
                            return (
                                <line 
                                    key={`${node.id}-${target.id}`}
                                    x1={`${node.x}%`} y1={`${node.y}%`}
                                    x2={`${target.x}%`} y2={`${target.y}%`}
                                    stroke={time.phase === 'NIGHT' ? "#334155" : "#64748b"} 
                                    strokeWidth="1" strokeDasharray="4 4" className="opacity-50"
                                />
                            )
                        }
                        return null;
                    })
                ))}
             </svg>

             {/* NODES */}
             {MAP_NODES.map((node) => {
                const isCurrent = currentLocationId === node.id;
                const isHovered = hoveredNode === node.id;
                const kingdom = node.kingdom !== 'NEUTRAL' && node.kingdom !== 'BANDITS' ? KINGDOMS[node.kingdom] : null;
                
                return (
                    <div
                        key={node.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        // IMPORTANT: MouseDown must NOT stop prop here, otherwise drag on node won't pan map
                        // We rely on distance check in onClick to differentiate
                    >
                        <button
                            onMouseUp={(e) => handleNodeClick(e, node)} // Use MouseUp to capture end of click
                            onTouchEnd={(e) => handleNodeClick(e, node)}
                            disabled={isTraveling || isCinematic}
                            className={`
                                relative group transition-all duration-200 ease-out
                                ${isCurrent ? 'scale-150 z-50' : isHovered ? 'scale-125 z-40' : 'scale-100 z-30'}
                                ${isTraveling ? 'grayscale opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
                            `}
                        >
                            <div className={`absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity ${kingdom ? 'bg-' + kingdom.color.split('-')[1] + '-500' : 'bg-slate-500'}`}></div>

                            <div className={`
                                w-8 h-8 md:w-12 md:h-12 rounded-lg rotate-45 flex items-center justify-center border-2 shadow-2xl overflow-hidden bg-slate-900
                                ${isCurrent ? 'border-yellow-400 text-yellow-400' : 'border-slate-600 text-slate-400 group-hover:border-white group-hover:text-white'}
                            `}>
                                <div className="-rotate-45">
                                    {node.type === 'TOWN' && <Castle size={isCurrent ? 20 : 16} strokeWidth={2.5} />}
                                    {node.type === 'CASTLE' && <Flag size={isCurrent ? 20 : 16} strokeWidth={2.5} />}
                                    {node.type === 'VILLAGE' && <Tent size={isCurrent ? 20 : 16} strokeWidth={2} />}
                                    {(node.type === 'RUIN' || node.type === 'MOUNTAIN_PASS') && <Mountain size={isCurrent ? 20 : 16} />}
                                    {node.type === 'HIDEOUT' && <Skull size={isCurrent ? 20 : 16} />}
                                </div>
                            </div>

                            {isCurrent && (
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce z-50 pointer-events-none">
                                    <div className="text-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"><ArrowDown size={24} fill="currentColor"/></div>
                                </div>
                            )}

                            {(scale > 1.8 || isHovered || isCurrent) && (
                                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none">
                                    <span className={`
                                        font-cinzel font-bold text-xs md:text-sm px-2 py-1 rounded bg-black/80 backdrop-blur-sm border border-white/10
                                        ${isCurrent ? 'text-yellow-400 border-yellow-900' : 'text-slate-200'}
                                    `}>
                                        {node.name}
                                    </span>
                                </div>
                            )}
                        </button>
                    </div>
                );
             })}
         </div>
      </div>
      
      {!isCinematic && <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>}
      
      <div className="absolute inset-0 z-30 pointer-events-none opacity-20 mix-blend-screen overflow-hidden">
           <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/clouds.png')] animate-[spin_200s_linear_infinite] opacity-30 origin-center"></div>
      </div>
    </div>
  );
};

export default WorldMap;