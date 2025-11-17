export interface PasswordRecoveryFormData {
  email: string;
}

export interface PasswordRecoveryFormProps {
  onSubmit: (data: PasswordRecoveryFormData) => void;
  isLoading?: boolean;
  error?: string;
}

