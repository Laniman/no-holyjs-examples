import React from 'react';
import { reatomContext } from '@reatom/npm-react';

import { ctx } from './reatom';

export interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <reatomContext.Provider value={ctx}>{children}</reatomContext.Provider>
);

export default Providers;
