import { useAtom, useCtx } from '@reatom/npm-react';

import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { cardsEntriesAtom, fetchCards, incrementReaction, selectAtom } from '../../model';

interface CardInfoProps {
  id: number;
}

const CardInfo = ({ id }: CardInfoProps) => {
  const ctx = useCtx();
  const [card] = useAtom((ctx) => ctx.spy(cardsEntriesAtom)[id]);

  return (
    <div className='flex gap-2'>
      {card.title}
      {Object.entries(card.reactions).map(([reaction, value]) => (
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
};

const ReactionCount = () => {
  const [cardsEntities] = useAtom(cardsEntriesAtom);

  const reactionsCount = Object.values(cardsEntities).reduce((acc, cardsEntity) => {
    return acc + Object.values(cardsEntity.reactions).reduce((acc, value) => acc + value, 0);
  }, 0);

  return (
    <p className='text-sm'>
      reactions count: <b>{reactionsCount}</b>
    </p>
  );
};

export const Info = () => {
  const [cards] = useAtom(fetchCards.dataAtom);
  const [{ id: selectedCardId }] = useAtom(selectAtom);

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
};
