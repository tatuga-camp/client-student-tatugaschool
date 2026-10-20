export function nameEditError(name: {
  title: string;
  firstName: string;
  lastName: string;
}): "required" | null {
  const blank = [name.title, name.firstName, name.lastName].some(
    (value) => value.trim() === "",
  );
  return blank ? "required" : null;
}

export function passwordChangeError(
  password: string,
  confirm: string,
): "required" | "mismatch" | null {
  if (password === "") return "required";
  if (password !== confirm) return "mismatch";
  return null;
}
