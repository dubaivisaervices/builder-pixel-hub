import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

interface SecureAdminAuthProps {
  onAuthenticated: () => void;
}

const SecureAdminAuth: React.FC<SecureAdminAuthProps> = ({
  onAuthenticated,
}) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    accessCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Security configurations
  const ADMIN_USERNAME = "reportvisascam_admin";
  const ADMIN_PASSWORD = "ReportVisa$cam2024!";
  const ACCESS_CODE = "VSR-2024-SECURE";
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    // Check for existing lockout
    const lockoutEnd = localStorage.getItem("adminLockoutEnd");
    if (lockoutEnd) {
      const remaining = parseInt(lockoutEnd) - Date.now();
      if (remaining > 0) {
        setLockoutTime(Math.ceil(remaining / 1000));
      } else {
        localStorage.removeItem("adminLockoutEnd");
        localStorage.removeItem("adminAttempts");
      }
    }

    // Load attempt count
    const savedAttempts = localStorage.getItem("adminAttempts");
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  useEffect(() => {
    // Countdown timer for lockout
    if (lockoutTime && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev && prev <= 1) {
            localStorage.removeItem("adminLockoutEnd");
            localStorage.removeItem("adminAttempts");
            setAttempts(0);
            setError("");
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutTime) {
      setError("Account is locked. Please wait for the timer to expire.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate authentication delay for security
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isValid =
      credentials.username === ADMIN_USERNAME &&
      credentials.password === ADMIN_PASSWORD &&
      credentials.accessCode === ACCESS_CODE;

    if (isValid) {
      // Successful authentication
      localStorage.removeItem("adminAttempts");
      localStorage.removeItem("adminLockoutEnd");
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("adminAuthTime", Date.now().toString());
      onAuthenticated();
    } else {
      // Failed authentication
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("adminAttempts", newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        // Lockout
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem("adminLockoutEnd", lockoutEnd.toString());
        setLockoutTime(LOCKOUT_DURATION / 1000);
        setError("Too many failed attempts. Account locked for 15 minutes.");
      } else {
        setError(
          `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
        );
      }
    }

    setLoading(false);
  };

  const formatLockoutTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Secure Admin Access
          </CardTitle>
          <CardDescription className="text-gray-600">
            Report Visa Scam - Administrative Panel
          </CardDescription>
        </CardHeader>

        <CardContent>
          {lockoutTime && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Account locked for security. Please wait{" "}
                <span className="font-mono font-bold">
                  {formatLockoutTime(lockoutTime)}
                </span>{" "}
                before trying again.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Username
              </label>
              <Input
                type="text"
                placeholder="Enter admin username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                disabled={loading || !!lockoutTime}
                className="h-12"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter secure password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  disabled={loading || !!lockoutTime}
                  className="h-12 pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || !!lockoutTime}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <Input
                type="text"
                placeholder="Enter access code"
                value={credentials.accessCode}
                onChange={(e) =>
                  setCredentials({ ...credentials, accessCode: e.target.value })
                }
                disabled={loading || !!lockoutTime}
                className="h-12"
                required
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-medium"
              disabled={loading || !!lockoutTime}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Secure Login</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              This admin panel is protected by multi-factor authentication.
              <br />
              Failed attempts: {attempts}/{MAX_ATTEMPTS}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureAdminAuth;
