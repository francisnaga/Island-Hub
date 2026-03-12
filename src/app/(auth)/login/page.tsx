import Link from "next/link"
import { Anchor } from "lucide-react"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy text-white selection:bg-gold selection:text-navy p-4 relative overflow-hidden">
      {/* Background abstract */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[600px] w-[600px] rounded-full bg-ocean blur-[120px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-[600px] w-[600px] rounded-full bg-blue-900 blur-[120px] opacity-30 mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="mb-10 flex flex-col items-center">
          <Link href="/" className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean to-blue-900 shadow-[0_0_20px_rgba(23,42,69,0.8)] border border-white/10 hover:scale-105 transition-transform">
            <Anchor className="h-7 w-7 text-gold" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-white/60 font-light text-center">Enter your details to sign in to IslandHub</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0A111F]/80 p-8 backdrop-blur-xl shadow-2xl">
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-white/80 ml-1">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="student@university.edu"
                required
                className="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-white placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <Link href="#" className="text-xs text-gold hover:underline">Forgot password?</Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-white placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>

            <Button type="submit" formAction={login} className="mt-2 h-12 w-full rounded-xl bg-gold text-navy font-bold text-lg transition-all hover:bg-gold/90 hover:shadow-[0_0_15px_rgba(255,215,0,0.4)]">
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-white/60">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-white hover:text-gold transition-colors underline underline-offset-4">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
