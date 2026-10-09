type Props = {
  text: string;
};

function SubjectEmptyState({ text }: Props) {
  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-gray-200 bg-white/60 px-6 py-12 text-center font-Anuphan">
      <p className="text-base font-semibold text-gray-500">{text}</p>
    </div>
  );
}

export default SubjectEmptyState;
