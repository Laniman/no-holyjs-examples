import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom, useCtx } from '@reatom/npm-react';

import {
  confirmationFormLoading,
  confirmationSubmit,
  otpAtom,
  otpCountdownAtom,
  otpResend,
  stageAtom
} from '../../../model';
import { confirmationSchema } from '../constants';

interface ConfirmationFormForm {
  otp: string;
}

export const useConfirmationForm = () => {
  const ctx = useCtx();

  const [loading] = useAtom((ctx) => ctx.spy(confirmationFormLoading));
  const [otp] = useAtom((ctx) => ctx.spy(otpAtom));
  const [otpCountdown] = useAtom((ctx) => Number((ctx.spy(otpCountdownAtom) / 1000).toFixed(0)));

  const confirmationForm = useForm<ConfirmationFormForm>({
    resolver: zodResolver(confirmationSchema),
    reValidateMode: 'onSubmit'
  });

  const onOtpResend = () => otpResend(ctx);

  const onSubmit = confirmationForm.handleSubmit((values) => confirmationSubmit(ctx, { values }));

  const goToSignUp = () => stageAtom(ctx, { value: 'signUp' });

  return {
    state: {
      loading,
      otp,
      seconds: otpCountdown
    },
    form: confirmationForm,
    functions: { onSubmit, goToSignUp, onOtpResend }
  };
};
