import React from 'react';
import { reatomContext } from '@reatom/npm-react';

import { ThemeContainer } from './components/ThemeContainer/ThemeContainer';
import { ctx } from './reatom';

export interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <reatomContext.Provider value={ctx}>
    <ThemeContainer>{children}</ThemeContainer>
  </reatomContext.Provider>
);

export default Providers;
