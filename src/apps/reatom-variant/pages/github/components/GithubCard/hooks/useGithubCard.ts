import { useAtom, useCtx } from '@reatom/npm-react';

import {
  cardsEntriesAtom,
  incrementReaction,
  positionChange,
  selectAtom,
  setDragging
} from '../../../model';

export const useGithubCard = (id: number) => {
  const ctx = useCtx();
  const [card] = useAtom((ctx) => ctx.spy(cardsEntriesAtom.get(ctx, id)!));

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
