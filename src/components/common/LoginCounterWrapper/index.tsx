"use client";
import React, { useEffect } from "react";

import { decrementCounter } from "@/store/auth/auth.slice";
import useAppSelector from "@/hooks/useSelector";
import useAppDispatch from "@/hooks/useDispatch";

const LoginCounterWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { disableLoginForOneMinute, counter } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (disableLoginForOneMinute && counter > 0) {
      timer = setInterval(() => {
        dispatch(decrementCounter());
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [disableLoginForOneMinute, counter, dispatch]);

  return <>{children}</>;
};

export default LoginCounterWrapper;
