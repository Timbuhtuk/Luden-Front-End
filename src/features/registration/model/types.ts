export interface RegistrationFormData {
  email: string;
  password: string;
  name?: string;
}

export interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void;
  isLoading?: boolean;
  error?: string;
}

