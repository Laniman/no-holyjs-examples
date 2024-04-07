import React from 'react';
import { reatomComponent } from '@reatom/npm-react';
import { themeAtom } from '@reatom-variant/model';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeContainer = reatomComponent<ThemeProviderProps>(({ ctx, children }) => {
  const theme = ctx.spy(themeAtom);

  React.useLayoutEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}, 'ThemeContainer');
