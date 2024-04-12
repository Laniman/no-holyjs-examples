import { reatomComponent } from '@reatom/npm-react';

import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import {
  cardsEntriesAtom,
  fetchCards,
  incrementReaction,
  reactionsCountAtom,
  selectAtom
} from '../../model';

interface CardInfoProps {
  id: number;
}

const CardInfo = reatomComponent<CardInfoProps>(({ ctx, id }) => {
  const card = cardsEntriesAtom.get(ctx, id)!;

  return (
    <div className='flex gap-2'>
      {card.title}
      {Object.entries(ctx.spy(card.reactions)).map(([reaction, value]) => (
        <Badge
          key={reaction}
          className='cursor-pointer select-none'
          variant='outline'
          onClick={() =>
            incrementReaction(ctx, {
              id: card.id,
              reaction
            })
          }
        >
          {reaction} {value}
        </Badge>
      ))}
    </div>
  );
}, 'CardInfo');

const ReactionCount = reatomComponent(
  ({ ctx }) => (
    <p className='text-sm'>
      reactions count: <b>{ctx.spy(reactionsCountAtom)}</b>
    </p>
  ),
  'ReactionCount'
);

export const Info = reatomComponent(({ ctx }) => {
  const cards = ctx.spy(fetchCards.dataAtom);

  const { id: selectedCardId } = ctx.spy(selectAtom);

  return (
    <div className='absolute left-5 top-20'>
      <div className='flex items-center gap-4'>
        <div>
          <h1 className='text-2xl font-medium'>Github cards</h1>
          <ReactionCount />
        </div>

        <Sheet>
          <SheetTrigger>
            <Button>Open</Button>
          </SheetTrigger>
          <SheetContent className='flex justify-center overflow-y-auto p-4 sm:max-w-[450px]'>
            <SheetHeader>
              <SheetTitle>Cards</SheetTitle>
              <div className='flex flex-col gap-2'>
                {cards.map((card) => (
                  <CardInfo key={card.id} id={card.id} />
                ))}
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

      {selectedCardId && (
        <p className='text-sm'>
          selected: <b>{selectedCardId}</b>
        </p>
      )}
    </div>
  );
}, 'Info');
