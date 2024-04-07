import { action } from '@reatom/framework';
import { sessionAtom } from '@reatom-variant/model.ts';
import { router } from '@redux-thunk-variant/router.ts';

import { COOKIE } from '@/utils';

export const logout = action((ctx) => {
  sessionAtom(ctx, { isAuthenticated: false });
  localStorage.removeItem(COOKIE.ACCESS_TOKEN);
  router.navigate({
    to: '/auth',
    replace: true
  });
}, 'logout');
