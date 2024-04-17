import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom, useCtx } from '@reatom/npm-react';

import { confirmationSubmit, otp, stage } from '../../../model';
import { confirmationSchema } from '../constants';

interface ConfirmationFormForm {
  otp: string;
}

export const useConfirmationForm = () => {
  const ctx = useCtx();

  const [loading] = useAtom(
    (ctx) => ctx.spy(confirmationSubmit.loading) || ctx.spy(otp.resend.pendingAtom) > 0
  );
  const [otpValue] = useAtom(otp);
  const [otpCountdown] = useAtom((ctx) => Number((ctx.spy(otp.countdown) / 1000).toFixed(0)));

  const confirmationForm = useForm<ConfirmationFormForm>({
    resolver: zodResolver(confirmationSchema),
    reValidateMode: 'onSubmit'
  });

  const onOtpResend = () => otp.resend(ctx);

  const onSubmit = confirmationForm.handleSubmit((values) => confirmationSubmit(ctx, { values }));

  const goToSignUp = () => stage(ctx, { value: 'signUp' });

  return {
    state: {
      loading,
      otp: otpValue,
      seconds: otpCountdown
    },
    form: confirmationForm,
    functions: { onSubmit, goToSignUp, onOtpResend }
  };
};
