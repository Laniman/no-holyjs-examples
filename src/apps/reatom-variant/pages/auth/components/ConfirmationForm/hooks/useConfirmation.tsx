import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom, useCtx } from '@reatom/npm-react';

import { confirmationSubmit, otpAtom, stageAtom } from '../../../model';
import { confirmationSchema } from '../constants';

interface ConfirmationFormForm {
  otp: string;
}

export const useConfirmationForm = () => {
  const ctx = useCtx();

  const [loading] = useAtom(confirmationSubmit.loadingAtom);
  const [otp] = useAtom(otpAtom);
  const [otpCountdown] = useAtom((ctx) =>
    Number((ctx.spy(otpAtom.countdownAtom) / 1000).toFixed(0))
  );

  const confirmationForm = useForm<ConfirmationFormForm>({
    resolver: zodResolver(confirmationSchema),
    reValidateMode: 'onSubmit'
  });

  const onOtpResend = () => otpAtom.resend(ctx);

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
