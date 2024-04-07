import { useAtom, useCtx } from '@reatom/npm-react';
import { profileAtom } from '@reatom-variant/model.ts';

import { logout } from '../model';

export const useIndexPage = () => {
  const ctx = useCtx();
  const [profile] = useAtom(profileAtom);

  const onLogoutClick = () => logout(ctx);

  return { state: { profile }, functions: { onLogoutClick } };
};
