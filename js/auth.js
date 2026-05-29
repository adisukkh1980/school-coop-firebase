(function () {
  const demoUsers = [
    { userId: "UADMIN", name: "ผู้ดูแลระบบ", username: "admin", password: "123456", role: "admin", status: "active" },
    { userId: "UTEACHER", name: "ครูผู้ดูแล", username: "teacher", password: "123456", role: "teacher", status: "active" },
    { userId: "UCASHIER", name: "พนักงานขาย", username: "cashier", password: "123456", role: "cashier", status: "active" },
    { userId: "UMEMBER", name: "สมาชิก", username: "member", password: "123456", role: "member", status: "future" }
  ];

  function publicUser(user) {
    return {
      userId: user.userId,
      name: user.name,
      username: user.username,
      role: user.role,
      status: user.status
    };
  }

  window.authService = {
    async login(username, password) {
      window.initializeFirebaseApp();

      const user = demoUsers.find((item) => item.username === username && item.password === password);
      if (!user) {
        return { success: false, message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" };
      }

      if (user.status !== "active" && user.role !== "member") {
        return { success: false, message: "ผู้ใช้งานนี้ยังไม่พร้อมใช้งาน" };
      }

      const signedInUser = publicUser(user);
      sessionStorage.setItem("coopCurrentUser", JSON.stringify(signedInUser));
      return { success: true, data: signedInUser };
    },

    getCurrentUser() {
      try {
        const raw = sessionStorage.getItem("coopCurrentUser");
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        sessionStorage.removeItem("coopCurrentUser");
        return null;
      }
    },

    logout() {
      sessionStorage.removeItem("coopCurrentUser");
    }
  };
})();
