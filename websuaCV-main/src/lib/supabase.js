import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Chế độ Demo/Mock kích hoạt khi chưa có URL & Key của Supabase hoặc chứa chữ placeholder
const isDemoMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes("placeholder") ||
  supabaseUrl.includes("your-project");

if (isDemoMode) {
  console.info(
    "%c[Chế độ Local Mock Đang Hoạt Động]%c Chưa phát hiện VITE_SUPABASE_URL. " +
      "Hệ thống đang lưu trữ tài khoản độc lập trên trình duyệt. Bạn có thể đăng ký tài khoản mới " +
      "(xác thực mã 123456) hoặc bấm đăng nhập 1-Click tài khoản Demo.",
    "color: #4f46e5; font-weight: bold;",
    "color: inherit;"
  );
}

const DEMO_STORAGE_KEY = "trolycv_demo_session";
const MOCK_USERS_KEY = "trolycv_mock_registered_users";

function getStoredDemoUser() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredDemoUser(user) {
  if (user) {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  }
}

function getMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMockUser(userData) {
  const users = getMockUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...userData };
  } else {
    users.push(userData);
  }
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

// Client Mock tương tác đầy đủ, lưu trữ người dùng riêng biệt trên trình duyệt
function createInteractiveMockClient() {
  const listeners = new Set();

  const notify = (event, session) => {
    listeners.forEach((cb) => {
      try {
        cb(event, session);
      } catch (err) {
        console.error("Auth listener error:", err);
      }
    });
  };

  return {
    auth: {
      getSession: async () => {
        const user = getStoredDemoUser();
        return {
          data: {
            session: user ? { user, access_token: "mock_access_token_" + user.id } : null,
          },
          error: null,
        };
      },
      getUser: async () => {
        const user = getStoredDemoUser();
        return { data: { user }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const cleanEmail = (email || "").trim().toLowerCase();

        // Tài khoản demo mặc định
        if (cleanEmail === "sinhvien.demo@trolycv.vn") {
          const user = {
            id: "demo-user-001",
            email: "sinhvien.demo@trolycv.vn",
            user_metadata: { full_name: "Nguyễn Văn An" },
            created_at: new Date().toISOString(),
          };
          setStoredDemoUser(user);
          const session = { user, access_token: "demo_token_xyz" };
          notify("SIGNED_IN", session);
          return { data: { user, session }, error: null };
        }

        // Tìm trong danh sách tài khoản đã đăng ký trên máy
        const users = getMockUsers();
        const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

        if (found) {
          if (password && found.password && found.password !== password) {
            return {
              data: { user: null, session: null },
              error: { message: "Mật khẩu không chính xác. Vui lòng thử lại!" },
            };
          }
          const user = {
            id: found.id,
            email: found.email,
            user_metadata: { full_name: found.fullName || found.email.split("@")[0] },
            created_at: found.created_at || new Date().toISOString(),
          };
          setStoredDemoUser(user);
          const session = { user, access_token: "mock_token_" + found.id };
          notify("SIGNED_IN", session);
          return { data: { user, session }, error: null };
        }

        // Nếu chưa đăng ký mà vẫn muốn đăng nhập nhanh
        const newUser = {
          id: `user_${Date.now()}`,
          email: cleanEmail,
          user_metadata: { full_name: cleanEmail.split("@")[0] },
          created_at: new Date().toISOString(),
        };
        saveMockUser({
          id: newUser.id,
          email: cleanEmail,
          password: password || "123456",
          fullName: cleanEmail.split("@")[0],
          created_at: newUser.created_at,
        });
        setStoredDemoUser(newUser);
        const session = { user: newUser, access_token: "mock_token_" + newUser.id };
        notify("SIGNED_IN", session);
        return { data: { user: newUser, session }, error: null };
      },
      signUp: async ({ email, password, options }) => {
        const cleanEmail = (email || "").trim().toLowerCase();
        const fullName =
          options?.data?.full_name ||
          options?.data?.fullName ||
          cleanEmail.split("@")[0];

        const newUser = {
          id: `user_${Date.now()}`,
          email: cleanEmail,
          password: password,
          fullName: fullName,
          created_at: new Date().toISOString(),
        };

        // Lưu tạm vào danh sách đăng ký
        saveMockUser(newUser);

        const userPayload = {
          id: newUser.id,
          email: cleanEmail,
          user_metadata: { full_name: fullName },
          created_at: newUser.created_at,
        };

        console.info(
          `%c[Đăng ký Mock]%c Tạo tài khoản thành công cho ${cleanEmail}. Mã OTP xác thực là: 123456`,
          "color: #10b981; font-weight: bold;",
          "color: inherit;"
        );

        return { data: { user: userPayload, session: null }, error: null };
      },
      verifyOtp: async ({ email, token }) => {
        if (!token || token.length !== 6) {
          return {
            data: null,
            error: { message: "Mã xác thực phải gồm đúng 6 chữ số." },
          };
        }

        const cleanEmail = (email || "").trim().toLowerCase();
        const users = getMockUsers();
        const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

        const fullName = existing?.fullName || cleanEmail.split("@")[0] || "Người dùng";
        const userId = existing?.id || `user_${Date.now()}`;

        const user = {
          id: userId,
          email: cleanEmail,
          user_metadata: { full_name: fullName },
          created_at: existing?.created_at || new Date().toISOString(),
        };

        setStoredDemoUser(user);
        const session = { user, access_token: "mock_token_" + userId };
        notify("SIGNED_IN", session);

        return { data: { user, session }, error: null };
      },
      resend: async ({ email }) => {
        console.info(`[Mock] Gửi lại mã OTP tới ${email}. Mã xác thực là: 123456`);
        return { data: {}, error: null };
      },
      resetPasswordForEmail: async (email) => {
        console.info(`[Mock] Yêu cầu đặt lại mật khẩu cho ${email}.`);
        return { data: {}, error: null };
      },
      updateUser: async (attributes) => {
        const current = getStoredDemoUser();
        if (!current) return { data: null, error: { message: "Chưa đăng nhập" } };

        const updated = {
          ...current,
          user_metadata: {
            ...current.user_metadata,
            ...(attributes?.data || {}),
          },
        };
        setStoredDemoUser(updated);
        notify("USER_UPDATED", { user: updated });
        return { data: { user: updated }, error: null };
      },
      signOut: async () => {
        setStoredDemoUser(null);
        notify("SIGNED_OUT", null);
        return { error: null };
      },
      signInWithOAuth: async ({ provider }) => {
        const user = {
          id: `oauth_${Date.now()}`,
          email: "google.user@example.com",
          user_metadata: { full_name: "Google User" },
        };
        setStoredDemoUser(user);
        const session = { user, access_token: "mock_oauth_token" };
        notify("SIGNED_IN", session);
        return { data: { provider, url: null }, error: null };
      },
      onAuthStateChange: (callback) => {
        listeners.add(callback);
        const user = getStoredDemoUser();
        if (user) {
          setTimeout(() => callback("SIGNED_IN", { user, access_token: "mock_token_" + user.id }), 0);
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners.delete(callback);
              },
            },
          },
        };
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          execute: async () => ({ data: [], error: null }),
        }),
      }),
    }),
  };
}

export const supabase = isDemoMode
  ? createInteractiveMockClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

export { isDemoMode };