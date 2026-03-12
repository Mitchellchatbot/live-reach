import careAssistLogo from "@/assets/care-assist-logo.png";

const Marketing4 = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, hsl(24 95% 53%) 0%, hsl(24 95% 38%) 60%, hsl(24 90% 22%) 100%)",
      }}
    >
      {/* Soft glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 45%, hsl(24 100% 65% / 0.35) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
        {/* Logo */}
        <img
          src={careAssistLogo}
          alt="Care Assist"
          className="h-14 mb-12 brightness-0 invert"
        />

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight" style={{ color: "white" }}>
          Providing care and connection 24/7,
          <br />
          <span className="opacity-90">because no one should wait for help.</span>
        </h1>

        {/* CTA Button */}
        <a
          href="/get-started"
          className="mt-12 inline-flex items-center justify-center rounded-full px-10 py-4 text-lg font-bold transition-transform hover:scale-105"
          style={{
            backgroundColor: "white",
            color: "hsl(24, 95%, 53%)",
          }}
        >
          Get Your Free Trial Today
        </a>
      </div>
    </div>
  );
};

export default Marketing4;
