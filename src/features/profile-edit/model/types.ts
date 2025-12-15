export interface EditProfileFormData {
  username?: string;
  email?: string;
  avatar?: File;
}

export interface EditProfileFormProps {
  onSubmit: (data: EditProfileFormData) => void;
  isLoading?: boolean;
  error?: string;
  initialData?: {
    username?: string;
    email?: string;
    avatarUrl?: string;
  };
}

