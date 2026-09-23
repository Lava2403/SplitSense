import {
  ArrowRight,
  CheckCircle2,
  Receipt,
  Users,
  HandCoins,
  BarChart3,
  Scale,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroIllustration from "../assets/heroimage.png";

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Shared groups",
      text: "Create groups for trips, roommates, friends, or everyday expenses.",
    },
    {
      icon: Receipt,
      title: "Simple expense tracking",
      text: "Record who paid, who participated, and how much each person owes.",
    },
    {
      icon: HandCoins,
      title: "Clear settlements",
      text: "See pending balances and record payments when debts are settled.",
    },
    {
      icon: BarChart3,
      title: "Spending insights",
      text: "Keep an eye on your spending patterns and group activity in one place.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: Users,
      title: "Create a group",
      text: "Add the people you regularly share expenses with.",
    },
    {
      number: "02",
      icon: Receipt,
      title: "Add expenses",
      text: "Record the amount, payer, category, and participants.",
    },
    {
      number: "03",
      icon: Scale,
      title: "See the balance",
      text: "SplitSense keeps track of who owes whom.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Settle up",
      text: "Record a payment when an outstanding balance is cleared.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07111F] text-white overflow-x-hidden">

      {/* =====================================================
          GLOBAL BACKGROUND GLOWS
      ===================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        {/* Emerald glow - top center/right */}
        <div
          className="absolute -top-48 left-[45%] w-[650px] h-[650px] rounded-full blur-[140px]"
          style={{
            background: "rgba(16,185,129,0.10)",
          }}
        />

        {/* Pink glow - right */}
        <div
          className="absolute top-[100px] -right-40 w-[520px] h-[650px] rounded-full blur-[150px]"
          style={{
            background: "rgba(236,72,153,0.20)",
          }}
        />

        {/* Purple glow - bottom left */}
        <div
          className="absolute bottom-[500px] -left-60 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{
            background: "rgba(139,92,246,0.12)",
          }}
        />

        {/* Emerald bottom glow */}
        <div
          className="absolute bottom-0 left-[5%] w-[500px] h-[300px] rounded-full blur-[140px]"
          style={{
            background: "rgba(16,185,129,0.10)",
          }}
        />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="relative z-20 border-b border-white/10 bg-[#07111F]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold tracking-wide text-emerald-400 hover:text-emerald-300 transition"
          >
            SplitSense
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-sm text-slate-300">
            <a
              href="#features"
              className="hover:text-emerald-400 transition"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="hover:text-emerald-400 transition"
            >
              How it works
            </a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Sign in
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-lg shadow-emerald-500/20"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <main className="relative z-10">

        <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-20">

          {/* Extra pink glow behind illustration */}
          <div
            className="absolute right-[-120px] top-[40px] w-[480px] h-[480px] rounded-full blur-[130px] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(236,72,153,0.20), rgba(168,85,247,0.08), transparent 70%)",
            }}
          />

          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* ---------------- LEFT ---------------- */}
            <div className="relative z-10">

              {/* Badge */}
              <div
                className="
                  inline-flex items-center gap-2
                  text-sm font-medium
                  text-emerald-300
                  bg-emerald-500/10
                  border border-emerald-400/20
                  px-3.5 py-2
                  rounded-full
                  shadow-[0_0_20px_rgba(16,185,129,0.08)]
                "
              >
                <CheckCircle2 size={15} />
                Split expenses, simplify life
              </div>

              {/* Heading */}
              <h1 className="mt-7 text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-white">
                Know exactly{" "}
                <span className="text-emerald-400">
                  who owes whom.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-7 text-lg leading-8 text-slate-300 max-w-xl">
                SplitSense keeps group expenses, balances, and settlements
                together so you can spend time with people instead of
                calculating who owes what.
              </p>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap gap-3">

                <button
                  onClick={() => navigate("/signup")}
                  className="
                    inline-flex items-center gap-2
                    bg-emerald-600
                    hover:bg-emerald-500
                    text-white
                    px-5 py-3
                    rounded-lg
                    font-semibold
                    transition
                    shadow-lg
                    shadow-emerald-500/20
                  "
                >
                  Get started
                  <ArrowRight size={18} />
                </button>

                <a
                  href="#how-it-works"
                  className="
                    inline-flex items-center
                    px-5 py-3
                    rounded-lg
                    border border-slate-600
                    bg-white/[0.02]
                    text-slate-200
                    font-medium
                    hover:border-emerald-400/60
                    hover:text-white
                    transition
                  "
                >
                  See how it works
                </a>
              </div>

              {/* Quick features */}
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-slate-300">

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/10 flex items-center justify-center">
                    <Users size={16} className="text-emerald-400" />
                  </div>
                  Create groups
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/10 flex items-center justify-center">
                    <Receipt size={16} className="text-emerald-400" />
                  </div>
                  Add expenses
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/10 flex items-center justify-center">
                    <BarChart3 size={16} className="text-emerald-400" />
                  </div>
                  Track & settle
                </div>

              </div>
            </div>

            {/* ---------------- RIGHT / ILLUSTRATION ---------------- */}
            <div className="relative flex items-center justify-center min-h-[460px]">

              {/* Emerald glow behind illustration */}
              <div
                className="absolute w-[430px] h-[430px] rounded-full blur-[90px]"
                style={{
                  background: "rgba(16,185,129,0.13)",
                }}
              />

              {/* Illustration */}
              <img
                src={heroIllustration}
                alt="Shared expenses illustration"
                className="
                  relative
                  z-10
                  w-full
                  max-w-[570px]
                  object-contain
                  drop-shadow-[0_20px_45px_rgba(0,0,0,0.35)]
                "
              />

            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ===================================================== */}
        <section
          id="features"
          className="relative border-y border-white/10 bg-[#091527]/70"
        >

          <div className="max-w-6xl mx-auto px-6 py-20">

            {/* Section heading */}
            <div className="text-center max-w-2xl mx-auto">

              <p
                className="
                  inline-flex
                  text-xs
                  font-semibold
                  text-emerald-300
                  uppercase
                  tracking-[0.18em]
                  bg-emerald-500/10
                  border border-emerald-400/10
                  px-3 py-1.5
                  rounded-full
                "
              >
                Everything in one place
              </p>

              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
                Built for everyday shared expenses
              </h2>

              <p className="mt-3 text-slate-400">
                Keep the useful parts of expense splitting simple and easy
                to understand.
              </p>

            </div>

            {/* Feature cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">

              {features.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="
                    group
                    border border-white/10
                    rounded-xl
                    p-5
                    bg-white/[0.035]
                    hover:bg-white/[0.06]
                    hover:border-emerald-400/25
                    transition-all
                    duration-300
                  "
                >

                  <div
                    className="
                      w-11 h-11
                      rounded-lg
                      bg-emerald-500/10
                      border border-emerald-400/10
                      text-emerald-400
                      flex items-center justify-center
                      group-hover:bg-emerald-500/15
                      transition
                    "
                  >
                    <Icon size={21} />
                  </div>

                  <h3 className="font-semibold text-lg mt-5 text-white">
                    {title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-6 mt-2">
                    {text}
                  </p>

                </div>
              ))}

            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}
        <section
          id="how-it-works"
          className="relative max-w-6xl mx-auto px-6 py-24"
        >

          <div className="text-center">

            <p
              className="
                inline-flex
                text-xs
                font-semibold
                text-emerald-300
                uppercase
                tracking-[0.18em]
                bg-emerald-500/10
                border border-emerald-400/10
                px-3 py-1.5
                rounded-full
              "
            >
              How it works
            </p>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
              From expense to settlement in a few steps
            </h2>

          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-8 mt-14">

            {steps.map(
              ({ number, icon: Icon, title, text }, index) => (
                <div
                  key={number}
                  className="relative"
                >

                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <div
                      className="
                        hidden md:block
                        absolute
                        top-7
                        left-[65px]
                        right-[-35px]
                        border-t
                        border-dashed
                        border-emerald-500/30
                      "
                    />
                  )}

                  {/* Icon */}
                  <div
                    className="
                      relative z-10
                      w-14 h-14
                      rounded-xl
                      bg-emerald-500/10
                      border border-emerald-400/20
                      text-emerald-400
                      flex items-center justify-center
                      shadow-[0_0_25px_rgba(16,185,129,0.08)]
                    "
                  >
                    <Icon size={23} />
                  </div>

                  <p className="mt-5 text-emerald-400 text-xl font-bold">
                    {number}
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400 leading-6">
                    {text}
                  </p>

                </div>
              )
            )}

          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}
        <section className="relative max-w-6xl mx-auto px-6 pb-20">

          {/* Glow */}
          <div
            className="
              absolute
              inset-x-20
              bottom-5
              h-32
              rounded-full
              blur-[90px]
              pointer-events-none
            "
            style={{
              background:
                "linear-gradient(90deg, rgba(16,185,129,0.25), rgba(168,85,247,0.20), rgba(236,72,153,0.25))",
            }}
          />

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border border-emerald-400/30
              bg-white/[0.035]
              px-8 py-10
              md:px-10
              flex flex-col md:flex-row
              md:items-center
              justify-between
              gap-7
            "
          >

            {/* Subtle inner glow */}
            <div
              className="
                absolute
                -right-20
                -bottom-40
                w-80
                h-80
                rounded-full
                blur-[100px]
                pointer-events-none
              "
              style={{
                background: "rgba(236,72,153,0.18)",
              }}
            />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white">
                Ready to split expenses?
              </h2>

              <p className="text-slate-400 mt-2">
                Create your first group and start keeping track.
              </p>
            </div>

            <button
              onClick={() => navigate("/signup")}
              className="
                relative z-10
                inline-flex
                items-center
                justify-center
                gap-2
                bg-emerald-600
                hover:bg-emerald-500
                px-6 py-3
                rounded-lg
                font-semibold
                text-white
                transition
                shadow-lg
                shadow-emerald-500/20
              "
            >
              Create an account
              <ArrowRight size={18} />
            </button>

          </div>
        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-white/10 bg-[#050D19]">

        <div className="max-w-6xl mx-auto px-6 py-7">

          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="text-lg font-bold text-emerald-400"
            >
              SplitSense
            </button>

            {/* Links */}
            <div className="flex items-center gap-7 text-sm text-slate-400">

              <a
                href="#features"
                className="hover:text-white transition"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="hover:text-white transition"
              >
                How it works
              </a>

              <button
                onClick={() => navigate("/login")}
                className="hover:text-white transition"
              >
                Sign in
              </button>

            </div>

            <p className="text-sm text-slate-500">
              Made for better sharing <span className="text-pink-400">♥</span>
            </p>

          </div>

        </div>
      </footer>

    </div>
  );
}

export default LandingPage;