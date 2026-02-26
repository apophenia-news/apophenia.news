import Alpine from "alpinejs";
import { createIcons, icons } from "lucide";
import "./styles.css";

window.Alpine = Alpine;
Alpine.start();

const bootIcons = () => createIcons({ icons });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootIcons);
} else {
  bootIcons();
}
