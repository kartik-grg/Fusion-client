import { useState, useCallback } from 'react';

export const useModal = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial);
  const [data, setData]     = useState(null);

  const open  = useCallback((d = null) => { setData(d); setIsOpen(true);  }, []);
  const close = useCallback(()          => { setIsOpen(false); },           []);
  const toggle= useCallback(()          => setIsOpen(v => !v),              []);

  return { isOpen, data, open, close, toggle };
};
