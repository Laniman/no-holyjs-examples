import React from 'react';
import { reatomComponent } from '@reatom/npm-react';

import { ConfirmationForm } from './components/ConfirmationForm/ConfirmationForm';
import { SelectConfirmationForm } from './components/SelectConfirmationForm/SelectConfirmationForm';
import { SignInForm } from './components/SignInForm/SignInForm';
import { SignUpForm } from './components/SignUpForm/SignUpForm';
import { stageAtom } from './model';

const component: Record<any, React.ReactNode> = {
  signIn: <SignInForm />,
  signUp: <SignUpForm />,
  selectConfirmation: <SelectConfirmationForm />,
  confirmation: <ConfirmationForm />
};

export const AuthPage = reatomComponent(({ ctx }) => {
  const stage = ctx.spy(stageAtom).value;
  return component[stage];
}, 'AuthPage');
