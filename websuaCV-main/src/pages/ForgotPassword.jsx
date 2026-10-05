import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase, isDemoMode } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const origin = window.location.origin.includes('localhost')
        ? window.location.origin.replace(/:([0-9]+)/, ':5180')
        : window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        console.error("Reset password error:", error);
      }
    } catch (err) {
      console.error("Reset password failed:", err);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Reset password"
      subtitle="We'll send you a link to reset it"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground text-center">
            Nếu tài khoản tồn tại với email này, liên kết đặt lại mật khẩu đã được gửi đến hộp thư của bạn.
          </p>
          {isDemoMode && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center space-y-3">
              <p className="text-xs text-indigo-700">
                💡 <strong>Chế độ Demo:</strong> Bạn có thể kiểm tra trực tiếp giao diện đặt lại mật khẩu mới bên dưới:
              </p>
              <Link
                to="/reset-password?demo=true"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                Mở trang Đặt lại mật khẩu ngay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
