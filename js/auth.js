import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { auth, db, isFirebaseConfigured } from "./firebase-config.js";

const USER_COLLECTION = "users";

function buildUser(authUser, profile) {
  return {
    uid: authUser.uid,
    email: authUser.email,
    name: profile.name || profile.displayName || authUser.email,
    role: profile.role || "member",
    status: profile.status || "inactive"
  };
}

function authMessage(error) {
  const code = error?.code || "";

  if (code === "auth/invalid-email") return "รูปแบบอีเมลไม่ถูกต้อง";
  if (code === "auth/user-disabled") return "ผู้ใช้งานนี้ถูกปิดใช้งาน";
  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }
  if (code === "permission-denied") return "ไม่มีสิทธิ์อ่านข้อมูลผู้ใช้";

  return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง";
}

async function loadUserProfile(authUser, updateLastLogin) {
  const userRef = doc(db, USER_COLLECTION, authUser.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await signOut(auth);
    return { success: false, message: "ไม่พบข้อมูลผู้ใช้ในระบบ" };
  }

  const profile = snapshot.data();
  if (profile.status !== "active") {
    await signOut(auth);
    return { success: false, message: "ผู้ใช้งานนี้ถูกปิดใช้งาน" };
  }

  if (updateLastLogin) {
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
  }

  return { success: true, data: buildUser(authUser, profile) };
}

function waitForAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export const authService = {
  async login(email, password) {
    if (!isFirebaseConfigured()) {
      return { success: false, message: "กรุณาใส่ค่า Firebase Config ก่อนใช้งาน" };
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return await loadUserProfile(credential.user, true);
    } catch (error) {
      return { success: false, message: authMessage(error) };
    }
  },

  async getCurrentUser() {
    if (!isFirebaseConfigured()) return null;

    const authUser = await waitForAuthUser();
    if (!authUser) return null;

    const result = await loadUserProfile(authUser, false);
    return result.success ? result.data : null;
  },

  async logout() {
    await signOut(auth);
  }
};
