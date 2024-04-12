import { parseAtoms } from '@reatom/framework';
import { useAction, useAtom } from '@reatom/npm-react';

import {
  cardsEntriesAtom,
  incrementReaction,
  positionChange,
  selectAtom,
  setDragging
} from '../../../model';

export const useGithubCard = (id: number) => {
  const [card] = useAtom((ctx) => parseAtoms(ctx, cardsEntriesAtom.get(ctx, id)!));

  const onSetDragging = useAction((ctx, isDragging) => setDragging(ctx, { id, isDragging }));

  const setOffset = useAction((ctx, offset: { x: number; y: number }) =>
    selectAtom(ctx, (prev) => ({ ...prev, offset }))
  );

  const onPositionChange = useAction((ctx, position: { x: number; y: number }) =>
    positionChange(ctx, { position })
  );

  const onIncrementReaction = useAction((ctx, id: number, reaction: string) =>
    incrementReaction(ctx, { id, reaction })
  );

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
