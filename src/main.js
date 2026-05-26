import { createIcons, Compass, Layers3, Play, ScanLine, SquarePlay, Waves } from "lucide";
import "./styles.css";

createIcons({
  icons: {
    Compass,
    Layers3,
    Play,
    ScanLine,
    SquarePlay,
    Waves,
  },
});

const header = document.querySelector("[data-header]");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
