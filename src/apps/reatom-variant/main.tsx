import ReactDOM from 'react-dom/client';

import { App } from './app';
import { tokenAtom, fetchProfile } from './model';
import Providers from './providers';
import { ctx } from './reatom';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

const init = async () => {
  const token = ctx.get(tokenAtom);

  if (token) {
    await fetchProfile(ctx);
  }

  root.render(
    <Providers>
      <App />
    </Providers>
  );
};

init();
