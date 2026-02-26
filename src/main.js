import Alpine from "alpinejs";
import { createIcons } from "lucide";
import "./styles.css";

window.Alpine = Alpine;
Alpine.start();

document.addEventListener("DOMContentLoaded", () => createIcons());
