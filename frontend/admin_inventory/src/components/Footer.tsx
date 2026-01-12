interface FooterProps {
  collapsed: boolean;
}

export default function Footer({ collapsed }: FooterProps) {
  return (
    <footer className={`bg-[#461E96] border-t border-[#3a1880] py-4 px-6 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/80">
        <a href="#" className="hover:text-white transition-colors">Help</a>
        <span className="text-white/30">|</span>
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <span className="text-white/30">|</span>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
      </div>
    </footer>
  );
}