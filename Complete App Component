import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';

// --- إعداد متغيرات البيئة الخاصة بـ Firebase ---
// يرجى ملء البيانات أدناه إذا كنت ترغب بتشغيل الدردشة الحية والبيانات السحابية
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

let db = null;
let auth = null;
let firebaseEnabled = false;

// تفعيل المحرك السحابي تلقائياً في حال إضافة المفتاح بنجاح
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseEnabled = true;
  } catch (e) {
    console.warn("فشل تهيئة Firebase. سيتم التشغيل في الوضع المحلي.", e);
  }
}

const BUILDING_TYPES = {
  SKYSCRAPER: { id: 'skyscraper', name: 'ناطحة سحاب الكوميتس', cost: 120, color: 0x00f3ff, icon: '🏢', height: 4, desc: 'تعتمد كفاءتها على عدد الـ Commits' },
  PARK: { id: 'park', name: 'حديقة النجوم', cost: 50, color: 0x10b981, icon: '🌲', height: 1.2, desc: 'حديقة خضراء عصرية لنجوم مستودعاتك' },
  HOUSE: { id: 'house', name: 'بيت المستودعات (Repo)', cost: 75, color: 0xf59e0b, icon: '🏠', height: 1.8, desc: 'منزل مريح لكل مستودع برمجيات جديد' },
  LANDMARK: { id: 'landmark', name: 'بوابة الـ Pull Request', cost: 250, color: 0xec4899, icon: '⛩️', height: 3.5, desc: 'معلم حضاري يعكس الإنجازات الكبرى' },
  FACTORY: { id: 'factory', name: 'مصنع الأكواد الذكي', cost: 180, color: 0x8b5cf6, icon: '🏭', height: 2.5, desc: 'ينتج نقاطاً تلقائية مع مرور الوقت' }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('مبرمج_غامض_101');
  const [gitStats, setGitStats] = useState({
    commits: 142,
    stars: 12,
    repos: 24,
    points: 350,
    cityLevel: 1
  });
  const [isDayTime, setIsDayTime] = useState(true);
  const [activeTab, setActiveTab] = useState('build');
  const [selectedBuildingType, setSelectedBuildingType] = useState('SKYSCRAPER');
  const [cityGrid, setCityGrid] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [notification, setNotification] = useState(null);

  // مراجع الرسوميات والصوت
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshesRef = useRef({});
  const lightsRef = useRef({});
  const audioCtxRef = useRef(null);

  const triggerNotification = (msg, type = 'success') => {
    setNotification({ text: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // توليد أصوات نغمية تفاعلية ممتعة ومميزة (Web Audio Synthesizer)
  const playSound = (type) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'build') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.15); // C5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'upgrade') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392.00, now); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.08); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.16); // E5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  // إعداد قاعدة البيانات والدردشة وسجلات اللاعبين
  useEffect(() => {
    let unsubscribeUser = () => {};
    let unsubscribeChat = () => {};
    let unsubscribeLeaderboard = () => {};

    const setupAuthAndFirestore = async () => {
      if (!firebaseEnabled) {
        const localUid = 'local_user_' + Math.random().toString(36).substring(2, 9);
        setUser({ uid: localUid, isAnonymous: true });
        setUsername('مستوطن_محلي_' + Math.floor(Math.random() * 900 + 100));
        return;
      }

      try {
        await signInAnonymously(auth);

        unsubscribeUser = onAuthStateChanged(auth, async (currUser) => {
          if (currUser) {
            setUser(currUser);
            const userDocRef = doc(db, 'users', currUser.uid);
            const userSnap = await getDoc(userDocRef);
            
            let name = 'مستوطن_' + currUser.uid.substring(0, 5);
            let stats = { commits: 120, stars: 8, repos: 15, points: 500, cityLevel: 1 };
            let grid = [];

            if (userSnap.exists()) {
              const data = userSnap.data();
              name = data.username || name;
              stats = data.stats || stats;
              grid = data.grid || [];
            } else {
              await setDoc(userDocRef, {
                uid: currUser.uid,
                username: name,
                stats: stats,
                grid: grid,
                updatedAt: Date.now()
              });
            }

            setUsername(name);
            setGitStats(stats);
            setCityGrid(grid);
          }
        });

        // مراقبة الدردشة العامة الحية
        const chatQuery = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
        unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
          const fetchedMessages = [];
          snapshot.forEach((doc) => {
            fetchedMessages.push({ id: doc.id, ...doc.data() });
          });
          setMessages(fetchedMessages.slice(-40));
        });

        // مراقبة المتصدرين
        const leaderQuery = query(collection(db, 'users'));
        unsubscribeLeaderboard = onSnapshot(leaderQuery, (snapshot) => {
          const list = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              uid: data.uid,
              username: data.username || 'مستوطن مجهول',
              level: data.stats?.cityLevel || 1,
              points: data.stats?.points || 0,
              buildingCount: data.grid?.length || 0
            });
          });
          list.sort((a, b) => b.points - a.points);
          setLeaderboard(list.slice(0, 10));
        });

      } catch (err) {
        console.error("Firebase startup error", err);
      }
    };

    setupAuthAndFirestore();

    return () => {
      unsubscribeUser();
      unsubscribeChat();
      unsubscribeLeaderboard();
    };
  }, []);

  const syncCityToCloud = async (newGrid, newStats) => {
    if (!firebaseEnabled || !user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        username: username,
        stats: newStats || gitStats,
        grid: newGrid,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error("Cloud sync failed", e);
    }
  };

  // --- محرك ثلاثي الأبعاد تفاعلي كامل (Isometric 3D Engine) ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // تهيئة الألوان والضباب بناء على دورة النهار والليل
    scene.background = new THREE.Color(isDayTime ? 0x0f172a : 0x020617);
    scene.fog = new THREE.FogExp2(isDayTime ? 0x0f172a : 0x020617, 0.03);

    // كاميرا مائلة آيزومترية احترافية
    const aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    const d = 10;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: false });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // توزيع الإضاءة والظلال
    const ambientLight = new THREE.AmbientLight(isDayTime ? 0xffffff : 0x1e1b4b, isDayTime ? 0.6 : 0.3);
    scene.add(ambientLight);
    lightsRef.current.ambient = ambientLight;

    const dirLight = new THREE.DirectionalLight(isDayTime ? 0xfef08a : 0x6366f1, isDayTime ? 1.2 : 0.5);
    dirLight.position.set(15, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);
    lightsRef.current.directional = dirLight;

    // رسم الأرضية والشبكة المساعدة لبناء مدينة بمساحة $10 \times 10$ خانات
    const gridSize = 10;
    const gridHelper = new THREE.GridHelper(gridSize, gridSize, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(gridSize, gridSize);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: isDayTime ? 0x1e293b : 0x0f172a, 
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    rebuildCity3D();

    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // حركة دائرية خفيفة وتموج رائع للمباني
      Object.keys(meshesRef.current).forEach((key) => {
        const mesh = meshesRef.current[key];
        if (mesh) {
          if (mesh.userData.type === 'park') {
            mesh.rotation.y = Math.sin(elapsedTime * 0.5 + mesh.position.x) * 0.05;
          } else {
            mesh.scale.y = mesh.userData.baseScaleY + Math.sin(elapsedTime * 1.5 + mesh.position.x) * 0.015;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      const newAspect = width / height;

      cameraRef.current.left = -d * newAspect;
      cameraRef.current.right = d * newAspect;
      cameraRef.current.top = d;
      cameraRef.current.bottom = -d;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isDayTime]);

  useEffect(() => {
    rebuildCity3D();
  }, [cityGrid]);

  const rebuildCity3D = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    Object.keys(meshesRef.current).forEach((key) => {
      scene.remove(meshesRef.current[key]);
    });
    meshesRef.current = {};

    cityGrid.forEach((item) => {
      const { id, x, z, type, level } = item;
      const buildConfig = BUILDING_TYPES[type.toUpperCase()] || BUILDING_TYPES.SKYSCRAPER;
      
      const buildingGroup = new THREE.Group();
      buildingGroup.position.set(x - 4.5, 0, z - 4.5);
      buildingGroup.userData = { id, type, baseScaleY: 1 };

      const height = buildConfig.height * (1 + (level - 1) * 0.25);
      
      if (type === 'park') {
        const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.4, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.2;
        trunk.castShadow = true;
        buildingGroup.add(trunk);

        const leavesGeo = new THREE.DodecahedronGeometry(0.5, 1);
        const leavesMat = new THREE.MeshStandardMaterial({ 
          color: buildConfig.color, 
          roughness: 0.9,
          flatShading: true
        });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 0.7;
        leaves.castShadow = true;
        buildingGroup.add(leaves);

        const baseGeo = new THREE.BoxGeometry(0.8, 0.08, 0.8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x065f46 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.04;
        buildingGroup.add(base);
      } else {
        const mainGeo = new THREE.BoxGeometry(0.7, height, 0.7);
        const mainMat = new THREE.MeshStandardMaterial({
          color: buildConfig.color,
          roughness: 0.2,
          metalness: 0.8,
          emissive: isDayTime ? 0x000000 : buildConfig.color,
          emissiveIntensity: isDayTime ? 0.0 : 0.4
        });
        const mainMesh = new THREE.Mesh(mainGeo, mainMat);
        mainMesh.position.y = height / 2;
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        buildingGroup.add(mainMesh);

        const roofGeo = new THREE.BoxGeometry(0.8, 0.1, 0.8);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = height + 0.05;
        buildingGroup.add(roof);

        if (level >= 2 || type === 'skyscraper') {
          const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4);
          const antennaMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const antenna = new THREE.Mesh(antennaGeo, antennaMat);
          antenna.position.y = height + 0.35;
          buildingGroup.add(antenna);

          const tipGeo = new THREE.SphereGeometry(0.06, 6, 6);
          const tipMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
          const tip = new THREE.Mesh(tipGeo, tipMat);
          tip.position.y = height + 0.65;
          buildingGroup.add(tip);
        }
      }

      scene.add(buildingGroup);
      meshesRef.current[id] = buildingGroup;
    });
  };

  const handleGitHubSync = () => {
    playSound('upgrade');
    const extraCommits = Math.floor(Math.random() * 20 + 5);
    const extraStars = Math.floor(Math.random() * 3 + 1);
    const extraRepos = Math.floor(Math.random() * 2 + 1);
    const gainedPoints = extraCommits * 3 + extraStars * 15 + extraRepos * 25;

    const updatedStats = {
      ...gitStats,
      commits: gitStats.commits + extraCommits,
      stars: gitStats.stars + extraStars,
      repos: gitStats.repos + extraRepos,
      points: gitStats.points + gainedPoints,
      cityLevel: Math.floor((gitStats.points + gainedPoints) / 500) + 1
    };

    setGitStats(updatedStats);
    syncCityToCloud(cityGrid, updatedStats);
    triggerNotification(`تمت المزامنة وحصلت على ${gainedPoints} عملة رقمية! 💻`);
  };

  const buyAndPlaceBuilding = (x, z) => {
    const config = BUILDING_TYPES[selectedBuildingType];
    
    if (gitStats.points < config.cost) {
      playSound('error');
      triggerNotification('العملات الرقمية غير كافية لشراء هذا المعلم!', 'error');
      return;
    }

    const spotTaken = cityGrid.some((item) => item.x === x && item.z === z);
    if (spotTaken) {
      playSound('error');
      triggerNotification('الموقع مشغول بالفعل بمبنى آخر!', 'error');
      return;
    }

    playSound('build');
    const newBuilding = {
      id: `build_${Date.now()}`,
      x,
      z,
      type: config.id,
      level: 1,
      createdAt: Date.now()
    };

    const nextGrid = [...cityGrid, newBuilding];
    const nextStats = { ...gitStats, points: gitStats.points - config.cost };

    setCityGrid(nextGrid);
    setGitStats(nextStats);
    syncCityToCloud(nextGrid, nextStats);
    triggerNotification(`تم بنجاح تشييد ${config.name}! 🏗️`);
  };

  const upgradeBuilding = (id) => {
    const target = cityGrid.find((b) => b.id === id);
    if (!target) return;

    const upgradeCost = Math.floor(BUILDING_TYPES[target.type.toUpperCase()].cost * 0.7);
    if (gitStats.points < upgradeCost) {
      playSound('error');
      triggerNotification('العملات غير كافية لترقية هذا المبنى!', 'error');
      return;
    }

    playSound('upgrade');
    const nextGrid = cityGrid.map((item) => {
      if (item.id === id) {
        return { ...item, level: item.level + 1 };
      }
      return item;
    });

    const nextStats = { ...gitStats, points: gitStats.points - upgradeCost };
    setCityGrid(nextGrid);
    setGitStats(nextStats);
    syncCityToCloud(nextGrid, nextStats);
    triggerNotification(`تمت ترقية المبنى إلى المستوى ${target.level + 1}! 🚀`);
  };

  const demolishBuilding = (id) => {
    playSound('error');
    const nextGrid = cityGrid.filter((b) => b.id !== id);
    setCityGrid(nextGrid);
    syncCityToCloud(nextGrid, gitStats);
    triggerNotification('تم هدم المعلم وإخلاء الأرض لخططك القادمة.');
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgText = chatInput;
    setChatInput('');

    const newMsg = {
      senderId: user?.uid || 'offline',
      username: username,
      text: msgText,
      timestamp: Date.now()
    };

    if (firebaseEnabled && user) {
      try {
        await addDoc(collection(db, 'messages'), newMsg);
      } catch (err) {
        console.error("فشل إرسال الرسالة إلى السحابة", err);
      }
    } else {
      setMessages((prev) => [...prev, { id: 'local_' + Date.now(), ...newMsg }]);
    }
  };

  const changeProfileName = async () => {
    const newName = prompt("أدخل اسم المستوطن الجديد:", username);
    if (!newName || !newName.trim()) return;

    setUsername(newName.trim());
    if (firebaseEnabled && user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { username: newName.trim() }, { merge: true });
        triggerNotification('تم تحديث هويتك في اللعبة!');
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden antialiased">
      
      {/* رأس الصفحة الفاخر بتصميم Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <span className="text-3xl">🌆</span>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">
              GITHUB CITY 3D
            </h1>
            <p className="text-xs text-slate-400">حوّل أكوادك البرمجية إلى حضارة ثلاثية أبعاد</p>
          </div>
        </div>

        {/* عدادات العملات والنشاط */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center space-x-2 space-x-reverse">
            <span className="text-yellow-400">🪙</span>
            <div>
              <div className="text-xs text-slate-400">العملة الرقمية</div>
              <div className="font-bold text-yellow-300">{gitStats.points} G-Coins</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center space-x-2 space-x-reverse">
            <span className="text-sky-400">⭐</span>
            <div>
              <div className="text-xs text-slate-400">النجوم المكتسبة</div>
              <div className="font-bold text-sky-200">{gitStats.stars} Stars</div>
            </div>
          </div>

          <button 
            onClick={handleGitHubSync}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <span>🔄</span> مزامنة GitHub
          </button>
        </div>
      </header>

      {/* لوحة عرض الإشعارات الذكية */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 flex items-center space-x-2 space-x-reverse backdrop-blur-md ${
          notification.type === 'error' ? 'bg-rose-950/90 border border-rose-800 text-rose-200' : 'bg-emerald-950/90 border border-emerald-800 text-emerald-200'
        }`}>
          <span>{notification.type === 'error' ? '⚠️' : '✅'}</span>
          <span className="text-sm font-semibold">{notification.text}</span>
        </div>
      )}

      {/* لوحة العمل الرئيسية للعبة */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-80px)]">
        
        {/* القسم الأيسر: محرك الرسوميات ثلاثي الأبعاد Isometric Canvas */}
        <section className="col-span-1 lg:col-span-8 relative bg-slate-900 border-r border-slate-800 flex flex-col h-full min-h-[400px]">
          
          {/* خلفية الكانفاس الحقيقي */}
          <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

          {/* تراكب تفاعلي: أدوات التحكم وتعديل زوايا المشهد */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl flex items-center space-x-4 space-x-reverse shadow-xl">
              <span className="text-xs font-bold text-slate-400">دورة الإضاءة:</span>
              <button 
                onClick={() => { playSound('click'); setIsDayTime(!isDayTime); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDayTime ? 'bg-sky-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDayTime ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm">{isDayTime ? '☀️ نهار رقمي' : '🌙 ليل النيون'}</span>
            </div>

            {/* إرشادات تحديد إحداثيات البناء */}
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-3 rounded-2xl max-w-xs shadow-xl">
              <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <span>🏗️</span> شبكة التخطيط الرقمي للمستوطنة
              </h4>
              <p className="text-[11px] text-slate-400">انقر على الخانات في الأسفل لشراء المعلم النشط ووضعه بالمشهد ثلاثي الأبعاد.</p>
            </div>
          </div>

          {/* شبكة النقر التفاعلي السريعة لبناء الأبنية */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-4 rounded-3xl shadow-2xl z-10 overflow-x-auto">
            <div className="flex items-center justify-between mb-3 min-w-[500px]">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-lg">🛠️</span>
                <span className="text-sm font-bold text-slate-200">اختر المعلم المراد تشييده:</span>
              </div>
              <div className="text-xs text-indigo-400 font-mono">
                المبنى النشط: {BUILDING_TYPES[selectedBuildingType].name} ({BUILDING_TYPES[selectedBuildingType].cost}🪙)
              </div>
            </div>

            {/* أزرار تحديد أنواع الأبنية */}
            <div className="grid grid-cols-5 gap-2 min-w-[550px] mb-4">
              {Object.keys(BUILDING_TYPES).map((key) => {
                const item = BUILDING_TYPES[key];
                return (
                  <button
                    key={key}
                    onClick={() => { playSound('click'); setSelectedBuildingType(key); }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col ${
                      selectedBuildingType === key 
                        ? 'bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border-indigo-500 shadow-md shadow-indigo-500/10' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{item.icon}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        gitStats.points >= item.cost ? 'bg-emerald-950/50 text-emerald-400' : 'bg-rose-950/50 text-rose-400'
                      }`}>
                        {item.cost}🪙
                      </span>
                    </div>
                    <span className="text-xs font-bold block truncate">{item.name}</span>
                    <span className="text-[9px] text-slate-400 truncate">{item.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* تخطيط الشبكة الافتراضي (10x10) للبناء */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-400 mb-2">انقر لوضع المبنى في أي مربع فارغ:</div>
              <div className="grid grid-cols-10 gap-1 p-2 bg-slate-900/80 rounded-xl border border-slate-800 w-fit">
                {Array.from({ length: 10 }).map((_, z) => (
                  <React.Fragment key={z}>
                    {Array.from({ length: 10 }).map((_, x) => {
                      const placed = cityGrid.find((b) => b.x === x && b.z === z);
                      return (
                        <button
                          key={`${x}-${z}`}
                          onMouseEnter={() => setHoveredTile({ x, z })}
                          onMouseLeave={() => setHoveredTile(null)}
                          onClick={() => buyAndPlaceBuilding(x, z)}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition-all relative group ${
                            placed 
                              ? 'bg-indigo-950/60 border border-indigo-700 text-slate-200' 
                              : 'bg-slate-800/40 hover:bg-sky-900/60 border border-slate-800/80 hover:border-sky-500'
                          }`}
                        >
                          {placed ? BUILDING_TYPES[placed.type.toUpperCase()]?.icon || '🏢' : ''}
                          
                          {/* توليد تلميح (Tooltip) عائم عند وضع الفأرة على مربع مبني */}
                          {placed && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 text-left w-36 z-30 shadow-2xl">
                              <span className="font-bold text-[11px] block">{BUILDING_TYPES[placed.type.toUpperCase()]?.name}</span>
                              <span className="text-[10px] text-slate-400 block mb-1">المستوى: {placed.level}</span>
                              <div className="flex justify-between items-center mt-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); upgradeBuilding(placed.id); }}
                                  className="bg-indigo-600 hover:bg-indigo-500 px-1.5 py-0.5 rounded text-[9px] text-white"
                                >
                                  ترقية (+{Math.floor(BUILDING_TYPES[placed.type.toUpperCase()].cost * 0.7)}🪙)
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); demolishBuilding(placed.id); }}
                                  className="text-rose-400 hover:underline text-[9px]"
                                >
                                  هدم
                                </button>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* القسم الأيمن: التبويبات المتطورة للدردشة العامة والمستوطنين */}
        <section className="col-span-1 lg:col-span-4 flex flex-col h-full bg-slate-950 overflow-hidden">
          
          {/* تبويبات التحكم */}
          <div className="flex border-b border-slate-800 bg-slate-900/40 p-2 gap-1">
            {[
              { id: 'build', label: 'المدينة 🏙️' },
              { id: 'chat', label: 'الدردشة 💬' },
              { id: 'leaderboard', label: 'المتصدرين 🏆' },
              { id: 'stats', label: 'الملف الشخصي 👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { playSound('click'); setActiveTab(tab.id); }}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-slate-800 text-sky-400 border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* تبويب: تفاصيل المدينة والأبنية النشطة */}
          {activeTab === 'build' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <span>🏙️</span> حالة مستوطنتك الرقمية
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl text-center">
                  <span className="text-slate-400 text-xs block">مستوى مدينتك</span>
                  <span className="text-2xl font-black text-sky-400">{gitStats.cityLevel}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl text-center">
                  <span className="text-slate-400 text-xs block">إجمالي المعالم</span>
                  <span className="text-2xl font-black text-emerald-400">{cityGrid.length}</span>
                </div>
              </div>

              {/* قائمة الأبنية المشيدة حالياً وتفاصيلها */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400">قائمة الأبنية في مدينتك:</h4>
                {cityGrid.length === 0 ? (
                  <div className="bg-slate-900/30 border border-dashed border-slate-800 p-6 rounded-2xl text-center text-slate-500 text-xs">
                    لم تشيد أي مبنى بعد. اختر مبنى من الأسفل وضعه في الشبكة للبدء!
                  </div>
                ) : (
                  cityGrid.map((building) => {
                    const info = BUILDING_TYPES[building.type.toUpperCase()] || BUILDING_TYPES.SKYSCRAPER;
                    const upgradeCost = Math.floor(info.cost * 0.7);
                    return (
                      <div key={building.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <span className="text-2xl">{info.icon}</span>
                          <div>
                            <span className="font-bold text-xs block">{info.name}</span>
                            <span className="text-[10px] text-slate-400">مستوى: {building.level} | موقع: ({building.x}, {building.z})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => upgradeBuilding(building.id)}
                            className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/50 text-[10px] px-2.5 py-1 rounded-lg text-indigo-300"
                          >
                            ترقية ({upgradeCost}🪙)
                          </button>
                          <button
                            onClick={() => demolishBuilding(building.id)}
                            className="bg-rose-950/40 hover:bg-rose-950 border border-rose-900/50 text-[10px] px-2.5 py-1 rounded-lg text-rose-300"
                          >
                            هدم
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* تبويب: الدردشة العامة للمستوطنين Global Live Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* ترويسة الدردشة */}
              <div className="bg-slate-900/40 p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    غرفة الدردشة الكونية العامة
                  </h3>
                  <p className="text-[11px] text-slate-400">تبادل النصائح والتحية البرمجية مع اللاعبين مباشرة</p>
                </div>
                <button 
                  onClick={changeProfileName}
                  className="text-xs text-sky-400 hover:underline"
                >
                  تعديل اسمي
                </button>
              </div>

              {/* نافذة الرسائل */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col-reverse">
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${isMe ? 'mr-auto items-end' : 'ml-auto items-start'}`}
                      >
                        <div className="flex items-center space-x-1.5 space-x-reverse mb-0.5">
                          <span className="text-[10px] font-bold text-slate-400">{msg.username}</span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`p-3 rounded-2xl text-xs break-words shadow-md ${
                          isMe 
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none' 
                            : 'bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <div className="text-center p-8 text-slate-600 text-xs">
                      لا يوجد رسائل بعد. كن أول من يتحدث ويرحب بالمستوطنين الآخرين! 👋
                    </div>
                  )}
                </div>
              </div>

              {/* حقل إدخال الرسائل والمشاركة */}
              <form onSubmit={sendChatMessage} className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اكتب رسالتك البرمجية هنا..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  إرسال 🚀
                </button>
              </form>
            </div>
          )}

          {/* تبويب: لوحة المتصدرين Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <span>🏆</span> قمة المطورين والمستوطنين
              </h3>
              <p className="text-xs text-slate-400">قائمة بأكثر المدن تطوراً بناءً على النقاط الإجمالية لنشاط GitHub:</p>

              <div className="space-y-2">
                {leaderboard.map((player, index) => {
                  const isCurrentPlayer = player.uid === user?.uid;
                  return (
                    <div 
                      key={player.uid} 
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isCurrentPlayer 
                          ? 'bg-indigo-950/30 border-indigo-500 shadow-md' 
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-amber-400 text-slate-950' :
                          index === 1 ? 'bg-slate-300 text-slate-950' :
                          index === 2 ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-bold text-xs block">{player.username}</span>
                          <span className="text-[10px] text-slate-400">مستوى المدينة: {player.level} | {player.buildingCount} معلم</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-yellow-400">{player.points}🪙</span>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && (
                  <div className="text-center text-slate-600 p-8 text-xs">
                    بانتظار مزامنة بيانات المستوطنين لعرض قائمة الشرف...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* تبويب: الملف الشخصي وإحصائيات GitHub */}
          {activeTab === 'stats' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="text-center space-y-2">
                <div className="text-5xl">👨‍💻</div>
                <h3 className="text-lg font-bold text-slate-200">{username}</h3>
                <span className="text-xs bg-indigo-950 border border-indigo-800 text-indigo-300 px-3 py-1 rounded-full">
                  معرّف المستوطن: {user?.uid ? user.uid.substring(0, 10) + '...' : 'غير مسجل'}
                </span>
                <div className="pt-2">
                  <button 
                    onClick={changeProfileName}
                    className="text-xs bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700"
                  >
                    تغيير اسم العرض ✏️
                  </button>
                </div>
              </div>

              <hr className="border-slate-800" />

              <h4 className="text-xs font-bold text-slate-400">النشاط البرمجي الحالي (GitHub):</h4>
              <div className="space-y-3">
                <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl flex justify-between items-center">
                  <span className="text-xs text-slate-300">الـ Commits المنفذة</span>
                  <span className="font-mono font-bold text-sky-400">{gitStats.commits}</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl flex justify-between items-center">
                  <span className="text-xs text-slate-300">الـ Repositories المكتملة</span>
                  <span className="font-mono font-bold text-amber-500">{gitStats.repos}</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl flex justify-between items-center">
                  <span className="text-xs text-slate-300">النجوم ⭐ الممنوحة لك</span>
                  <span className="font-mono font-bold text-teal-400">{gitStats.stars}</span>
                </div>
              </div>

              <div className="bg-indigo-950/35 border border-indigo-800/40 p-4 rounded-2xl">
                <h5 className="text-xs font-bold text-indigo-300 mb-1">💡 هل تعلم؟</h5>
                <p className="text-[11px] text-indigo-200">كلما زاد نشاطك الفعلي على GitHub، تزداد قوة توليد النقاط التلقائية للمصانع والأبنية لتشييد مدينتك الحلم بشكل أسرع!</p>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* شريط الإحصائيات السريعة السفلي */}
      <footer className="bg-slate-900/40 border-t border-slate-800 px-6 py-2 flex justify-between items-center text-[11px] text-slate-500 z-40">
        <div>حالة الاتصال السحابي بالمدينة: {firebaseEnabled ? '🟢 متصل بالشبكة الحية' : '🟡 وضع العمل الفردي الأوفلاين'}</div>
        <div>جميع الحقوق محفوظة © GitHub City 3D - 2026</div>
      </footer>
    </div>
  );
}
