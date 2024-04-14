import type { Action, Atom, RecordAtom } from '@reatom/framework';
import {
  action,
  atom,
  concurrent,
  parseAtoms,
  reatomAsync,
  reatomRecord,
  sleep,
  withAssign,
  withDataAtom,
  withErrorAtom
} from '@reatom/framework';

import { getGithubCards, putGithubCard } from '@/utils/api';

export type ReatomGithubCard = {
  position: RecordAtom<{ x: number; y: number }>;
  reactions: RecordAtom<Record<string, number>>;
  isDraggingAtom: Atom<boolean>;
  reactionsCount: Atom<number>;
  positionChange: Action;
  incrementReaction: Action;
};

export const draggingAtom = atom<null | GithubCardData>(null, 'draggingAtom');

const reatomCard = (card: GithubCard): ReatomGithubCard => {
  const name = `card#${card.id}`;

  const positionAtom = reatomRecord(card.position, `${name}.positionAtom`);
  const reactionsAtom = reatomRecord(card.reactions, `${name}.reactionsAtom`);

  const prepareData = action(
    (ctx) => ({
      ...card,
      position: parseAtoms(ctx, positionAtom),
      reactions: parseAtoms(ctx, reactionsAtom)
    }),
    `${name}.prepareData`
  );

  positionAtom.onChange(
    concurrent(async (ctx) => {
      await ctx.schedule(() => sleep(500));
      await putGithubCard({
        params: prepareData(ctx)
      });
    })
  );

  reactionsAtom.onChange(
    concurrent(async (ctx) => {
      await ctx.schedule(() => sleep(500));
      await putGithubCard({
        params: prepareData(ctx)
      });
    })
  );

  const reactionsCountAtom = atom((ctx) => {
    return Object.values(ctx.spy(reactionsAtom)).reduce((a, b) => a + b);
  }, `${name}.reactionsCountAtom`);

  const reatomGithubCard: ReatomGithubCard = {
    isDraggingAtom: atom(
      (ctx) => reatomGithubCard === ctx.spy(draggingAtom)?.reatomCard,
      `${name}.isDraggingAtom`
    ),
    position: positionAtom,
    reactions: reactionsAtom,
    reactionsCount: reactionsCountAtom,
    positionChange: action((ctx, payload: { x: number; y: number }) => {
      positionAtom.merge(ctx, payload);
    }, `${name}.positionChange`),
    incrementReaction: action((ctx, reaction: string) => {
      reactionsAtom.merge(ctx, {
        [reaction]: ctx.get(reactionsAtom)[reaction] + 1
      });
    }, `${name}.incrementReaction`)
  };

  return reatomGithubCard;
};

export type GithubCardData = {
  data: GithubCard;
  reatomCard: ReatomGithubCard;
};

export const fetchCards = reatomAsync(
  async () => {
    const getGithubCardsResponse = await getGithubCards();
    return getGithubCardsResponse.data.githubCards;
  },
  {
    name: 'fetchCards'
  }
).pipe(
  withDataAtom([], (_, cards) => {
    return cards.map<GithubCardData>((card) => ({
      data: card,
      reatomCard: reatomCard(card)
    }));
  }),
  withErrorAtom(),
  withAssign((original, name) => ({
    loadingAtom: atom((ctx) => ctx.spy(original.pendingAtom) > 0, `${name}.loadingAtom`),
    reactionsCountAtom: atom((ctx) => {
      const cards = ctx.spy(original.dataAtom);
      return cards.reduce(
        (a, { reatomCard: { reactionsCount } }) => a + ctx.spy(reactionsCount),
        0
      );
    }, `${name}.reactionsCountAtom`)
  }))
);
