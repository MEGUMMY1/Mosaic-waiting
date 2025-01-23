import styles from "./Button.module.scss";
import { ButtonProps } from "./Button.types";

export default function Button({ children, disabled, onClick, isLight = false }: ButtonProps) {
  return (
    <button
      className={isLight ? styles.button2 : styles.button}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
