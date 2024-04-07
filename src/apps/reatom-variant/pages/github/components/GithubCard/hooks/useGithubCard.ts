import { useAtom, useCtx } from '@reatom/npm-react';

import {
  cardsEntriesAtom,
  fetchCards,
  incrementReaction,
  positionChange,
  selectAtom,
  setDragging
} from '../../../model';

export const useGithubCard = (id: number) => {
  const ctx = useCtx();
  const [card] = useAtom((ctx) => {
    const remote = ctx.spy(fetchCards.dataAtom).find((card) => card.id === id);
    const local = ctx.spy(cardsEntriesAtom)[id];
    return { ...remote, ...local };
  });

  const onSetDragging = (isDragging: boolean) => setDragging(ctx, { id, isDragging });

  const setOffset = (offset: { x: number; y: number }) =>
    selectAtom(ctx, (prev) => ({ ...prev, offset }));

  const onPositionChange = (position: { x: number; y: number }) =>
    positionChange(ctx, { position });

  const onIncrementReaction = (id: number, reaction: string) =>
    incrementReaction(ctx, { id, reaction });

  return {
    state: { card },
    functions: {
      setDragging: onSetDragging,
      incrementReaction: onIncrementReaction,
      positionChange: onPositionChange,
      setOffset
    }
  };
};
