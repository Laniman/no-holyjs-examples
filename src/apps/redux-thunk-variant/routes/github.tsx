import { createFileRoute } from '@tanstack/react-router';

import { ROUTES } from '@/utils/constants/routes';

import { store } from '../redux/store';

export const Route = createFileRoute(ROUTES.GITHUB)({
  beforeLoad: async () => {
    const { githubPrefix, githubReducer } = await import('../pages/github/slices');

    store.rootReducer.inject(
      {
        reducerPath: githubPrefix,
        reducer: githubReducer
      },
      { overrideExisting: true }
    );

    store.dispatch({ type: '@@INIT' });

    const { githubThunks } = await import('../pages/github/thunks');
    store.dispatch(githubThunks.initCards.thunk());
  }
});
