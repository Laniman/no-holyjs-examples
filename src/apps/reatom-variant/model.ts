import { action, atom, reatomAsync, withDataAtom, withInit } from '@reatom/framework';
import { withLocalStorage } from '@reatom/persist-web-storage';

import { COOKIE } from '@/utils';
import { getProfile } from '@/utils/api';

const setTheme = action((_, theme) => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}, 'setTheme');

export const themeAtom = atom('light', 'themeAtom').pipe(
  withInit((ctx, init) => {
    const theme = init(ctx);
    setTheme(ctx, theme);
    return theme;
  }),
  withLocalStorage(COOKIE.THEME)
);

themeAtom.onChange(setTheme);

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
