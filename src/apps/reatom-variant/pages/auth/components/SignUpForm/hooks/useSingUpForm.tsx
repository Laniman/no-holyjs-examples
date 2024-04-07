import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom, useCtx } from '@reatom/npm-react';

import { signUpSubmit, stageAtom } from '../../../model';
import { signUpSchema } from '../constants';
import { COUNTRIES } from '../constants/countries';

interface SingUpForm {
  email: string;
  password: string;
  passwordConfirmation: string;
  login: string;
  firstName?: string;
  lastName?: string;
  country: {
    id: number;
    label: string;
    code: string;
  };
}

export const useSignUpForm = () => {
  const ctx = useCtx();
  const [loading] = useAtom((ctx) => ctx.spy(signUpSubmit.pendingAtom) > 0);

  const signUpForm = useForm<SingUpForm>({
    defaultValues: {
      country: COUNTRIES[0]
    },
    resolver: zodResolver(signUpSchema)
  });

  const goToSignIn = () => stageAtom(ctx, { value: 'signIn' });

  const onSubmit = signUpForm.handleSubmit((values) => signUpSubmit(ctx, { values }));

  const isPasswordsEqual =
    signUpForm.watch('password') === signUpForm.watch('passwordConfirmation');

  return {
    state: {
      loading,
      isPasswordsEqual,
      countries: COUNTRIES
    },
    form: signUpForm,
    functions: { onSubmit, goToSignIn }
  };
};
