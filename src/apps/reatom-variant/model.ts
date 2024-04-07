import { atom, reatomAsync, withDataAtom } from '@reatom/framework';
import { withLocalStorage } from '@reatom/persist-web-storage';
import { COOKIE } from '@/utils';
import { getProfile } from '@/utils/api';

export const themeAtom = atom('light', 'themeAtom').pipe(withLocalStorage(COOKIE.THEME));

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
}).pipe(withDataAtom({} as Profile));
