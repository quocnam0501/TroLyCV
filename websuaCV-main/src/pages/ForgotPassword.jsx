import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { generateOtpCode, sendResetPasswordEmail } from "@/utils/emailService";
import { toast } from "@/components/ui/use-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const code = generateOtpCode();

    const origin = window.location.origin;
    // Link trong email dẫn đến trang đổi mật khẩu (không truyền mã code vào URL để người dùng tự nhập)
    const resetLink = `${origin}/reset-password?email=${encodeURIComponent(email.trim())}`;

    try {
      // 1. Gửi email thật chứa mã xác nhận 6 số qua SMTP
      await sendResetPasswordEmail({
        toEmail: email.trim(),
        otpCode: code,
        resetLink,
      });

      // 2. Thử kích hoạt qua Supabase Auth nếu có
      try {
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: resetLink,
        });
      } catch {}

      toast({
        title: "Đã gửi email thành công!",
        description: `Mã xác nhận 6 chữ số đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư!`,
      });

      setSent(true);
    } catch (err) {
      console.error("Reset password failed:", err);
      toast({
        variant: "destructive",
        title: "Lỗi gửi email",
        description: err.message || "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Quên mật khẩu"
      subtitle="Chúng tôi sẽ gửi mã xác nhận về email của bạn"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-5 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Đã gửi mã xác nhận!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mã xác nhận 6 chữ số và liên kết đặt lại mật khẩu đã được gửi đến hộp thư:
              <br />
              <strong className="text-slate-800 font-mono text-sm">{email}</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              💡 Lưu ý: Vui lòng kiểm tra cả mục <strong>Thư rác / Spam</strong> nếu chưa thấy trong Hộp thư đến.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`)}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20"
          >
            Nhập mã đặt lại mật khẩu ngay <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
            >
              ← Thử lại với email khác
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Địa chỉ Email của bạn</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="tenban@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 text-sm"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-11 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi mã...
              </>
            ) : (
              "Gửi mã đặt lại mật khẩu"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
