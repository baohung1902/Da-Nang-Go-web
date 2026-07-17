import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import {
  Home,
  Compass,
  Users,
  MapPin,
  Star,
  Heart,
  MessageCircle,
  Send,
  Plus,
  X,
  Clock,
  ChevronRight,
  Shield,
  Map as MapIcon,
  Loader2,
  User,
  Phone,
  Edit3, Trash2,
  Save,
  Camera,
  Tag,
  Hotel,
  Plane,
  Ticket,
  Gift,
  AlertTriangle,
  PhoneCall,
  BadgeCheck,
  Megaphone,
  Image,
  Navigation,
  CheckCircle2,
  ShoppingBag,
  Utensils,
  Coffee,
  TrendingUp,
  Award,
  Info,
  ExternalLink,
  Search,
  LogOut,
  Trophy,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import {
  db,
  auth,
  googleProvider,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  firebaseUpdateProfile,
} from "./firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc, deleteDoc, arrayRemove,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Chatbot from "./Chatbot";

// Custom Dragon Bridge SVG Icon for Da Nang branding
export function DragonBridgeIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Water Waves */}
      <path d="M8 50 C 16 48, 20 52, 28 50 C 36 48, 40 52, 48 50 C 56 48, 60 52, 64 50" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M0 54 C 8 52, 12 56, 20 54 C 28 52, 32 56, 40 54 C 48 52, 52 56, 60 54" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      
      {/* Bridge Deck */}
      <line x1="4" y1="42" x2="60" y2="42" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      
      {/* Dragon Body (Golden arches) */}
      <path d="M12 42 Q 19 16, 26 42 Q 33 16, 40 42 Q 47 16, 54 42" fill="none" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Dragon Head (Facing right, looking up slightly) */}
      <path d="M54 42 L 56 32 L 62 33 L 63 38 L 61 43 Z" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Dragon Fire/Horn details */}
      <path d="M56 32 Q 54 28, 51 30" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M62 33 Q 65 30, 68 31" fill="none" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Dragon Eye */}
      <circle cx="58.5" cy="35.5" r="0.8" fill="#ef4444" />
    </svg>
  );
}


/* ══════════════════════════════════════════════════════════
   § 1 — CONSTANTS
══════════════════════════════════════════════════════════ */
const INITIAL_LOCATIONS = [
  {
    id: 1,
    title: "Bãi biển Mỹ Khê",
    location: "Sơn Trà, Đà Nẵng",
    category: "Attractions",
    rating: "4.8",
    distance: "2.1 km",
    imgUrl:
      "https://mia.vn/media/uploads/blog-du-lich/bai-bien-my-khe-da-nang-lang-nguoi-ngam-nhin-1-trong-6-bai-bien-dep-nhat-hanh-tinh-01-1636298582.jpeg",
    description:
      "Một trong sáu bãi biển quyến rũ nhất hành tinh với bãi cát trắng mịn trải dài, sóng biển ôn hòa và làn nước ấm quanh năm.",
  },
  {
    id: 2,
    title: "Cầu Vàng (Bà Nà Hills)",
    location: "Hòa Vang, Đà Nẵng",
    category: "Attractions",
    rating: "4.9",
    distance: "25 km",
    imgUrl:
      "https://s3.ap-southeast-1.amazonaws.com/vintrip.bucket/ecom-blogs/2b0286fb-2096-40a4-ab72-4dfe397ed6cf-gioi-thieu-cau-vang.webp",
    description:
      "Cây cầu đi bộ độc đáo được nâng đỡ bởi hai bàn tay khổng lồ rêu phong, nằm ở độ cao hơn 1.400m trên đỉnh Bà Nà.",
  },
  {
    id: 3,
    title: "Cầu Rồng",
    location: "Hải Châu, Đà Nẵng",
    category: "Attractions",
    rating: "4.7",
    distance: "1.5 km",
    imgUrl: "https://statics.vinpearl.com/cau-rong-da-nang-3_1629438765.png",
    description:
      "Biểu tượng kiến trúc hiện đại của thành phố, phun lửa và phun nước vào 21:00 thứ 7 và Chủ Nhật.",
  },
  {
    id: 4,
    title: "Ngũ Hành Sơn",
    location: "Ngũ Hành Sơn, Đà Nẵng",
    category: "Culture",
    rating: "4.6",
    distance: "12 km",
    imgUrl:
      "https://bazantravel.com/cdn/medias/uploads/89/89456-nui-ngu-hanh-son-da-nang2-700x465.jpg",
    description:
      "Quần thể gồm 5 ngọn núi đá vôi hội tụ vẻ đẹp tâm linh, hang động huyền bí và làng nghề đá mỹ nghệ.",
  },
  {
    id: 5,
    title: "Chợ Hàn",
    location: "Hải Châu, Đà Nẵng",
    category: "Culture",
    rating: "4.5",
    distance: "1.2 km",
    imgUrl:
      "https://queenbus.com.vn/wp-content/uploads/2025/10/Bo-tui-kinh-nghiem-mua-sam-an-uong-tai-cho-Han-Da-Nang-Anh-Suu-tam.png",
    description:
      "Khu chợ truyền thống sầm uất trung tâm thành phố, thiên đường mua sắm đặc sản và quà lưu niệm Đà Nẵng.",
  },
];

const INITIAL_SERVICES = [
  {
    id: 101,
    category: "Khách sạn",
    title: "InterContinental Danang Sun Peninsula Resort",
    address: "Bán đảo Sơn Trà, Đà Nẵng",
    rating: "4.9",
    price: "12.500.000đ/đêm",
    imgUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description:
      "Khu nghỉ dưỡng sang trọng bậc nhất thế giới ẩn mình giữa thiên nhiên hoang sơ của bán đảo Sơn Trà.",
    externalLink:
      "https://www.booking.com/hotel/vn/intercontinental-danang-sun-peninsula-resort.vi.html",
  },
  {
    id: 102,
    category: "Khách sạn",
    title: "Khách sạn Mường Thanh Luxury Đà Nẵng",
    address: "Võ Nguyên Giáp, Mỹ Khê",
    rating: "4.5",
    price: "1.200.000đ/đêm",
    imgUrl:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    description:
      "Khách sạn tiêu chuẩn 5 sao nằm ngay trước bãi biển Mỹ Khê sầm uất.",
    externalLink:
      "https://www.agoda.com/muong-thanh-luxury-da-nang-hotel/hotel/da-nang-vn.html",
  },
  {
    id: 103,
    category: "Vé máy bay",
    title: "Vé Máy Bay Hà Nội → Đà Nẵng (Vietnam Airlines)",
    address: "Sân bay Quốc tế Đà Nẵng",
    rating: "4.8",
    price: "1.500.000đ",
    imgUrl:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    description:
      "Chuyến bay thẳng nội địa chất lượng dịch vụ 4 sao từ thủ đô đến Đà Nẵng.",
    externalLink: "https://www.traveloka.com/vi-vn/flight/to/Da-Nang.DAD",
  },
  {
    id: 104,
    category: "Tour",
    title: "Tour Khám Phá Rừng Dừa Bảy Mẫu 1 Ngày",
    address: "Cẩm Thanh, Hội An",
    rating: "4.6",
    price: "350.000đ",
    imgUrl:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
    description:
      "Trải nghiệm chèo thuyền thúng, quăng lưới bắt cá và thưởng thức ẩm thực dân dã.",
    externalLink:
      "https://www.klook.com/vi/activity/12201-cam-thanh-basket-boat-tour-hoi-an/",
  },
  {
    id: 105,
    category: "Ẩm thực",
    title: "Mì Quảng Ếch Bếp Trang",
    address: "24 Lê Hồng Phong, Hải Châu",
    rating: "4.7",
    price: "45.000đ - 70.000đ",
    imgUrl:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    description:
      "Thương hiệu mì Quảng ếch nổi tiếng, bày trí trong mẹt tre truyền thống đậm chất miền Trung.",
    externalLink:
      "https://www.foody.vn/da-nang/mi-quang-ech-bep-trang-le-hong-phong",
  },
  {
    id: 106,
    category: "Cà phê",
    title: "Cộng Cà Phê - Bạch Đằng",
    address: "98-100 Bạch Đằng, Hải Châu",
    rating: "4.5",
    price: "35.000đ - 65.000đ",
    imgUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    description:
      "Không gian cà phê phong cách thời bao cấp hoài niệm nằm ngay bên bờ sông Hàn thơ mộng.",
    externalLink:
      "https://www.tripadvisor.com.vn/Restaurant_Review-g298085-d4090299-Reviews-Cong_Caphe-Da_Nang.html",
  },
];

const GAMIFICATION_TIERS = [
  {
    label: "Khách du lịch",
    minPts: 0,
    icon: "🗺️",
    color: "from-gray-400 to-gray-500",
  },
  {
    label: "Nhà thám hiểm",
    minPts: 50,
    icon: "🧭",
    color: "from-blue-400 to-blue-600",
  },
  {
    label: "Người dân địa phương",
    minPts: 150,
    icon: "🏅",
    color: "from-amber-400 to-orange-500",
  },
  {
    label: "Chuyên gia Đà Nẵng",
    minPts: 300,
    icon: "🏆",
    color: "from-purple-500 to-pink-500",
  },
];

const INITIAL_PROFILE = { name: "", email: "", phone: "", bio: "", avatar: "" };

/* ══════════════════════════════════════════════════════════
   § 2 — TOAST CONTEXT
══════════════════════════════════════════════════════════ */
const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const showToast = useCallback((type, message, duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message, exiting: false }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        380,
      );
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 380);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-5 right-5 z-[200] flex flex-col gap-3 max-w-sm w-[calc(100vw-2.5rem)]">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const configs = {
    success: {
      bg: "bg-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    },
    error: {
      bg: "bg-red-500",
      icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    },
    info: {
      bg: "bg-blue-500",
      icon: <Info className="w-5 h-5 flex-shrink-0" />,
    },
    warning: {
      bg: "bg-amber-500",
      icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    },
  };
  const cfg = configs[toast.type] || configs.info;
  return (
    <div
      className={`${cfg.bg} text-white px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer select-none ${toast.exiting ? "toast-exit" : "toast-enter"}`}
      onClick={() => onDismiss(toast.id)}
    >
      {cfg.icon}
      <p className="flex-1 text-sm font-semibold leading-snug">
        {toast.message}
      </p>
      <button className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);

/* ══════════════════════════════════════════════════════════
   § 3 — GAMIFICATION HELPERS
══════════════════════════════════════════════════════════ */
function getExplorerTier(pts) {
  let tier = GAMIFICATION_TIERS[0];
  for (const t of GAMIFICATION_TIERS) {
    if (pts >= t.minPts) tier = t;
  }
  return tier;
}
function getNextTier(pts) {
  return GAMIFICATION_TIERS.find((t) => t.minPts > pts) || null;
}

/* ══════════════════════════════════════════════════════════
   § 4 — MODAL
══════════════════════════════════════════════════════════ */
function Modal({ isOpen, onClose, title, children, footer }) {
  // Lock background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Full-screen overlay that scrolls natively
    <div
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
      onClick={onClose}
    >
      {/* Sticky header with title and close button */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* Main content container – centered, limited width */}
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {children}
        {footer && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 5 — MAIN APP
══════════════════════════════════════════════════════════ */
export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [editingLocation, setEditingLocation] = useState(null);

  const [locations, setLocations] = useState([]);
  const [services] = useState(INITIAL_SERVICES);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const s = localStorage.getItem("userProfile");
      return s ? JSON.parse(s) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [timeline, setTimeline] = useState(() => {
    try {
      const s = localStorage.getItem("timeline");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [explorerPoints, setExplorerPoints] = useState(() =>
    parseInt(localStorage.getItem("explorerPoints") || "0", 10),
  );

  const [badgeUnlockAnim, setBadgeUnlockAnim] = useState(null);

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }, [userProfile]);
  useEffect(() => {
    localStorage.setItem("timeline", JSON.stringify(timeline));
  }, [timeline]);
  useEffect(() => {
    localStorage.setItem("explorerPoints", explorerPoints.toString());
  }, [explorerPoints]);

  const awardPoints = useCallback((pts) => {
    setExplorerPoints((prev) => {
      const oldTier = getExplorerTier(prev);
      const newTotal = prev + pts;
      const newTier = getExplorerTier(newTotal);
      if (newTier.label !== oldTier.label) {
        setBadgeUnlockAnim(newTier);
        setTimeout(() => setBadgeUnlockAnim(null), 4000);
      }
      return newTotal;
    });
  }, []);

  // ── Firebase Auth ──
  useEffect(() => {
    // Xử lý kết quả sau khi redirect về
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // Đăng nhập redirect thành công — onAuthStateChanged sẽ xử lý tiếp
        }
      })
      .catch((err) => {
        console.error("Redirect result error:", err);
      });

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        setIsLoggedIn(true);
        setUserProfile((prev) => ({
          ...prev,
          name: prev.name || user.displayName || "",
          email: user.email || prev.email,
          avatar: prev.avatar || user.photoURL || "",
        }));
      } else {
        setAuthUser(null);
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Firestore ──
  useEffect(() => {
    const unsubLoc = onSnapshot(
      collection(db, "locations"),
      (snap) => {
        if (snap.empty) {
          INITIAL_LOCATIONS.forEach((loc) =>
            setDoc(doc(db, "locations", loc.id.toString()), loc).catch(
              console.error,
            ),
          );
          setLocations(INITIAL_LOCATIONS);
        } else {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          data.sort((a, b) => Number(a.id) - Number(b.id));
          setLocations(data);
        }
      },
      () => setLocations(INITIAL_LOCATIONS),
    );

    const unsubPosts = onSnapshot(
      collection(db, "posts"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => Number(b.id) - Number(a.id));
        setPosts(data);
        setPostsLoading(false);
      },
      () => {
        setPosts([]);
        setPostsLoading(false);
      },
    );

    return () => {
      unsubLoc();
      unsubPosts();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userProfile");
      localStorage.removeItem("timeline");
      localStorage.removeItem("explorerPoints");
      setUserProfile(INITIAL_PROFILE);
      setTimeline([]);
      setExplorerPoints(0);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  // ── Auth loading splash ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 via-blue-800 to-indigo-900">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
            <img src="/favicon.png" alt="Da Nang GO Logo" className="w-12 h-12 object-contain rounded-lg" />
          </div>
          <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
          <p className="text-white/70 text-sm font-medium">Đang khởi động...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <ToastProvider>
      {badgeUnlockAnim && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 badge-unlock">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${badgeUnlockAnim.color} flex items-center justify-center text-5xl shadow-2xl badge-glow`}
            >
              {badgeUnlockAnim.icon}
            </div>
            <div className="bg-white rounded-2xl px-6 py-3 shadow-2xl text-center">
              <p className="text-xs text-gray-400 font-medium mb-0.5">
                Huy hiệu mới mở khoá!
              </p>
              <p className="text-base font-bold text-gray-900">
                {badgeUnlockAnim.label}
              </p>
            </div>
          </div>
        </div>
      )}
      <MainShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        locations={locations}
        services={services}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        timeline={timeline}
        setTimeline={setTimeline}
        posts={posts}
        postsLoading={postsLoading}
        authUser={authUser}
        onLogout={handleLogout}
        explorerPoints={explorerPoints}
        awardPoints={awardPoints}
      />
      <Chatbot />
    </ToastProvider>
  );
}

/* ══════════════════════════════════════════════════════════
   § 6 — AUTH SCREEN (Login / Register / Forgot Password)
══════════════════════════════════════════════════════════ */

/* ── Shared input component ── */
function AuthInput({ icon: Icon, type, placeholder, value, onChange, right }) {
  return (
    <div className="relative w-full">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-400 text-sm transition-all"
      />
      {right && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
      )}
    </div>
  );
}

/* ── Error box ── */
function AuthError({ msg }) {
  if (!msg) return null;
  const isUnauthorized =
    msg.includes("unauthorized") || msg.includes("Authorized");
  return (
    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 animate-fade-in">
      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-600 text-xs leading-relaxed">{msg}</p>
        {isUnauthorized && (
          <p className="text-red-500 text-[11px] mt-1.5 font-semibold">
            👉 Firebase Console → Authentication → Settings → Authorized Domains
            → Thêm <code className="bg-red-100 px-1 rounded">localhost</code>
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Google Sign-In button ── */
function GoogleButton({ loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 active:scale-[0.98] disabled:opacity-60 transition-all duration-200 shadow-sm text-sm"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {loading ? "Đang kết nối..." : "Tiếp tục với Google"}
    </button>
  );
}

/* ── Divider ── */
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">hoặc</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

/* ── Translate Firebase error codes ── */
function translateAuthError(code) {
  const map = {
    "auth/email-already-in-use":
      "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.",
    "auth/invalid-email": "Địa chỉ email không hợp lệ.",
    "auth/weak-password": "Mật khẩu quá yếu. Vui lòng dùng ít nhất 6 ký tự.",
    "auth/user-not-found": "Không tìm thấy tài khoản với email này.",
    "auth/wrong-password": "Mật khẩu không đúng. Vui lòng thử lại.",
    "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
    "auth/too-many-requests":
      "Quá nhiều lần thử. Vui lòng đợi vài phút rồi thử lại.",
    "auth/network-request-failed": "Lỗi mạng. Kiểm tra kết nối internet.",
    "auth/popup-blocked": "Popup bị chặn. Trình duyệt sẽ chuyển hướng...",
    "auth/popup-closed-by-user": "Bạn đã đóng cửa sổ đăng nhập. Thử lại nhé!",
    "auth/unauthorized-domain":
      "Domain chưa được phép. Thêm localhost vào Firebase Authorized Domains.",
    "auth/user-disabled": "Tài khoản này đã bị vô hiệu hoá.",
  };
  return map[code] || `Lỗi: ${code}`;
}

/* ── LEFT HERO PANEL (shared) ── */
function AuthHeroPanel() {
  return (
    <div
      className="hidden lg:flex w-[52%] relative overflow-hidden flex-col justify-between p-12"
      style={{
        background:
          "linear-gradient(135deg, #0c4a6e 0%, #0369a1 38%, #0ea5e9 72%, #38bdf8 100%)",
      }}
    >
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 animate-wave" />
      <div
        className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-white/5 animate-wave"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-16 right-16 w-48 h-48 rounded-full bg-white/8 animate-wave"
        style={{ animationDelay: "4s" }}
      />
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <img src="/favicon.png" alt="Da Nang GO Logo" className="w-6 h-6 object-contain" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">
          Da Nang GO
        </span>
      </div>
      <div className="relative z-10 animate-fade-in-up">
        <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6">
          Khám phá
          <br />
          Đà Nẵng
          <br />
          <span className="text-sky-300">tuyệt vời.</span>
        </h1>
        <p className="text-sky-100/80 text-lg max-w-md leading-relaxed">
          Lên lịch trình thông minh, khám phá địa điểm nổi tiếng và kết nối cộng
          đồng du lịch Đà Nẵng.
        </p>
      </div>
      <div className="relative z-10 flex flex-wrap gap-3">
        {["🗺️ Bản đồ", "👥 Cộng đồng", "🏅 Gamification", "⭐ Đánh giá"].map(
          (f) => (
            <span
              key={f}
              className="bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full"
            >
              {f}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

/* ══ MAIN LOGIN SCREEN WRAPPER ══ */
function LoginScreen() {
  // 'login' | 'register' | 'forgot'
  const [view, setView] = useState("login");

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      <AuthHeroPanel />
      <div className="flex-1 flex items-center justify-center p-5 md:p-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-[420px] py-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <img src="/favicon.png" alt="Da Nang GO Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-xl font-bold text-gray-900">Da Nang GO</span>
          </div>

          {view === "login" && (
            <LoginForm
              onGoRegister={() => setView("register")}
              onGoForgot={() => setView("forgot")}
            />
          )}
          {view === "register" && (
            <RegisterForm onGoLogin={() => setView("login")} />
          )}
          {view === "forgot" && (
            <ForgotForm onGoLogin={() => setView("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ══ TAB: ĐĂNG NHẬP ══ */
function LoginForm({ onGoRegister, onGoForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(translateAuthError(err.code));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (e2) {
          setError(translateAuthError(e2.code));
        }
      } else {
        setError(translateAuthError(err.code));
      }
    }
    setGLoading(false);
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-black text-gray-900 mb-1">Đăng nhập</h2>
      <p className="text-gray-500 text-sm mb-7">Chào mừng trở lại! 👋</p>

      <GoogleButton loading={gLoading} onClick={handleGoogleLogin} />
      <OrDivider />

      <form onSubmit={handleEmailLogin} className="space-y-3.5">
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Địa chỉ email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          icon={Lock}
          type={showPwd ? "text" : "password"}
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              {showPwd ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onGoForgot}
            className="text-sm text-blue-500 hover:text-blue-600 font-semibold"
          >
            Quên mật khẩu?
          </button>
        </div>
        <AuthError msg={error} />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-7">
        Chưa có tài khoản?{" "}
        <button
          onClick={onGoRegister}
          className="text-blue-500 font-bold hover:text-blue-600"
        >
          Đăng ký ngay
        </button>
      </p>

      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2.5 text-gray-400">
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs">Bảo mật bởi Firebase Authentication</span>
      </div>
    </div>
  );
}

/* ══ TAB: ĐĂNG KÝ ══ */
function RegisterForm({ onGoLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      // Cập nhật tên hiển thị ngay sau khi tạo tài khoản
      await firebaseUpdateProfile(credential.user, {
        displayName: name.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(translateAuthError(err.code));
    }
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setGLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (e2) {
          setError(translateAuthError(e2.code));
        }
      } else {
        setError(translateAuthError(err.code));
      }
    }
    setGLoading(false);
  };

  if (success) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">
          Đăng ký thành công! 🎉
        </h3>
        <p className="text-gray-500 text-sm mb-8">
          Tài khoản của bạn đã được tạo. Hãy khám phá Đà Nẵng ngay!
        </p>
        <button
          onClick={onGoLogin}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <button
        onClick={onGoLogin}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
      </button>
      <h2 className="text-2xl font-black text-gray-900 mb-1">Tạo tài khoản</h2>
      <p className="text-gray-500 text-sm mb-7">
        Tham gia cộng đồng Da Nang GO! 🌊
      </p>

      <GoogleButton loading={gLoading} onClick={handleGoogleRegister} />
      <OrDivider />

      <form onSubmit={handleRegister} className="space-y-3.5">
        <AuthInput
          icon={User}
          type="text"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Địa chỉ email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          icon={Lock}
          type={showPwd ? "text" : "password"}
          placeholder="Mật khẩu (ít nhất 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              {showPwd ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />
        <AuthInput
          icon={Lock}
          type={showCfm ? "text" : "password"}
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          right={
            <button
              type="button"
              onClick={() => setShowCfm((v) => !v)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              {showCfm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />

        {/* Password strength */}
        {password.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    password.length >= i * 3
                      ? i <= 1
                        ? "bg-red-400"
                        : i <= 2
                          ? "bg-amber-400"
                          : i <= 3
                            ? "bg-blue-400"
                            : "bg-emerald-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400">
              {password.length < 4
                ? "⚠️ Rất yếu"
                : password.length < 7
                  ? "🔶 Yếu"
                  : password.length < 10
                    ? "🔵 Trung bình"
                    : "✅ Mạnh"}
            </p>
          </div>
        )}

        <AuthError msg={error} />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Đang tạo tài khoản...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" /> Tạo tài khoản
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-7">
        Đã có tài khoản?{" "}
        <button
          onClick={onGoLogin}
          className="text-blue-500 font-bold hover:text-blue-600"
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}

/* ══ TAB: QUÊN MẬT KHẨU ══ */
function ForgotForm({ onGoLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      setError(translateAuthError(err.code));
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center mb-5">
          <Mail className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">
          Email đã được gửi! 📧
        </h3>
        <p className="text-gray-500 text-sm mb-2">
          Kiểm tra hộp thư của bạn tại:
        </p>
        <p className="text-blue-600 font-bold text-sm mb-8 bg-blue-50 px-4 py-2 rounded-xl">
          {email}
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Nhấn vào link trong email để đặt lại mật khẩu. Kiểm tra cả thư mục
          Spam nhé!
        </p>
        <button
          onClick={onGoLogin}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all"
        >
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <button
        onClick={onGoLogin}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
      </button>
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-5">
        <KeyRound className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-1">Quên mật khẩu?</h2>
      <p className="text-gray-500 text-sm mb-7">
        Nhập email đăng ký — chúng tôi sẽ gửi link đặt lại mật khẩu ngay.
      </p>
      <form onSubmit={handleReset} className="space-y-4">
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Địa chỉ email đã đăng ký"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthError msg={error} />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-amber-200 hover:from-amber-500 hover:to-orange-500 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" /> Gửi link đặt lại mật khẩu
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 7 — MAIN SHELL
══════════════════════════════════════════════════════════ */
function MainShell({
  activeTab,
  setActiveTab,
  locations,
  services,
  userProfile,
  setUserProfile,
  timeline,
  setTimeline,
  posts,
  postsLoading,
  authUser,
  onLogout,
  explorerPoints,
  awardPoints,
}) {
  const tier = getExplorerTier(explorerPoints);
  const nextTier = getNextTier(explorerPoints);
  const progressPct = nextTier
    ? Math.min(
        100,
        Math.round(
          ((explorerPoints - tier.minPts) / (nextTier.minPts - tier.minPts)) *
            100,
        ),
      )
    : 100;

  const navItems = [
    { id: "home", icon: Home, label: "Trang chủ" },
    { id: "explore", icon: Compass, label: "Khám phá" },
    { id: "map", icon: MapIcon, label: "Bản đồ" },
    { id: "services", icon: Tag, label: "Dịch vụ" },
    { id: "community", icon: Users, label: "Cộng đồng" },
    { id: "profile", icon: User, label: "Cá nhân" },
  ];

  const avatarInitials = userProfile.name
    ? userProfile.name
        .split(" ")
        .map((n) => n?.[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-[88px] border-r border-gray-100 bg-white min-h-screen fixed left-0 top-0 z-40 shadow-sm">
        <div className="flex items-center justify-center py-5">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Da Nang GO" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
            <span className="text-sm font-bold text-gray-800">Da Nang GO</span>
          </div>
        </div>
        {/* Points widget */}
        <div className="mx-3 mb-3 p-2.5 bg-gradient-to-b from-blue-50 to-transparent rounded-2xl text-center">
          <span className="text-xl">{tier.icon}</span>
          <p className="text-[9px] font-bold text-gray-500 mt-0.5">
            {explorerPoints}pts
          </p>
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 w-full py-2.5 px-1 rounded-2xl transition-all duration-200 group ${isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-200" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span
                  className={`text-[9px] font-bold ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 md:ml-[88px] pb-24 md:pb-0">
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center md:hidden">
                <img src="/favicon.png" alt="Da Nang GO" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
              </div>
              <h1 className="text-[17px] font-black text-gray-900 tracking-tight">
                Da Nang <span className="text-blue-500">GO</span>
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                <span className="text-base">{tier.icon}</span>
                <div>
                  <p className="text-[10px] text-amber-600 font-bold leading-none">
                    {tier.label}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {explorerPoints} điểm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("profile")}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden flex-shrink-0"
              >
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarInitials
                )}
              </button>
            </div>
          </div>
          {nextTier && (
            <div className="h-0.5 bg-gray-100 mx-5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </header>

        <main
          className={
            activeTab === "map" ? "" : "max-w-6xl mx-auto px-4 md:px-6 py-5"
          }
        >
          {activeTab === "home" && (
            <HomeTab
              setActiveTab={setActiveTab}
              locations={locations}
              userProfile={userProfile}
              explorerPoints={explorerPoints}
              tier={tier}
              nextTier={nextTier}
              progressPct={progressPct}
            />
          )}
          {activeTab === "explore" && (
            <ExploreTab locations={locations} awardPoints={awardPoints} />
          )}
          {activeTab === "map" && <MapTab locations={locations} />}
          {activeTab === "services" && <ServicesTab services={services} />}
          {activeTab === "community" && (
            <CommunityTab
              posts={posts}
              postsLoading={postsLoading}
              userProfile={userProfile}
              awardPoints={awardPoints}
              setPosts={null}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              posts={posts}
              locations={locations}
              authUser={authUser}
              onLogout={handleLogout}
              explorerPoints={explorerPoints}
              tier={tier}
            />
          )}
          {activeTab === "itinerary" && (
            <ItineraryTab timeline={timeline} setTimeline={setTimeline} />
          )}
          {activeTab === "safety" && <SafetyTab />}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 z-50 md:hidden pb-safe shadow-lg">
        <div className="flex items-center justify-around py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all duration-200 min-w-[48px] ${isActive ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-blue-500 text-white shadow-md shadow-blue-200" : ""}`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span
                  className={`text-[9px] font-bold ${isActive ? "text-blue-600" : "text-gray-400"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 8 — HOME TAB
══════════════════════════════════════════════════════════ */
function HomeTab({
  setActiveTab,
  locations,
  userProfile,
  explorerPoints,
  tier,
  nextTier,
  progressPct,
}) {
  const features = [
    {
      icon: Compass,
      label: "Khám phá",
      color: "bg-emerald-50 text-emerald-500",
      tab: "explore",
    },
    {
      icon: Shield,
      label: "An toàn",
      color: "bg-amber-50 text-amber-500",
      tab: "safety",
    },
    {
      icon: Users,
      label: "Cộng đồng",
      color: "bg-blue-50 text-blue-500",
      tab: "community",
    },
    {
      icon: MapIcon,
      label: "Bản đồ",
      color: "bg-rose-50 text-rose-500",
      tab: "map",
    },
    {
      icon: Tag,
      label: "Dịch vụ",
      color: "bg-cyan-50 text-cyan-500",
      tab: "services",
    },
    {
      icon: Trophy,
      label: "Huy hiệu",
      color: "bg-purple-50 text-purple-500",
      tab: "profile",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-5">
        <div
          className="md:w-[55%] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200/50"
          style={{
            background:
              "linear-gradient(135deg, #0c4a6e, #0369a1 50%, #0ea5e9)",
          }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/8 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <p className="text-sky-200 text-sm font-semibold mb-1">
              Xin chào
              {userProfile.name ? `, ${userProfile.name.split(" ").pop()}` : ""}
              ! 👋
            </p>
            <h2 className="text-3xl md:text-4xl font-black mb-2">
              Hôm nay đi đâu?
            </h2>
            <p className="text-sky-100/80 text-sm mb-6">
              Đà Nẵng đang chờ bạn khám phá 🌊
            </p>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 w-4 h-4 z-10" />
              <input
                type="text"
                placeholder="Tìm địa điểm, ẩm thực, dịch vụ..."
                className="w-full pl-11 pr-4 py-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl outline-none focus:bg-white/25 text-white placeholder-sky-200 text-sm"
                onFocus={() => setActiveTab("explore")}
                readOnly
              />
            </div>
          </div>
        </div>
        <div className="md:w-[45%] grid grid-cols-3 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <button
                key={i}
                onClick={() => f.tab && setActiveTab(f.tab)}
                className="flex flex-col items-center gap-2 p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md active:scale-95 transition-all duration-200 group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explorer progress */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{tier.icon}</span>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{tier.label}</h3>
              <p className="text-xs text-gray-400">
                {explorerPoints} điểm khám phá
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("explore")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            Khám phá
          </button>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all duration-1000`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {nextTier && (
          <p className="text-[11px] text-gray-400 mt-1.5">
            Còn{" "}
            <span className="font-bold text-gray-600">
              {nextTier.minPts - explorerPoints} điểm
            </span>{" "}
            để đạt "{nextTier.icon} {nextTier.label}"
          </p>
        )}
      </div>

      {/* Top picks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900">
            Gợi ý dành cho bạn
          </h3>
          <button
            onClick={() => setActiveTab("explore")}
            className="text-sm text-blue-500 font-semibold flex items-center gap-1 hover:text-blue-600"
          >
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-gray-400 text-sm font-medium">
              Đang tải địa điểm...
            </p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 snap-x scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible pb-2">
            {locations.slice(0, 4).map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: MapPin,
            label: "Địa điểm",
            value: locations.length,
            color: "text-blue-500 bg-blue-50",
          },
          {
            icon: Star,
            label: "Đánh giá TB",
            value: "4.8★",
            color: "text-amber-500 bg-amber-50",
          },
          {
            icon: TrendingUp,
            label: "Lượt truy cập",
            value: "1.2k",
            color: "text-emerald-500 bg-emerald-50",
          },
          {
            icon: Award,
            label: "Xếp hạng",
            value: "#1",
            color: "text-purple-500 bg-purple-50",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  {stat.label}
                </p>
                <p className="text-lg font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocationCard({ location }) {
  return (
    <div className="min-w-[260px] md:min-w-0 snap-start bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover group cursor-pointer">
      <div className="relative h-40 overflow-hidden bg-gray-100">
        {location.imgUrl ? (
          <img
            src={location.imgUrl}
            alt={location.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2.5 right-2.5 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-white">
            {location.rating || "N/A"}
          </span>
        </div>
      </div>
      <div className="p-3.5">
        <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
          {location.title}
        </h4>
        <div className="flex items-center gap-1 text-gray-400">
          <MapPin className="w-3 h-3" />
          <span className="text-xs truncate">{location.location}</span>
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-2 py-0.5 rounded-lg">
            {location.distance || "N/A"}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {location.category}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 9 — EXPLORE TAB
══════════════════════════════════════════════════════════ */
function ExploreTab({ locations, awardPoints }) {
  const showToast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLoc, setNewLoc] = useState({
    title: "",
    location: "",
    description: "",
    imgUrl: "",
    category: "Attractions",
  });

  const resetForm = () => {
    setNewLoc({ title: "", location: "", description: "", imgUrl: "", category: "Attractions" });
    setEditingLocation(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeModal = () => {
    resetForm();
    setShowAddModal(false);
  };
  const categories = [
    "All",
    "Attractions",
    "Culture",
    "Ẩm thực",
    "Cà phê",
    "Khách sạn",
  ];

  const filtered = locations.filter((loc) => {
    const q = searchQuery.toLowerCase();
    return (
      (loc.title.toLowerCase().includes(q) ||
        loc.location.toLowerCase().includes(q)) &&
      (categoryFilter === "All" || loc.category === categoryFilter)
    );
  });

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      showToast("error", "Vui lòng đăng nhập trước khi thêm địa điểm.");
      return;
    }
    if (!newLoc.title.trim() || !newLoc.location.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingLocation) {
        // UPDATE mode
        await updateDoc(doc(db, "locations", editingLocation.id.toString()), {
          title: newLoc.title,
          location: newLoc.location,
          category: newLoc.category,
          imgUrl: newLoc.imgUrl,
          description: newLoc.description || "Địa điểm được cập nhật.",
        });
        showToast("success", "Đã cập nhật địa điểm thành công! ✏️");
      } else {
        // CREATE mode
        const newId = Date.now().toString();
        await setDoc(doc(db, "locations", newId), {
          id: newId,
          title: newLoc.title,
          location: newLoc.location,
          category: newLoc.category,
          rating: "5.0",
          distance: "N/A",
          imgUrl: newLoc.imgUrl,
          description: newLoc.description || "Địa điểm mới được thêm bởi bạn.",
        });
        awardPoints(10);
        showToast("success", "Đã thêm địa điểm! +10 điểm Explorer 🗺️");
      }
      closeModal();
    } catch (error) {
      console.error("Firebase Error Code:", error.code);
      console.error("Firebase Error Message:", error.message);
      showToast("error", `Thao tác thất bại: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa điểm này không?")) return;
    try {
      await deleteDoc(doc(db, "locations", id.toString()));
      showToast("success", "Đã xóa địa điểm thành công! 🗑️");
    } catch (error) {
      console.error("Delete Error:", error.code, error.message);
      showToast("error", `Xóa thất bại: ${error.message}`);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setNewLoc({
      title: location.title || "",
      location: location.location || "",
      description: location.description || "",
      imgUrl: location.imgUrl || "",
      category: location.category || "Attractions",
    });
    setShowAddModal(true);
  };


  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        <input
          type="text"
          placeholder="Tìm kiếm địa điểm tại Đà Nẵng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-400 shadow-sm text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${categoryFilter === cat ? "bg-blue-500 text-white shadow-md shadow-blue-200" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-500"}`}
          >
            {cat === "All" ? "Tất cả" : cat}
          </button>
        ))}
      </div>

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
          <p className="text-gray-400 font-medium text-sm">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <Search className="w-12 h-12 text-gray-200 mb-3" />
          <h3 className="font-bold text-gray-700 mb-1">
            Không tìm thấy kết quả
          </h3>
          <p className="text-gray-400 text-sm">
            Thử từ khóa khác hoặc đổi danh mục
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover group cursor-pointer"
              onClick={() => setSelectedDetail(loc)}
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                {loc.imgUrl ? (
                  <img
                    src={loc.imgUrl}
                    alt={loc.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="font-black text-white text-base mb-0.5 truncate">
                    {loc.title}
                  </h4>
                  <div className="flex items-center gap-1 text-white/80">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs truncate">{loc.location}</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-white">{loc.rating}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(loc); }}
                    className="bg-black/30 backdrop-blur-sm rounded-lg p-1.5 hover:bg-blue-500/80 transition-colors"
                    title="Sửa địa điểm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(loc.id); }}
                    className="bg-black/30 backdrop-blur-sm rounded-lg p-1.5 hover:bg-red-500/80 transition-colors"
                    title="Xóa địa điểm"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {loc.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
                    {loc.distance || "N/A"}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">
                    {loc.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={openAddModal}
        className="fixed bottom-24 md:bottom-8 right-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white w-14 h-14 rounded-2xl shadow-xl shadow-blue-300 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title={editingLocation ? "✏️ Sửa địa điểm" : "➕ Thêm địa điểm du lịch"}
        footer={
          <button
            type="submit"
            form="location-form"
            disabled={isSubmitting}
            className={`w-full py-3.5 ${editingLocation ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200" : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200"} text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : editingLocation ? (
              <>
                <Save className="w-5 h-5" /> Lưu thay đổi
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" /> Thêm địa điểm (+10 điểm)
              </>
            )}
          </button>
        }
      >
        <form id="location-form" onSubmit={handleAddLocation} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên địa điểm *
            </label>
            <input
              type="text"
              placeholder="Vd: Bãi biển Non Nước"
              value={newLoc.title}
              onChange={(e) => setNewLoc({ ...newLoc, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Địa chỉ *
            </label>
            <input
              type="text"
              placeholder="Vd: Ngũ Hành Sơn, Đà Nẵng"
              value={newLoc.location}
              onChange={(e) =>
                setNewLoc({ ...newLoc, location: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Danh mục
            </label>
            <select
              value={newLoc.category}
              onChange={(e) =>
                setNewLoc({ ...newLoc, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 text-sm"
            >
              {["Attractions", "Culture", "Ẩm thực", "Cà phê", "Khách sạn"].map(
                (c) => (
                  <option key={c}>{c}</option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Mô tả
            </label>
            <textarea
              placeholder="Mô tả chi tiết..."
              value={newLoc.description}
              rows={3}
              onChange={(e) =>
                setNewLoc({ ...newLoc, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              URL Hình ảnh
            </label>
            <div className="relative">
              <Image className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <input
                type="url"
                placeholder="https://..."
                value={newLoc.imgUrl}
                onChange={(e) =>
                  setNewLoc({ ...newLoc, imgUrl: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        title={selectedDetail?.title || ""}
      >
        {selectedDetail && (
          <div className="space-y-4">
            <div className="w-full h-52 bg-gray-100 rounded-2xl overflow-hidden">
              {selectedDetail.imgUrl ? (
                <img
                  src={selectedDetail.imgUrl}
                  alt={selectedDetail.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />{" "}
                {selectedDetail.rating || "N/A"}
              </span>
              <span className="text-sm text-blue-500 font-semibold bg-blue-50 px-3 py-1 rounded-lg">
                {selectedDetail.distance || "N/A"}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                {selectedDetail.category}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{selectedDetail.location}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedDetail.description}
              </p>
            </div>
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedDetail.title + ", Da Nang, Vietnam")}`,
                  "_blank",
                )
              }
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-sm"
            >
              <Navigation className="w-4 h-4" /> Chỉ đường trên Google Maps
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 10 — MAP TAB
══════════════════════════════════════════════════════════ */
function MapTab({ locations }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showList, setShowList] = useState(false);
  const [mapSearch, setMapSearch] = useState("");

  const filtered = locations.filter((loc) => {
    if (!mapSearch.trim()) return true;
    const q = mapSearch.toLowerCase();
    return (
      loc.title.toLowerCase().includes(q) ||
      loc.location.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="relative w-full animate-fade-in"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <iframe
        title="Da Nang Map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61349.72583584362!2d108.17091525!3d16.0544068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0xfc14e3a044436487!2sDa%20Nang%2C%20Vietnam!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <input
            type="text"
            placeholder="Tìm kiếm trên bản đồ..."
            value={mapSearch}
            onChange={(e) => {
              setMapSearch(e.target.value);
              setShowList(true);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-lg outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400 text-sm"
          />
          {mapSearch && (
            <button
              onClick={() => setMapSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowList(!showList)}
          className="p-3 bg-white rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
      {showList && (
        <div className="absolute top-20 left-4 w-80 max-h-[55vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 z-20 animate-scale-in">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-100 rounded-t-2xl">
            <h3 className="font-bold text-gray-900 text-sm">
              {mapSearch
                ? `"${mapSearch}" (${filtered.length})`
                : `Địa điểm nổi bật (${filtered.length})`}
            </h3>
          </div>
          <div className="p-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Không tìm thấy</p>
              </div>
            ) : (
              filtered.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowList(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
                >
                  {loc.imgUrl ? (
                    <img
                      src={loc.imgUrl}
                      alt={loc.title}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">
                      {loc.title}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {loc.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-gray-600">
                      {loc.rating}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {selectedLocation && (
        <div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up">
          <div className="bg-white rounded-t-3xl shadow-2xl mx-2 md:mx-auto md:max-w-lg p-5">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <div className="flex gap-4">
              {selectedLocation.imgUrl ? (
                <img
                  src={selectedLocation.imgUrl}
                  alt={selectedLocation.title}
                  className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-lg mb-1">
                  {selectedLocation.title}
                </h3>
                <div className="flex items-center gap-1 text-gray-400 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{selectedLocation.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />{" "}
                    {selectedLocation.rating}
                  </span>
                  <span className="text-sm text-blue-500 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-lg">
                    {selectedLocation.distance}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.title + ", Da Nang, Vietnam")}`,
                    "_blank",
                  )
                }
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-sm"
              >
                <Navigation className="w-4 h-4" /> Chỉ đường
              </button>
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-5 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-28 right-4 flex flex-col gap-2 z-10 max-h-[45vh] overflow-y-auto scrollbar-hide">
        {filtered.slice(0, 8).map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelectedLocation(loc)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg text-xs font-semibold transition-all duration-200 ${selectedLocation?.id === loc.id ? "bg-blue-500 text-white shadow-blue-300 scale-105" : "bg-white text-gray-700 hover:bg-blue-50"}`}
          >
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-[100px]">{loc.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 11 — SERVICES TAB
══════════════════════════════════════════════════════════ */
function ServicesTab({ services }) {
  const serviceTypes = [
    { icon: Hotel, label: "Khách sạn", color: "bg-blue-50 text-blue-500" },
    {
      icon: Plane,
      label: "Vé máy bay",
      color: "bg-emerald-50 text-emerald-500",
    },
    { icon: Ticket, label: "Tour", color: "bg-amber-50 text-amber-500" },
    { icon: Utensils, label: "Ẩm thực", color: "bg-rose-50 text-rose-500" },
    { icon: Coffee, label: "Cà phê", color: "bg-purple-50 text-purple-500" },
    { icon: ShoppingBag, label: "Mua sắm", color: "bg-cyan-50 text-cyan-500" },
  ];
  const [active, setActive] = useState("Khách sạn");
  const filteredSvc = services.filter((s) => s.category === active);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div
        className="rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl"
        style={{
          background: "linear-gradient(135deg, #f97316, #ec4899 50%, #a855f7)",
        }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-lg">
              DỊCH VỤ NỔI BẬT
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-2">
            Trải nghiệm du lịch
          </h2>
          <p className="text-white/80 text-sm">
            Tìm kiếm và đặt các dịch vụ du lịch Đà Nẵng dễ dàng
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {serviceTypes.map((s, i) => {
          const Icon = s.icon;
          const isActive = active === s.label;
          return (
            <button
              key={i}
              onClick={() => setActive(s.label)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl shadow-sm border transition-all duration-200 group ${isActive ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 hover:shadow-md"}`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${isActive ? "bg-blue-500 text-white shadow-md shadow-blue-200" : s.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-bold ${isActive ? "text-blue-700" : "text-gray-700"}`}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-4">
          {active} nổi bật
        </h3>
        {filteredSvc.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Tag className="w-14 h-14 text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">Chưa có dữ liệu.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSvc.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover flex flex-col md:flex-row"
              >
                <div className="md:w-48 h-40 md:h-auto overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.imgUrl ? (
                    <img
                      src={item.imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2.5 py-1 rounded-lg">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400" />{" "}
                        {item.rating}
                      </span>
                    </div>
                    <h4 className="font-black text-gray-900 text-base mb-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 text-gray-400 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs truncate">{item.address}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-lg font-black text-blue-600">
                      {item.price}
                    </span>
                  </div>
                  <button
                    onClick={() => window.open(item.externalLink, "_blank")}
                    className="mt-3 w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-sm text-sm flex items-center justify-center gap-2"
                  >
                    Đặt ngay <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 12 — COMMUNITY TAB
══════════════════════════════════════════════════════════ */
function CommunityTab({ posts, postsLoading, userProfile, awardPoints, setPosts }) {
  const showToast = useToast();
  const [newPostText, setNewPostText] = useState("");
  const [newPostImg, setNewPostImg] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const userAvatar = userProfile.name
    ? userProfile.name
        .split(" ")
        .map((n) => n?.[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setIsSubmitting(true);
    try {
      const newId = Date.now().toString();
      await setDoc(doc(db, "posts", newId), {
        id: newId,
        author: userProfile.name || "Người dùng ẩn danh",
        avatar: userAvatar,
        time: new Date().toLocaleTimeString(),
        text: newPostText,
        imgUrl: newPostImg,
        likes: 0,
        isLiked: false,
        comments: [],
      });
      setNewPostText("");
      setNewPostImg("");
      awardPoints(5);
      showToast("success", "Đã đăng bài! +5 điểm 🎉");
    } catch {
      showToast("error", "Không thể đăng bài. Kiểm tra quyền Firebase.");
    }
    setIsSubmitting(false);
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setEditText(post.text);
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await updateDoc(doc(db, "posts", id.toString()), {
        text: editText,
        updatedAt: serverTimestamp(),
      });
      setEditingPostId(null);
      setEditText("");
      showToast("success", "Đã cập nhật bài viết! ✏️");
    } catch (e) {
      console.error("Edit Error:", e.code, e.message);
      showToast("error", `Cập nhật thất bại: ${e.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditText("");
  };

  const toggleLike = async (post) => {
    try {
      await updateDoc(doc(db, "posts", post.id.toString()), {
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (post) => {
    const text = (commentTexts[post.id] || "").trim();
    if (!text) return;
    try {
      const newComment = {
        id: Date.now(),
        author: userProfile.name || "Ẩn danh",
        avatar: userAvatar,
        text,
        time: new Date().toLocaleTimeString(),
      };
      await updateDoc(doc(db, "posts", post.id.toString()), {
        comments: [...(post.comments || []), newComment],
      });
      setCommentTexts({ ...commentTexts, [post.id]: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const comment = post.comments?.find((c) => c.id === commentId);
    if (!comment) return;
    if (comment.author !== (userProfile.name || "Ẩn danh")) return;
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này không?")) return;
    try {
      await updateDoc(doc(db, "posts", postId.toString()), {
        comments: post.comments.filter((c) => c.id !== commentId),
      });
      showToast("success", "Đã xóa bình luận!");
    } catch (e) {
      showToast("error", "Lỗi xóa bình luận");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId.toString()));
      showToast("success", "Đã xóa bài viết thành công! 🗑️");
    } catch (error) {
      console.error("Delete Error:", error.code, error.message);
      showToast("error", `Xóa thất bại: ${error.message}`);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto animate-fade-in-up">
      <h2 className="text-xl font-black text-gray-900">Cộng đồng Đà Nẵng</h2>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {userAvatar}
          </div>
          <form onSubmit={handleCreatePost} className="flex-1 space-y-3">
            <textarea
              placeholder="Chia sẻ trải nghiệm du lịch Đà Nẵng của bạn..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400 text-sm resize-none"
            />
            <div className="relative">
              <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <input
                type="url"
                placeholder="URL hình ảnh (tùy chọn)"
                value={newPostImg}
                onChange={(e) => setNewPostImg(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400 text-xs"
              />
            </div>
            {newPostImg && (
              <div className="relative rounded-xl overflow-hidden h-32">
                <img
                  src={newPostImg}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setNewPostImg("")}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newPostText.trim() || isSubmitting}
                className="px-5 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 active:scale-95 disabled:opacity-40 transition-all duration-200 flex items-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Đăng bài
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        {postsLoading ? (
          [1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 skeleton rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 skeleton rounded-lg w-1/3" />
                  <div className="h-2 skeleton rounded-lg w-1/4" />
                </div>
              </div>
              <div className="h-3 skeleton rounded-lg" />
              <div className="h-3 skeleton rounded-lg w-4/5" />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-5xl mb-4">🌊</div>
            <h3 className="text-lg font-black text-gray-900 mb-2">
              Bắt đầu khám phá Đà Nẵng!
            </h3>
            <p className="text-gray-400 text-sm">
              Hãy là người đầu tiên chia sẻ trải nghiệm!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {post.author}
                    </h4>
                    <p className="text-xs text-gray-400">{post.time}{post.updatedAt ? " · đã chỉnh sửa" : ""}</p>
                  </div>
                  {post.author === (userProfile.name || "Ẩn danh") && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="bg-gray-100 hover:bg-blue-100 rounded-lg p-1.5 hover:text-blue-600 transition-colors"
                        title="Sửa bài viết"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="bg-gray-100 hover:bg-red-100 rounded-lg p-1.5 hover:text-red-600 transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
                {editingPostId === post.id ? (
                  <div className="space-y-3 animate-fade-in-up">
                    <textarea
                      rows={4}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400 text-sm resize-none"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        disabled={!editText.trim()}
                        className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:shadow-md hover:shadow-blue-200 active:scale-95 disabled:opacity-40 transition-all duration-200 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" /> Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.text}
                  </p>
                )}
              </div>
              {post.imgUrl && (
                <div className="w-full h-52 overflow-hidden bg-gray-100">
                  <img
                    src={post.imgUrl}
                    alt="Post"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="px-5 py-3 flex items-center gap-5 border-t border-gray-100">
                <button
                  onClick={() => toggleLike(post)}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 ${post.isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
                >
                  <Heart
                    className={`w-5 h-5 transition-all duration-200 ${post.isLiked ? "fill-red-500 scale-110" : ""}`}
                  />
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() =>
                    setActiveCommentId(
                      activeCommentId === post.id ? null : post.id,
                    )
                  }
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 ${activeCommentId === post.id ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>
                    Bình luận{" "}
                    {post.comments?.length > 0
                      ? `(${post.comments.length})`
                      : ""}
                  </span>
                </button>
              </div>
              {activeCommentId === post.id && (
                <div className="px-5 pb-4 border-t border-gray-50 animate-fade-in-up">
                  <div className="flex items-center gap-2.5 pt-4 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {userAvatar}
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Viết bình luận..."
                        value={commentTexts[post.id] || ""}
                        onChange={(e) =>
                          setCommentTexts({
                            ...commentTexts,
                            [post.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post);
                        }}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400 text-sm"
                      />
                      <button
                        onClick={() => handleAddComment(post)}
                        disabled={!(commentTexts[post.id] || "").trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 disabled:opacity-30"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {post.comments?.length > 0 && (
                    <div className="space-y-3">
                      {post.comments.map((cmt) => (
                        <div key={cmt.id} className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                            {cmt.avatar}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-gray-900">
                                {cmt.author}
                              </span>
                              {cmt.author === (userProfile.name || "Ẩn danh") && (
                                <button
                                  onClick={() => handleDeleteComment(post.id, cmt.id)}
                                  className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                                  aria-label="Delete comment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <span className="text-[10px] text-gray-400">
                                {cmt.time}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {cmt.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 13 — PROFILE TAB
══════════════════════════════════════════════════════════ */
function ProfileTab({
  userProfile,
  setUserProfile,
  posts,
  locations,
  authUser,
  onLogout,
  explorerPoints,
  tier,
}) {
  const showToast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ ...userProfile });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleEditClick = () => {
    setDraft({ ...userProfile });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setUserProfile({ ...draft });
    setIsEditing(false);
    if (authUser) {
      try {
        await updateProfile(authUser, { displayName: draft.name });
      } catch (e) {
        console.error(e);
      }
    }
    showToast("success", "Đã lưu thông tin cá nhân! ✅");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !authUser) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Vui lòng chọn file ảnh (JPG, PNG, WEBP...)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Ảnh không được vượt quá 5MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const storageRef = ref(
        storage,
        `avatars/${authUser.uid}/${Date.now()}_${file.name}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snap) =>
          setUploadProgress(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
          ),
        () => {
          showToast("error", "Upload thất bại. Thử lại sau.");
          setIsUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await updateProfile(authUser, { photoURL: url });
          setUserProfile((prev) => ({ ...prev, avatar: url }));
          showToast("success", "Đã cập nhật ảnh đại diện! 📸");
          setIsUploading(false);
        },
      );
    } catch (error) {
      console.error("Avatar Upload Error Code:", error.code);
      console.error("Avatar Upload Error Message:", error.message);
      showToast("error", `Có lỗi xảy ra khi upload. ${error.message}`);
      setIsUploading(false);
    }
  };

  const avatarInitials = userProfile.name
    ? userProfile.name
        .split(" ")
        .map((n) => n?.[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  const userPostCount = posts.filter(
    (p) => p.author === (userProfile.name || "Người dùng ẩn danh"),
  ).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      <div
        className="rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200/50"
        style={{
          background: "linear-gradient(135deg, #0c4a6e, #0369a1 50%, #0ea5e9)",
        }}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/8 rounded-full" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black mb-4 border-2 border-white/30 relative overflow-hidden group">
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              avatarInitials
            )}
            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span className="text-[9px] text-white font-bold mt-0.5">
                    {uploadProgress}%
                  </span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[9px] font-bold mt-0.5">Đổi ảnh</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading || !authUser}
              />
            </label>
          </div>
          {isUploading && (
            <div className="w-24 h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          <h2 className="text-2xl font-black mb-0.5">
            {userProfile.name || "Người dùng mới"}
          </h2>
          <p className="text-sky-200 text-sm mb-2">{userProfile.email}</p>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
            <span className="text-xl">{tier.icon}</span>
            <div>
              <p className="text-xs font-black text-sky-100">{tier.label}</p>
              <p className="text-[10px] text-sky-200">{explorerPoints} điểm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Bài viết", value: userPostCount },
          { label: "Địa điểm", value: locations.length },
          { label: "Điểm", value: explorerPoints },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center"
          >
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">
            Thông tin cá nhân
          </h3>
          <button
            onClick={isEditing ? () => setIsEditing(false) : handleEditClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isEditing ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" /> Hủy
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" /> Chỉnh sửa
              </>
            )}
          </button>
        </div>
        {!isEditing ? (
          <div className="space-y-4">
            {[
              {
                icon: User,
                label: "Họ tên",
                value: userProfile.name || "Chưa cập nhật",
              },
              {
                icon: Send,
                label: "Email",
                value: userProfile.email || "Chưa cập nhật",
              },
              {
                icon: Phone,
                label: "Số điện thoại",
                value: userProfile.phone || "Chưa cập nhật",
              },
              {
                icon: Info,
                label: "Giới thiệu",
                value: userProfile.bio || "Chưa cập nhật",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">
                      {f.label}
                    </p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {f.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {[
              {
                label: "Họ tên",
                key: "name",
                type: "text",
                placeholder: "Nguyễn Văn A",
                icon: User,
              },
              {
                label: "Email",
                key: "email",
                type: "email",
                placeholder: "email@example.com",
                icon: Send,
              },
              {
                label: "Số điện thoại",
                key: "phone",
                type: "tel",
                placeholder: "0901234567",
                icon: Phone,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key}>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    {f.label}
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <input
                      type={f.type}
                      value={draft[f.key]}
                      placeholder={f.placeholder}
                      onChange={(e) =>
                        setDraft({ ...draft, [f.key]: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 text-sm"
                    />
                  </div>
                </div>
              );
            })}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Giới thiệu
              </label>
              <textarea
                value={draft.bio}
                rows={3}
                placeholder="Mô tả ngắn về bản thân..."
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 text-sm resize-none"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Lưu thông tin
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onLogout}
        className="w-full py-3.5 border-2 border-red-100 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all duration-200"
      >
        <LogOut className="w-5 h-5" /> Đăng xuất
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 14 — SAFETY TAB
══════════════════════════════════════════════════════════ */
function SafetyTab() {
  return (
    <div className="space-y-5 max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-200/50">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-1">Da Nang GO Promise</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Chúng tôi cam kết mang đến trải nghiệm du lịch an toàn, đáng tin
              cậy và chất lượng cao nhất.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            icon: BadgeCheck,
            title: "Dịch vụ xác minh",
            desc: "Tất cả đối tác được xác minh và đánh giá chất lượng nghiêm ngặt.",
            color: "text-blue-500 bg-blue-50",
          },
          {
            icon: AlertTriangle,
            title: "Báo cáo sự cố",
            desc: "Gửi báo cáo bất kỳ vấn đề nào và nhận phản hồi trong vòng 24h.",
            color: "text-amber-500 bg-amber-50",
          },
          {
            icon: PhoneCall,
            title: "Hỗ trợ 24/7",
            desc: "Đội ngũ hỗ trợ hoạt động 24/7 sẵn sàng giúp đỡ bạn mọi lúc.",
            color: "text-emerald-500 bg-emerald-50",
          },
          {
            icon: Megaphone,
            title: "Khẩn cấp",
            desc: "Cảnh sát: 113 | Cứu thương: 115 | Cứu hỏa: 114 | Du lịch: 0236.1022",
            color: "text-red-500 bg-red-50",
          },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-hover"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-black text-gray-900 text-base mb-2">
                {c.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-black text-gray-900 mb-4">
          Lời khuyên an toàn
        </h3>
        <div className="space-y-3">
          {[
            "Luôn giữ đồ đạc cá nhân cẩn thận tại nơi đông người.",
            "Sử dụng dịch vụ vận chuyển chính thống hoặc ứng dụng gọi xe uy tín.",
            "Kiểm tra thời tiết trước khi ra biển hoặc tham gia hoạt động ngoài trời.",
            "Lưu số điện thoại khẩn cấp và địa chỉ đại sứ quán/lãnh sự quán.",
          ].map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § 15 — ITINERARY TAB
══════════════════════════════════════════════════════════ */
function ItineraryTab({ timeline, setTimeline }) {
  const [showForm, setShowForm] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newPlace, setNewPlace] = useState("");

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newTime.trim() || !newPlace.trim()) return;
    setTimeline([
      {
        id: Date.now(),
        time: newTime,
        place: newPlace,
        desc: "Sự kiện được thêm bởi bạn.",
      },
      ...timeline,
    ]);
    setNewTime("");
    setNewPlace("");
    setShowForm(false);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto animate-fade-in-up">
      <div>
        <h2 className="text-xl font-black text-gray-900">Lịch trình của bạn</h2>
        <p className="text-sm text-gray-400 mt-0.5">Kế hoạch du lịch Đà Nẵng</p>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm animate-fade-in-up">
          <h4 className="font-black text-gray-900 mb-4">Thêm sự kiện mới</h4>
          <form onSubmit={handleAddEvent} className="space-y-3">
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <input
                type="text"
                placeholder="Thời gian (vd: 10:00)"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 text-sm"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <input
                type="text"
                placeholder="Địa điểm"
                value={newPlace}
                onChange={(e) => setNewPlace(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-gray-900 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 active:scale-95 transition-all"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
      {timeline.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-black text-gray-900 mb-2">
            Lịch trình đang trống
          </h3>
          <p className="text-gray-400 text-sm">
            Nhấn nút <strong>+</strong> để bắt đầu lên kế hoạch!
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-100 rounded-full" />
          <div className="space-y-4">
            {timeline.map((event, i) => (
              <div
                key={event.id}
                className="relative flex gap-5 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${i === 0 ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200" : "bg-white border-2 border-blue-200 text-blue-400"}`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                  <span className="text-sm font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-lg">
                    {event.time}
                  </span>
                  <h4 className="font-black text-gray-900 text-base mt-2 mb-1">
                    {event.place}
                  </h4>
                  <p className="text-sm text-gray-400">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setShowForm(!showForm)}
        className={`fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 z-40 ${showForm ? "bg-gray-500 text-white rotate-45" : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-300 hover:scale-110"}`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
