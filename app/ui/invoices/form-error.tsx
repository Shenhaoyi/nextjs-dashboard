'use client';

export default function FormError({
  id,
  errorList,
}: {
  id: string;
  errorList: string[] | undefined;
}) {
  return (
    <div id={id} aria-live="polite" aria-atomic="true">
      {errorList &&
        errorList.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
    </div>
  );
}
