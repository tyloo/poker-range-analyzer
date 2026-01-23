 'use client';
 
 import { useEffect, useState } from 'react';
 import { Card, HoleCards, Position, EquityResult, ActionRecommendation } from '@/lib/types';
 import { classifyHoleCards } from '@/lib/cards';
 import { analyzeBoardTexture, evaluateHand, getHandRankValue } from '@/lib/handStrength';
 import { calculateEquityVsRange } from '@/lib/equity';
 import { getHandAction } from '@/lib/ranges';
 
 interface AnalysisSummaryProps {
   holeCards: HoleCards;
   board: Card[];
   heroPosition: Position;
   villainPosition: Position;
 }
 
 const ACTION_COLORS = {
   raise: 'bg-green-600',
   call: 'bg-blue-600',
   check: 'bg-yellow-600',
   fold: 'bg-red-600',
 };
 
 function getActionRecommendation(
   holeCards: HoleCards,
   board: Card[],
   heroPosition: Position,
   equity: number
 ): ActionRecommendation {
   if (!holeCards) {
     return { action: 'fold', confidence: 'low', reasoning: 'No cards' };
   }
 
   const classification = classifyHoleCards(holeCards);
   const rangeAction = classification ? getHandAction(heroPosition, classification.hand) : null;
 
   if (board.length === 0) {
     if (!rangeAction || rangeAction.fold === 100) {
       return { action: 'fold', confidence: 'high', reasoning: `${classification?.hand} not in range` };
     }
     if (rangeAction.raise >= 75) {
       return { action: 'raise', sizing: '2.5-3x', confidence: 'high', reasoning: 'Strong open' };
     }
     if (rangeAction.raise > 0) {
       return { action: 'raise', sizing: '2.5x', confidence: 'medium', reasoning: `Mixed (${rangeAction.raise}%)` };
     }
     return { action: 'call', confidence: 'medium', reasoning: 'Calling range' };
   }
 
   const handStrength = evaluateHand(holeCards, board);
   const handValue = getHandRankValue(handStrength.rank);
 
   if (handValue >= 7) {
     return { action: 'raise', sizing: '75-100%', confidence: 'high', reasoning: handStrength.description };
   }
   if (handValue >= 5) {
     return { action: 'raise', sizing: '50-75%', confidence: 'high', reasoning: handStrength.description };
   }
   if (equity >= 60) {
     return { action: 'raise', sizing: '50-66%', confidence: 'medium', reasoning: `${equity.toFixed(0)}% equity` };
   }
   if (equity >= 45) {
     return handValue >= 3
       ? { action: 'call', confidence: 'medium', reasoning: `${equity.toFixed(0)}% equity` }
       : { action: 'check', confidence: 'medium', reasoning: 'Pot control' };
   }
   if (equity >= 30) {
     return { action: 'call', confidence: 'low', reasoning: 'Draw potential' };
   }
   return { action: 'fold', confidence: equity < 25 ? 'high' : 'medium', reasoning: `Low equity (${equity.toFixed(0)}%)` };
 }
 
 export default function AnalysisSummary({
   holeCards,
   board,
   heroPosition,
   villainPosition,
 }: AnalysisSummaryProps) {
   const [equity, setEquity] = useState<EquityResult | null>(null);
   const [isCalculating, setIsCalculating] = useState(false);
   const [recommendation, setRecommendation] = useState<ActionRecommendation | null>(null);
 
   useEffect(() => {
     if (!holeCards) {
       setEquity(null);
       setRecommendation(null);
       setIsCalculating(false);
       return;
     }
 
     setIsCalculating(true);
     const timer = setTimeout(() => {
       const result = calculateEquityVsRange(holeCards, board, villainPosition, 1000);
       setEquity(result);
       setRecommendation(getActionRecommendation(holeCards, board, heroPosition, result.equity));
       setIsCalculating(false);
     }, 10);
 
     return () => clearTimeout(timer);
   }, [holeCards, board, heroPosition, villainPosition]);
 
   if (!holeCards) {
     return (
       <div className="bg-gray-800 rounded-lg px-3 py-2 sm:py-2.5 min-h-[48px] flex items-center">
         <p className="text-sm text-gray-400">Select cards to analyze</p>
       </div>
     );
   }
 
   const classification = classifyHoleCards(holeCards);
   const handStrength = board.length >= 3 ? evaluateHand(holeCards, board) : null;
   const boardTexture = board.length >= 3 ? analyzeBoardTexture(board) : null;
   const rangeAction = classification ? getHandAction(heroPosition, classification.hand) : null;
 
   return (
     <div className="bg-gray-800 rounded-lg px-3 py-2 sm:py-2.5 min-h-[48px] flex flex-wrap items-center gap-3 text-xs">
       <div className="flex items-center gap-2">
         <span className="text-base sm:text-lg font-semibold text-white">{classification?.hand}</span>
         <span className="text-[11px] text-gray-400 capitalize">{classification?.type}</span>
         {rangeAction && (
           <div className="flex items-center gap-1">
             {rangeAction.raise > 0 && (
               <span className="px-2 py-0.5 bg-green-600 rounded text-[11px] text-white">
                 R{rangeAction.raise}%
               </span>
             )}
             {rangeAction.call > 0 && (
               <span className="px-2 py-0.5 bg-blue-600 rounded text-[11px] text-white">
                 C{rangeAction.call}%
               </span>
             )}
             {rangeAction.fold === 100 && (
               <span className="px-2 py-0.5 bg-red-600 rounded text-[11px] text-white">
                 Fold
               </span>
             )}
           </div>
         )}
       </div>
 
       <div className="flex items-center gap-2 text-gray-300">
         <span className="text-gray-400">Equity vs {villainPosition}</span>
         {isCalculating ? (
           <span className="text-gray-400">...</span>
         ) : equity ? (
           <span className="font-semibold text-white">{equity.equity.toFixed(1)}%</span>
         ) : (
           <span className="text-gray-500">--</span>
         )}
         {equity && !isCalculating && (
           <span className="text-gray-500">W {equity.win.toFixed(0)}% | T {equity.tie.toFixed(0)}%</span>
         )}
       </div>
 
       {recommendation && (
         <div className="flex items-center gap-2">
           <span className={`px-2 py-0.5 rounded text-[11px] text-white ${ACTION_COLORS[recommendation.action]}`}>
             {recommendation.action.toUpperCase()}
           </span>
           {recommendation.sizing && (
             <span className="text-gray-300">{recommendation.sizing}</span>
           )}
           <span className="text-gray-400 max-w-[220px] truncate">{recommendation.reasoning}</span>
         </div>
       )}
 
       {(handStrength || boardTexture) && (
         <div className="flex items-center gap-2 text-gray-400 max-w-[260px]">
           {handStrength && <span className="truncate">Made: {handStrength.description}</span>}
           {boardTexture && (
             <span className="flex items-center gap-1 text-[10px] text-gray-300">
               {boardTexture.isPaired && <span className="px-1.5 py-0.5 bg-yellow-600 rounded">Paired</span>}
               {boardTexture.isMonotone && <span className="px-1.5 py-0.5 bg-purple-600 rounded">Mono</span>}
               {boardTexture.isTwoTone && <span className="px-1.5 py-0.5 bg-blue-600 rounded">2-tone</span>}
               {boardTexture.isRainbow && <span className="px-1.5 py-0.5 bg-green-600 rounded">Rainbow</span>}
               <span className="px-1.5 py-0.5 bg-gray-600 rounded capitalize">
                 {boardTexture.connectivity}
               </span>
             </span>
           )}
         </div>
       )}
     </div>
   );
 }
