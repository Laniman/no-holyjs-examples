import { action, atom, reatomAsync, withDataAtom, withErrorAtom } from '@reatom/framework';

import { getGithubCards } from '@/utils/api';

import { updateCardDebounced } from './helpers/updateCardDebounced.ts';

export const cardsEntriesAtom = atom<Record<string, { isDragging: boolean } & GithubCard>>(
  {},
  'cardsEntriesAtom'
);

export const fetchCards = reatomAsync(
  async () => {
    const getGithubCardsResponse = await getGithubCards();
    return getGithubCardsResponse.data.githubCards;
  },
  {
    name: 'fetchCards',
    onFulfill: (ctx) => {
      const cards = ctx.get(fetchCards.dataAtom);
      const byId = cards.reduce(
        (acc, card) => ({ ...acc, [card.id]: { ...card, isDragging: false } }),
        {}
      );
      cardsEntriesAtom(ctx, byId);
    }
  }
).pipe(withDataAtom([]), withErrorAtom());

export interface SelectState {
  id: GithubCard['id'] | null;
  offset: {
    x: number;
    y: number;
  };
}

const initialState: SelectState = {
  id: null,
  offset: {
    x: 0,
    y: 0
  }
};

export const selectAtom = atom(initialState, 'selectAtom');

export const setDragging = action((ctx, { id, isDragging }) => {
  const byId = ctx.get(cardsEntriesAtom);
  const updated = { ...byId[id], isDragging };

  cardsEntriesAtom(ctx, (prev) => ({ ...prev, [id]: updated }));
  selectAtom(ctx, (prev) => ({ ...prev, id: isDragging ? id : null }));
}, 'setDragging');

export const positionChange = action((ctx, payload) => {
  const { position } = payload;
  const { id, offset } = ctx.get(selectAtom);
  if (!id) return;
  const card = ctx.get(cardsEntriesAtom)[id];
  const updatedCard = {
    ...card,
    position: {
      x: position.x + offset.x - card.size.width / 2,
      y: position.y + offset.y - card.size.height / 2
    }
  };
  cardsEntriesAtom(ctx, (prev) => ({ ...prev, [id]: updatedCard }));
  // TODO optimistic
  updateCardDebounced(id, updatedCard);
}, 'positionChange');

export const incrementReaction = action((ctx, payload) => {
  const { id, reaction } = payload;
  const entries = ctx.get(cardsEntriesAtom);

  const updatedCard = {
    ...entries[id],
    reactions: {
      ...entries[id].reactions,
      [reaction]: entries[id].reactions[reaction] + 1
    }
  };

  cardsEntriesAtom(ctx, (prev) => ({ ...prev, [id]: updatedCard }));
  // TODO optimistic
  updateCardDebounced(id, updatedCard);
}, 'incrementReaction');
