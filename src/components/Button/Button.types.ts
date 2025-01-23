import { MouseEventHandler, ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isLight?: boolean;
}
