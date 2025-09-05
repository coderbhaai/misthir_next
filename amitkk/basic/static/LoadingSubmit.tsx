import { LoadingButton } from "@mui/lab";

interface SubmitButtonProps {
  title: string;
  loading: boolean;
}

export function SubmitButton({ title, loading }: SubmitButtonProps) {
  return (
    <LoadingButton type="submit" variant="contained" color="primary" loading={loading} disabled={loading}>{title}</LoadingButton>
  );
}
