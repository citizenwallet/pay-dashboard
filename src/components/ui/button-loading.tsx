import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import React from 'react';
import { type ButtonProps as OriginalButtonProps } from '@/components/ui/button';

interface ExtendedButtonProps extends OriginalButtonProps {
  loading?: boolean;
}

export const ButtonLoading: React.FC<ExtendedButtonProps> = (props) => {
  return (
    <>
      {props.loading ? (
        <Button disabled {...props}>
          <Loader2 className="animate-spin" />
          {props.children}
        </Button>
      ) : (
        <Button>{props.children}</Button>
      )}
    </>
  );
};
