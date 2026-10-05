import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { isDemoMode } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Login() {
  const navigate = useNavigate();

  const {
    loginViaEmailPassword,
    isAuthenticated,
    isLoadingAuth,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const returnTo = safeReturnTo();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate, returnTo]);

  const validateForm = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Vui lòng nhập email.";
    } else if (!isValidEmail(email)) {
      errs.email = "Địa chỉ email không đúng định dạng.";
    }

    if (!password) {
      errs.password = "Vui lòng nhập mật khẩu.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await loginViaEmailPassword(email.trim(), password);
    } catch (err) {
      console.error("Login failed:", err);
      setGeneralError(
        err?.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không chính xác."
          : err?.message || "Đăng nhập thất bại. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Chào mừng quay trở lại"
      subtitle="Đăng nhập để quản lý CV và đối chiếu JD việc làm"
      footer={
        <>
          Bạn chưa có tài khoản?{" "}
          <Link
            to={
              "/register" +
              (returnTo !== "/"
                ? `?returnTo=${encodeURIComponent(returnTo)}`
                : "")
            }
            className="text-primary font-semibold hover:underline"
          >
            Đăng ký ngay
          </Link>
        </>
      }
    >
      {isDemoMode && (
        <Button
          type="button"
          className="w-full h-12 text-sm font-semibold mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm flex items-center justify-center gap-2"
          onClick={async () => {
            setLoading(true);
            setGeneralError("");
            try {
              await loginViaEmailPassword("sinhvien.demo@trolycv.vn", "123456");
            } catch (err) {
              setGeneralError("Đăng nhập demo thất bại.");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          <Sparkles className="w-4 h-4" />
          ✨ Đăng nhập nhanh tài khoản Demo (1-Click)
        </Button>
      )}

      {generalError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email <span className="text-destructive">*</span>
          </Label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tenban@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              className={`pl-10 h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold">
              Mật khẩu <span className="text-destructive">*</span>
            </Label>

            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              className={`pl-10 h-11 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}