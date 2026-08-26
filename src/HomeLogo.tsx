interface Props {
  active: string;
  setActive: React.Dispatch<React.SetStateAction<string>>;
}

export default function HomeLogo({ active, setActive }: Props) {
  return (
    <button
      onClick={() => (active !== "Home" ? setActive("Home") : null)}
      className="mt-1 cursor-pointer relative rounded-lg sm:rounded-2xl transition-colors px-1.5 py-1.5 hover:bg-orange-500/10 active:scale-95"
    >
      <img src="/BasketballAI_Logo.png" alt="Home Page" className="w-14 sm:w-16 lg:w-20 h-14 sm:h-16 lg:h-20" />
    </button>
  );
}
