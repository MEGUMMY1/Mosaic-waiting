import styles from "./Input.module.scss";
import { InputProps } from "./Input.types";

export default function Input({
  placeholder,
  label,
  value,
  onChange,
  isPW = false,
  isNumber = false,
}: InputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);
  };
  const inputType = isPW ? "password" : isNumber ? "number" : "text";

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor="label">
          {label}
        </label>
      )}
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          placeholder={placeholder}
          value={value || ""}
          onChange={handleChange}
          id="label"
          type={inputType}
        />
      </div>
    </div>
  );
}
