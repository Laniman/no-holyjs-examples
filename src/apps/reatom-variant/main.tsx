import ReactDOM from 'react-dom/client';

import { getProfile } from '@/utils/api';
import { COOKIE } from '@/utils/constants';

import { App } from './app';
import { profileAtom, sessionAtom, themeAtom } from './model';
import Providers from './providers';
import { ctx } from './reatom';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

const defaultTheme = 'light';

const init = async () => {
  const token = localStorage.getItem(COOKIE.ACCESS_TOKEN);

  if (token) {
    const getProfileApiResponse = await getProfile();
    sessionAtom(ctx, { isAuthenticated: true });
    themeAtom(ctx, defaultTheme);

    if (getProfileApiResponse.data) {
      profileAtom(ctx, getProfileApiResponse.data.profile);
    }
  }

  root.render(
    <Providers>
      <App />
    </Providers>
  );
};

init();
