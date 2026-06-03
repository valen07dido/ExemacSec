import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Catálogo de Productos | EXEMAC",
  description: "Explore nuestro catálogo completo de equipos de seguridad y protección industrial (EPP, Calzado, Ropa, Cartelería) y solicite presupuesto de forma rápida por WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
