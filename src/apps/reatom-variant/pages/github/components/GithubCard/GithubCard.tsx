import { useRef } from 'react';
import { reatomComponent } from '@reatom/npm-react';
import type { GithubCardData } from '@reatom-variant/pages/github/model';
import { draggingAtom } from '@reatom-variant/pages/github/model';

import { Avatar, AvatarImage, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/badge';

interface GithubCardProps {
  card: GithubCardData;
}

export const GithubCard = reatomComponent<GithubCardProps>(({ ctx, card }) => {
  const prevPositionRef = useRef<{ x: number; y: number } | null>(null);
  const positionX = ctx.spy(card.reatomCard.position).x;
  const positionY = ctx.spy(card.reatomCard.position).y;

  return (
    <Card
      style={{
        zIndex: ctx.spy(card.reatomCard.isDraggingAtom) ? 50 : 1,
        cursor: 'pointer',
        left: `${positionX}px`,
        top: `${positionY}px`,
        width: `${card.data.size.width}px`,
        height: `${card.data.size.height}px`,
        position: 'absolute',
        userSelect: 'none'
      }}
      onMouseMove={(event) => {
        if (prevPositionRef.current === null) return;

        card.reatomCard.positionChange(ctx, {
          x: positionX - prevPositionRef.current.x + event.clientX,
          y: positionY - prevPositionRef.current.y + event.clientY
        });

        prevPositionRef.current = { x: event.clientX, y: event.clientY };
      }}
      onMouseDown={(event) => {
        draggingAtom(ctx, card);
        prevPositionRef.current = { x: event.clientX, y: event.clientY };
      }}
      onMouseLeave={() => {
        draggingAtom(ctx, null);
        prevPositionRef.current = null;
      }}
      onMouseUp={() => {
        draggingAtom(ctx, null);
        prevPositionRef.current = null;
      }}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{card.data.id}</CardTitle>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={card.data.image} alt={card.data.title} />
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className='text-md font-bold'>{card.data.title}</div>
        <p className='text-xs text-muted-foreground'>{card.data.description}</p>

        <div className='my-2 flex gap-2'>
          {Object.entries(ctx.spy(card.reatomCard.reactions)).map(([reaction, value]) => (
            <Badge
              key={reaction}
              variant='outline'
              onClick={(event) => {
                event.stopPropagation();
                card.reatomCard.incrementReaction(ctx, reaction);
              }}
            >
              {reaction} {value}
            </Badge>
          ))}
        </div>
        <div className='flex gap-2'>
          <div>x: {positionX}</div>
          <div>y: {positionY}</div>
        </div>
      </CardContent>
    </Card>
  );
}, 'GithubCard');
