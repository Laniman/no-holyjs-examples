import type { RecordAtom } from '@reatom/framework';
import {
  action,
  atom,
  concurrent,
  reatomAsync,
  reatomMap,
  reatomRecord,
  sleep,
  withDataAtom,
  withErrorAtom
} from '@reatom/framework';

import { getGithubCards, putGithubCard } from '@/utils/api';

import { updateCardDebounced } from './helpers/updateCardDebounced';

interface GithubCardDragging extends GithubCard {
  isDragging: boolean;
}

const reatomCard = (card: GithubCardDragging): RecordAtom<GithubCardDragging> =>
  reatomRecord(card, `card-${card.id}`);

export const cardsEntriesAtom = reatomMap<number, RecordAtom<GithubCardDragging>>(
  new Map(),
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

      cards.forEach((card) => {
        cardsEntriesAtom.set(ctx, card.id, reatomCard({ ...card, isDragging: false }));
      });
    }
  }
).pipe(withDataAtom([]), withErrorAtom());

export interface SelectState {
  id: GithubCardDragging['id'] | null;
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
  cardsEntriesAtom.get(ctx, id)!.merge(ctx, { isDragging });
  selectAtom(ctx, (prev) => ({ ...prev, id: isDragging ? id : null }));
}, 'setDragging');

export const positionChange = action(async (ctx, payload) => {
  const { position } = payload;
  const { id, offset } = ctx.get(selectAtom);

  if (!id) return;

  const cardAtom = cardsEntriesAtom.get(ctx, id)!;
  const card = ctx.get(cardAtom);

  cardAtom.merge(ctx, {
    position: {
      x: position.x + offset.x - card.size.width / 2,
      y: position.y + offset.y - card.size.height / 2
    }
  });

  await updateCardDebounced(id, card);
}, 'positionChange');

export const incrementReaction = action(
  concurrent(async (ctx, payload) => {
    const { id, reaction } = payload;
    const cardAtom = cardsEntriesAtom.get(ctx, id)!;
    const card = ctx.get(cardAtom);

    cardAtom.merge(ctx, {
      reactions: {
        ...card.reactions,
        [reaction]: card.reactions[reaction] + 1
      }
    });

    await ctx.schedule(() => sleep(500));
    await putGithubCard({ params: ctx.get(cardAtom) });
  }),
  'incrementReaction'
);

export const reactionsCountAtom = atom((ctx) => {
  const cardsEntities = ctx.spy(cardsEntriesAtom);
  return [...cardsEntities.values()].reduce<number>((acc, cardsAtom) => {
    return acc + Object.values(ctx.spy(cardsAtom).reactions).reduce((acc, value) => acc + value, 0);
  }, 0);
}, 'reactionsCountAtom');
