import { atom, reatomAsync } from '@reatom/framework';
import { reatomTimer } from '@reatom/timer';
import { profileAtom, sessionAtom } from '@reatom-variant/model';
import { router } from '@redux-thunk-variant/router.ts';
import { toast } from 'sonner';

import { COOKIE } from '@/utils';
import {
  postOtpEmail,
  postOtpPhone,
  postSignInLogin,
  postSignUp,
  postTwoFactorAuthentication
} from '@/utils/api/requests';

export type Stage = 'signIn' | 'signUp' | 'selectConfirmation' | 'confirmation';
export const stageAtom = atom<{ value: Stage }>({ value: 'signIn' }, 'stageAtom');
export const otpAtom = atom<{ type: 'email' | 'phone'; resource: string; retryDelay: number }>(
  {
    type: 'email',
    resource: '',
    retryDelay: 0
  },
  'otpAtom'
);
export const otpCountdownAtom = reatomTimer({
  name: 'otpCountdownAtom',
  interval: 1000, // `1000`ms - tick each second. Than lower, then more precise
  delayMultiplier: 1000, // `1000`ms allow to pass seconds to startTimer. Use `1` to pass ms
  progressPrecision: 2, // progress will be rounded to 2 digits after dot
  resetProgress: true // progress will be reset to 0 on end of timer
});

export const signInSubmit = reatomAsync(async (ctx, payload) => {
  try {
    const { resource, values } = payload;

    if (resource === 'email') {
      const postOtpEmailResponse = await postOtpEmail({
        params: { email: values.login }
      });

      if (!postOtpEmailResponse.data.retryDelay) return;

      otpAtom(ctx, {
        type: 'email',
        resource: values.login,
        retryDelay: postOtpEmailResponse.data.retryDelay
      });

      otpCountdownAtom.startTimer(ctx, postOtpEmailResponse.data.retryDelay / 1000);
      stageAtom(ctx, { value: 'confirmation' });
      return;
    }

    const postSignInLoginResponse = await postSignInLogin({
      params: {
        [resource]: values.login,
        ...(resource === 'login' && { password: values.password })
      } as Record<'email' | 'login', string>
    });

    if (
      'needConfirmation' in postSignInLoginResponse.data &&
      postSignInLoginResponse.data.needConfirmation &&
      resource === 'login'
    ) {
      stageAtom(ctx, { value: 'selectConfirmation' });
      return;
    }

    if ('profile' in postSignInLoginResponse.data) {
      localStorage.setItem(COOKIE.ACCESS_TOKEN, postSignInLoginResponse.data.token);

      profileAtom(ctx, postSignInLoginResponse.data.profile);
      sessionAtom(ctx, { isAuthenticated: true });

      toast.success('Sign in is successful 👍', {
        cancel: { label: 'Close' },
        description: 'We are very glad to see you, have fun'
      });

      router.navigate({
        to: '/',
        replace: true
      });
    }
  } catch (error) {
    console.error(error);
  }
}, 'signInSubmit');

export const signInFormLoading = atom((ctx) => {
  return ctx.spy(signInSubmit.pendingAtom) > 0;
}, 'signInFormLoading');

export const selectConfirmationSubmit = reatomAsync(async (ctx, payload) => {
  try {
    const { values, selectedResource } = payload;

    const postOtp = selectedResource === 'email' ? postOtpEmail : postOtpPhone;
    const postOtpApiResponse = await postOtp({
      params: { [selectedResource]: values.resource } as Record<'email' | 'phone', string>
    });
    if (postOtpApiResponse.data.retryDelay) {
      otpAtom(ctx, {
        type: selectedResource,
        resource: values.resource,
        retryDelay: postOtpApiResponse.data.retryDelay
      });
      stageAtom(ctx, { value: 'confirmation' });
    }
  } catch (error) {
    console.error(error);
  }
}, 'selectConfirmationSubmit');

export const selectConfirmationFormLoading = atom((ctx) => {
  return ctx.spy(selectConfirmationSubmit.pendingAtom) > 0;
}, 'selectConfirmationFormLoading');

export const confirmationSubmit = reatomAsync(async (ctx, payload) => {
  try {
    const { values } = payload;
    const otp = ctx.get(otpAtom);

    const postTwoFactorAuthenticationResponse = await postTwoFactorAuthentication({
      params: {
        otp: values.otp,
        source: otp.resource
      }
    });

    if ('profile' in postTwoFactorAuthenticationResponse.data) {
      localStorage.setItem(COOKIE.ACCESS_TOKEN, postTwoFactorAuthenticationResponse.data.token);

      profileAtom(ctx, postTwoFactorAuthenticationResponse.data.profile);
      sessionAtom(ctx, { isAuthenticated: true });

      router.navigate({
        to: '/',
        replace: true
      });
    }
  } catch (error) {
    console.error(error);
  }
}, 'confirmationSubmit');

export const confirmationFormLoading = atom((ctx) => {
  return ctx.spy(confirmationSubmit.pendingAtom) > 0;
}, 'confirmationFormLoading');

export const otpResend = reatomAsync(async (ctx) => {
  try {
    const otp = ctx.get(otpAtom);
    const postOtp = otp.type === 'email' ? postOtpEmail : postOtpPhone;

    const postOtpResponse = await postOtp({
      params: { [otp.type]: otp.resource } as Record<'email' | 'phone', string>
    });

    if (postOtpResponse.data.retryDelay) {
      otpCountdownAtom.startTimer(ctx, postOtpResponse.data.retryDelay / 1000);

      otpAtom(ctx, {
        ...otp,
        retryDelay: postOtpResponse.data.retryDelay
      });

      stageAtom(ctx, { value: 'confirmation' });
    }
  } catch (error) {
    console.error(error);
  }
});

export const signUpSubmit = reatomAsync(async (ctx, payload) => {
  try {
    const {
      values: { passwordConfirmation, ...values }
    } = payload;

    await postSignUp({ params: values });

    toast.success('Your account has been created 👍', {
      cancel: { label: 'Close' },
      description: 'We are very glad to see you, have fun'
    });

    stageAtom(ctx, { value: 'signIn' });
  } catch (error) {
    console.error(error);
  }
}, 'signUpSubmit');
