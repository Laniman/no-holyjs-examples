import { reatomComponent } from '@reatom/npm-react';
import { themeAtom } from '@reatom-variant/model';

import { MoonIcon, SunIcon } from '@/components/icons';
import { Toggle } from '@/components/ui';

export const ThemeToggle = reatomComponent(({ ctx }) => {
  const theme = ctx.spy(themeAtom);

  const onToggleClick = () => themeAtom(ctx, theme === 'light' ? 'dark' : 'light');

  return (
    <Toggle aria-label='toggle theme' variant='outline' onClick={onToggleClick}>
      {theme === 'light' && <SunIcon className='h-6 w-6 text-yellow-500' />}
      {theme === 'dark' && <MoonIcon className='h-6 w-6 text-gray-500' />}
    </Toggle>
  );
});
