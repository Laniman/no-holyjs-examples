import { useAtom } from '@reatom/npm-react';
import { fetchCards } from '@reatom-variant/pages/github/model.ts';
import { Loader2 } from 'lucide-react';

import { GithubCard, Info } from './components';

export const GithubPage = () => {
  const [cards] = useAtom(fetchCards.dataAtom);
  const [loading] = useAtom((ctx) => ctx.spy(fetchCards.pendingAtom) > 0);

  return (
    <>
      <div className='relative h-screen w-full'>
        {loading && (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='size-6 animate-spin' />
          </div>
        )}
        {cards.map((card) => (
          <GithubCard key={card.id} id={card.id} />
        ))}
      </div>
      {!!cards.length && <Info />}
    </>
  );
};
