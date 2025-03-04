'use client';
import { useEffect, useReducer, useState } from 'react';
import { CompanyVATStep } from '@/components/onboarding';
import { CompanyInfoStep } from '@/components/onboarding';
import { OnboardingState, OnboardingAction, CompanyInfo } from './types';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const initialState: OnboardingState = {
  step: 1,
  data: {
    id: '',
    token: '',
    vat_number: '',
    iban_number: '',
    legal_name: '',
    address_legal: '',
    website: ''
  }
};

function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: state.step - 1 };
    case 'UPDATE_DATA':
      return { ...state, data: { ...state.data, ...action.payload } };
    default:
      return state;
  }
}

export function CompanyOnboarding() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const [tokenValid, setTokenValid] = useState(true);
  const t = useTranslations('Common');
  const vat_number = searchParams.get('vat_number');
  const token = searchParams.get('invite_code');

  const handleNext = async (data: CompanyInfo) => {
    dispatch({ type: 'UPDATE_DATA', payload: data });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handlePrev = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleSubmit = async (data: CompanyInfo) => {
    setLoading(true);

    await fetch('/api/businesses/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(() => {
        toast.success(t('Your business has been successfully validated !'), {
          onAutoClose: () => {
            window.location.href = '/dashboard';
          }
        });
      })
      .catch(() => {
        toast.error(
          t('Oops, there is an error during the validation of your company')
        );
      });
    setLoading(false);
  };

  useEffect(() => {
    if (vat_number) {
      dispatch({
        type: 'UPDATE_DATA',
        payload: {
          ...initialState.data,
          vat_number: vat_number
        }
      });
    }

    if (token) {
      dispatch({
        type: 'UPDATE_DATA',
        payload: {
          ...initialState.data,
          token
        }
      });
      fetch(`/api/businesses/invitation?token=${token}`)
        .then(async (res) => {
          if (res.ok) {
            const result = await res.json();
            const data = result.data;
            console.log(data);
            dispatch({
              type: 'UPDATE_DATA',
              payload: {
                id: data?.id,
                token: token,
                vat_number: data?.vat_number,
                iban_number: data?.iban_number,
                legal_name: data?.legal_name,
                address_legal: data?.address_legal,
                website: data?.website
              }
            });
            setTokenValid(true);
          } else {
            setTokenValid(false);
          }
        })
        .catch(() => {
          setTokenValid(false);
        });
    }
  }, [token, vat_number]);

  if (!tokenValid) {
    return (
      <div className="mx-auto mt-10 max-w-md p-6 text-black">
        <h1 className="text-center text-2xl font-bold">{t('InvalidToken')}</h1>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 500 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
      }}
    >
      <div className="mx-auto mt-10 max-w-md p-6 text-black">
        <img
          src="/assets/img/logo.svg"
          alt="Company Logo"
          className="mx-auto mb-6 h-16 w-16"
        />
        {state.step === 1 && (
          <CompanyVATStep onNext={handleNext} initialData={state.data} />
        )}
        {state.step === 2 && (
          <CompanyInfoStep
            onNext={handleSubmit}
            onPrev={handlePrev}
            initialData={state.data}
            loading={loading}
          />
        )}
      </div>
    </motion.div>
  );
}
