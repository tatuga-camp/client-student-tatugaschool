type Props = {
  emoji: string;
  text: string;
};

function SubjectEmptyState({ emoji, text }: Props) {
  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-gray-200 bg-white/60 px-6 py-12 text-center font-Anuphan">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <p className="text-base font-semibold text-gray-500">{text}</p>
    </div>
  );
}

export default SubjectEmptyState;
