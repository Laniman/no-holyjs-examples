import type { AtomMut, RecordAtom } from '@reatom/framework';
import {
  action,
  atom,
  concurrent,
  parseAtoms,
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

type ReatomGithubCard = {
  position: RecordAtom<{ x: number; y: number }>;
  reactions: RecordAtom<Record<string, number>>;
  isDragging: AtomMut<boolean>;
} & Omit<GithubCardDragging, 'position' | 'reactions' | 'isDragging'>;

const reatomCard = (card: GithubCardDragging): ReatomGithubCard => {
  const positionAtom = reatomRecord(card.position, 'positionAtom');
  const reactionsAtom = reatomRecord(card.reactions, 'reactionsAtom');
  const isDraggingAtom = atom(false, 'isDraggingAtom');
  return {
    ...card,
    isDragging: isDraggingAtom,
    position: positionAtom,
    reactions: reactionsAtom
  };
};

export const cardsEntriesAtom = reatomMap<number, ReatomGithubCard>(new Map(), 'cardsEntriesAtom');

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
  cardsEntriesAtom.get(ctx, id)!.isDragging(ctx, isDragging);
  selectAtom(ctx, (prev) => ({ ...prev, id: isDragging ? id : null }));
}, 'setDragging');

export const positionChange = action(async (ctx, payload) => {
  const { position } = payload;
  const { id, offset } = ctx.get(selectAtom);

  if (!id) return;

  const card = cardsEntriesAtom.get(ctx, id)!;

  card.position.merge(ctx, {
    x: position.x + offset.x - card.size.width / 2,
    y: position.y + offset.y - card.size.height / 2
  });

  await updateCardDebounced(id, parseAtoms(ctx, card));
}, 'positionChange');

export const incrementReaction = action(
  concurrent(async (ctx, payload) => {
    const { id, reaction } = payload;
    const card = cardsEntriesAtom.get(ctx, id)!;

    card.reactions.merge(ctx, {
      [reaction]: ctx.get(card.reactions)[reaction] + 1
    });

    await ctx.schedule(() => sleep(500));
    await putGithubCard({ params: parseAtoms(ctx, card) });
  }),
  'incrementReaction'
);

export const reactionsCountAtom = atom((ctx) => {
  const cardsEntities = ctx.spy(cardsEntriesAtom);
  return [...cardsEntities.values()].reduce<number>((acc, card) => {
    return acc + Object.values(ctx.spy(card.reactions)).reduce((acc, value) => acc + value, 0);
  }, 0);
}, 'reactionsCountAtom');
