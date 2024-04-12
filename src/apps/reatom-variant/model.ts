import { action, atom, reatomAsync, withAssign, withDataAtom, withInit } from '@reatom/framework';
import { withLocalStorage } from '@reatom/persist-web-storage';

import { COOKIE } from '@/utils';
import { getProfile } from '@/utils/api';

type Theme = 'light' | 'dark';

export const themeAtom = atom<Theme>('light', 'themeAtom').pipe(
  withInit((ctx, init) => {
    const theme = init(ctx);
    themeAtom.set(ctx, theme);
    return theme;
  }),
  withLocalStorage(COOKIE.THEME),
  withAssign((_, name) => ({
    set: action((_, theme: Theme) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }, `${name}.setTheme`)
  }))
);

themeAtom.onChange(themeAtom.set);

export const tokenAtom = atom<null | string>(null, 'tokenAtom').pipe(
  withLocalStorage(COOKIE.ACCESS_TOKEN)
);

export const sessionAtom = atom(
  {
    isAuthenticated: false
  },
  'sessionAtom'
);

export const fetchProfile = reatomAsync(async (ctx) => {
  const getProfileApiResponse = await getProfile();
  sessionAtom(ctx, { isAuthenticated: true });

  return getProfileApiResponse.data.profile;
}, 'fetchProfile').pipe(withDataAtom({} as Profile));
