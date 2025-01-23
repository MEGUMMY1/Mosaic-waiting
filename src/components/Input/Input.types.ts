export interface InputProps {
  placeholder: string;
  label?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  isPW?: boolean;
  isNumber?: boolean;
}
