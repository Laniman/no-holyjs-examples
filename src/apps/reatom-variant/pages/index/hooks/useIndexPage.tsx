import { useAtom, useCtx } from '@reatom/npm-react';
import { fetchProfile } from '@reatom-variant/model';

import { logout } from '../model';

export const useIndexPage = () => {
  const ctx = useCtx();
  const [profile] = useAtom(fetchProfile.dataAtom);

  const onLogoutClick = () => logout(ctx);

  return { state: { profile }, functions: { onLogoutClick } };
};
