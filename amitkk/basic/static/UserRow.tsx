import { UserRowProps } from "../types/user";

type UserRowWithLabelProps = {
  row?: Partial<UserRowProps> | string;
  label?: string;
};

export default function UserRow({ row, label }: UserRowWithLabelProps) {
  if (!row || typeof row === "string") return null; 
  const subText = [row.email, row.phone].filter(Boolean).join(" || ");

  return (
    <div style={{ marginBottom: "6px" }}>
      {label && <strong>{label}: </strong>}
      {row.name}
      {subText && (
        <>
          <br />
          <small className="text-muted">{subText}</small>
        </>
      )}
    </div>
  );
}