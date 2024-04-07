import { action } from '@reatom/framework';
import { sessionAtom, tokenAtom } from '@reatom-variant/model.ts';
import { router } from '@redux-thunk-variant/router.ts';

export const logout = action((ctx) => {
  tokenAtom(ctx, null);
  sessionAtom(ctx, { isAuthenticated: false });

  router.navigate({
    to: '/auth',
    replace: true
  });
}, 'logout');
