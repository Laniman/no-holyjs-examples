import { atom } from '@reatom/framework';

const defaultTheme = 'light';
export const themeAtom = atom(defaultTheme, 'themeAtom');
export const profileAtom = atom<Profile>({} as Profile, 'profileAtom');

export const sessionAtom = atom(
  {
    isAuthenticated: false
  },
  'sessionAtom'
);
