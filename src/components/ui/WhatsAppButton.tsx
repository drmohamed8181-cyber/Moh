"use client";

const WHATSAPP_NUMBER = "19293498569"; // +1 929-349-8569
const DEFAULT_MESSAGE = "Hi! I'm interested in your medical equipment products.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 animate-[pulse_2.5s_ease-in-out_infinite]"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M16.004 0C7.164 0 0 7.163 0 16.001c0 2.822.741 5.556 2.147 7.966L0 32l8.245-2.109a15.94 15.94 0 0 0 7.759 1.977h.006c8.839 0 16.003-7.163 16.003-16.001C32.013 7.163 24.848 0 16.004 0Zm0 29.278a13.24 13.24 0 0 1-6.752-1.85l-.484-.288-4.895 1.252 1.307-4.771-.315-.489a13.223 13.223 0 0 1-2.03-7.13c0-7.318 5.954-13.271 13.274-13.271 3.546 0 6.878 1.382 9.386 3.891a13.176 13.176 0 0 1 3.884 9.384c-.003 7.319-5.957 13.272-13.375 13.272Zm7.282-9.933c-.399-.2-2.361-1.166-2.727-1.299-.366-.133-.632-.2-.898.2-.266.399-1.032 1.299-1.265 1.565-.233.266-.465.299-.864.1-.399-.2-1.685-.621-3.21-1.98-1.187-1.058-1.988-2.366-2.221-2.765-.233-.399-.025-.615.175-.814.18-.179.399-.465.599-.698.2-.233.266-.399.399-.665.133-.266.067-.499-.033-.698-.1-.2-.898-2.163-1.23-2.962-.324-.778-.653-.673-.898-.685-.233-.011-.499-.013-.765-.013-.266 0-.698.1-1.064.499-.366.399-1.397 1.365-1.397 3.328s1.43 3.86 1.63 4.126c.2.266 2.816 4.301 6.822 6.032.953.411 1.697.657 2.277.841.957.304 1.828.261 2.516.158.767-.115 2.361-.966 2.694-1.898.333-.932.333-1.731.233-1.898-.1-.166-.366-.266-.765-.465Z"/>
      </svg>
    </a>
  );
}
