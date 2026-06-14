"use strict";

const DEFAULT_BOARD_SIZE = 40;
const MIN_BOARD_SIZE = 24;
const MAX_BOARD_SIZE = 200;
const SAVE_KEY = "sugoroku-backpack-battle-save";
const ONLINE_CONFIG_KEY = "sugoroku-firebase-config";
const ONLINE_SEAT_KEY = "sugoroku-online-seat";
const FIREBASE_SDK_VERSION = "10.12.5";
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCXyreqDjZXIWnZqWZShw1yjwubHduqCoc",
  authDomain: "createcardgame-8edbf.firebaseapp.com",
  databaseURL: "https://createcardgame-8edbf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "createcardgame-8edbf",
  storageBucket: "createcardgame-8edbf.firebasestorage.app",
  messagingSenderId: "173024784980",
  appId: "1:173024784980:web:606d80ee258239d656f3c1",
  measurementId: "G-DDB5KGS7K3",
};

const rarityOrder = ["white", "green", "blue", "purple", "gold"];
const rarityNames = {
  white: "白",
  green: "緑",
  blue: "青",
  purple: "紫",
  gold: "金",
};

const rarityWeights = {
  white: 48,
  green: 28,
  blue: 15,
  purple: 7,
  gold: 2,
};

const spaceTypes = {
  start: { label: "START", color: "#5f746c" },
  plus: { label: "プラス", color: "#3ca370" },
  minus: { label: "マイナス", color: "#d4453f" },
  lucky: { label: "ラッキー", color: "#d7a12b" },
  shop: { label: "ショップ", color: "#3278c6" },
  forge: { label: "鍛造", color: "#8758b8" },
  combat: { label: "戦闘", color: "#1f2937" },
  goal: { label: "人生終了マス", color: "linear-gradient(135deg, #ff8ab3, #ffa7a0, #b7f7c4, #8bd9ff, #c7a8ff)" },
};

const playerColors = ["#d4453f", "#137c6b", "#3278c6", "#8758b8"];
const avatarOptions = ["😀", "😎", "🤠", "🧙", "🥷", "🤖", "👑", "⭐", "🍀", "🔥", "⚡", "🎲"];

const itemCatalog = [
  {
    id: "rusty_sword",
    name: "錆びた剣",
    rarity: "white",
    type: "attack",
    w: 1,
    h: 2,
    price: 35,
    sell: 12,
    damage: 5,
    interval: 2400,
    description: "戦闘中、一定間隔で相手を攻撃する。",
  },
  {
    id: "coin_pouch",
    name: "小銭袋",
    rarity: "white",
    type: "support",
    w: 1,
    h: 1,
    price: 28,
    sell: 10,
    income: 10,
    description: "自分の行動ターン開始時にお金を得る。",
  },
  {
    id: "wooden_shield",
    name: "木の盾",
    rarity: "white",
    type: "defense",
    w: 2,
    h: 1,
    price: 30,
    sell: 11,
    shield: 5,
    description: "戦闘開始時にシールドを得る。",
  },
  {
    id: "lucky_clover",
    name: "幸運クローバー",
    rarity: "white",
    type: "support",
    w: 1,
    h: 1,
    price: 32,
    sell: 12,
    income: 6,
    shield: 2,
    description: "少しお金とシールドを得る小さなお守り。",
  },
  {
    id: "quick_dagger",
    name: "早業ダガー",
    rarity: "green",
    type: "attack",
    w: 1,
    h: 1,
    price: 58,
    sell: 24,
    damage: 4,
    interval: 1400,
    description: "軽く素早く攻撃する。",
  },
  {
    id: "guard_glove",
    name: "守りの手袋",
    rarity: "green",
    type: "defense",
    w: 1,
    h: 2,
    price: 60,
    sell: 24,
    shield: 10,
    description: "戦闘開始時にまとまったシールドを得る。",
  },
  {
    id: "herb_kit",
    name: "薬草キット",
    rarity: "green",
    type: "support",
    w: 2,
    h: 1,
    price: 62,
    sell: 25,
    heal: 5,
    interval: 3600,
    description: "戦闘中、一定間隔でHPを回復する。",
  },
  {
    id: "poison_vial",
    name: "毒の小瓶",
    rarity: "green",
    type: "debuff",
    w: 1,
    h: 1,
    price: 64,
    sell: 26,
    poison: 2,
    interval: 2600,
    description: "相手に防ぎにくい継続ダメージを与える。",
  },
  {
    id: "merchant_badge",
    name: "商人バッジ",
    rarity: "green",
    type: "support",
    w: 1,
    h: 1,
    price: 70,
    sell: 28,
    income: 16,
    description: "行動ターン開始時の収入を増やす。",
  },
  {
    id: "iron_axe",
    name: "鉄の斧",
    rarity: "blue",
    type: "attack",
    w: 2,
    h: 2,
    price: 105,
    sell: 46,
    damage: 11,
    interval: 3200,
    description: "遅いが重い一撃を放つ。",
  },
  {
    id: "ice_wand",
    name: "氷結ワンド",
    rarity: "blue",
    type: "debuff",
    w: 1,
    h: 2,
    price: 118,
    sell: 52,
    damage: 7,
    weaken: 0.08,
    interval: 3000,
    description: "軽い攻撃と攻撃力低下を併せ持つ。",
  },
  {
    id: "focus_lens",
    name: "集中レンズ",
    rarity: "blue",
    type: "booster",
    w: 1,
    h: 1,
    price: 95,
    sell: 42,
    boost: 0.11,
    description: "隣接する攻撃アイテムの威力を上げる。",
  },
  {
    id: "silver_bank",
    name: "銀の金庫",
    rarity: "blue",
    type: "support",
    w: 2,
    h: 1,
    price: 112,
    sell: 48,
    income: 25,
    shield: 6,
    description: "ターン開始時のお金と戦闘開始時シールドを得る。",
  },
  {
    id: "repair_anvil",
    name: "修理金床",
    rarity: "blue",
    type: "support",
    w: 2,
    h: 1,
    price: 120,
    sell: 54,
    heal: 4,
    shield: 8,
    interval: 4200,
    description: "戦闘中に回復し、開始時シールドも得る。",
  },
  {
    id: "storm_staff",
    name: "嵐の杖",
    rarity: "purple",
    type: "attack",
    w: 1,
    h: 3,
    price: 175,
    sell: 82,
    damage: 8,
    interval: 1500,
    description: "高頻度で魔法攻撃を行う。",
  },
  {
    id: "hex_charm",
    name: "呪紋チャーム",
    rarity: "purple",
    type: "debuff",
    w: 1,
    h: 1,
    price: 160,
    sell: 74,
    weaken: 0.16,
    description: "相手の攻撃力を下げる。",
  },
  {
    id: "moon_amulet",
    name: "月光アミュレット",
    rarity: "purple",
    type: "support",
    w: 1,
    h: 2,
    price: 168,
    sell: 78,
    heal: 7,
    income: 14,
    interval: 3800,
    description: "回復と収入を両立する高級なお守り。",
  },
  {
    id: "royal_banner",
    name: "王家の旗",
    rarity: "purple",
    type: "booster",
    w: 2,
    h: 2,
    price: 190,
    sell: 88,
    boostAll: 0.08,
    income: 18,
    description: "全攻撃アイテムを強化し、お金も得る。",
  },
  {
    id: "sun_blade",
    name: "太陽剣",
    rarity: "gold",
    type: "attack",
    w: 2,
    h: 2,
    price: 320,
    sell: 155,
    damage: 18,
    interval: 2300,
    healOnHit: 4,
    description: "大ダメージを与え、命中時に少し回復する。",
  },
  {
    id: "phoenix_feather",
    name: "不死鳥の羽",
    rarity: "gold",
    type: "support",
    w: 1,
    h: 2,
    price: 330,
    sell: 160,
    heal: 11,
    shield: 18,
    interval: 3600,
    description: "強力な回復とシールドで粘り強く戦う。",
  },
  {
    id: "dragon_heart",
    name: "竜心炉",
    rarity: "gold",
    type: "booster",
    w: 2,
    h: 2,
    price: 360,
    sell: 170,
    boostAll: 0.16,
    shield: 20,
    description: "全攻撃を大きく強化し、戦闘開始時シールドを得る。",
  },
];

const itemIcons = {
  rusty_sword: "🗡️",
  coin_pouch: "💰",
  wooden_shield: "🛡️",
  lucky_clover: "🍀",
  quick_dagger: "🔪",
  guard_glove: "🧤",
  herb_kit: "🌿",
  poison_vial: "🧪",
  merchant_badge: "🏷️",
  iron_axe: "🪓",
  ice_wand: "🧊",
  focus_lens: "🔍",
  silver_bank: "🏦",
  repair_anvil: "⚒️",
  storm_staff: "🌩️",
  hex_charm: "🔮",
  moon_amulet: "🌙",
  royal_banner: "🚩",
  sun_blade: "☀️",
  phoenix_feather: "🪶",
  dragon_heart: "💎",
};

const boardPattern = [
  "start",
  "plus",
  "shop",
  "minus",
  "lucky",
  "plus",
  "combat",
  "forge",
  "plus",
  "minus",
  "lucky",
  "shop",
  "plus",
  "combat",
  "minus",
  "forge",
  "plus",
  "lucky",
  "shop",
  "minus",
  "combat",
  "plus",
  "forge",
  "lucky",
  "minus",
  "shop",
  "plus",
  "combat",
  "forge",
  "plus",
  "lucky",
  "minus",
  "shop",
  "combat",
  "plus",
  "forge",
  "minus",
  "lucky",
  "plus",
  "goal",
];

const randomSpaceWeights = [
  ["plus", 42],
  ["minus", 15],
  ["shop", 13],
  ["lucky", 9],
  ["combat", 9],
  ["forge", 12],
];

const HAPPENING_CHANCE = 0.16;
const ITEM_GAIN_EFFECT_MS = 1450;
const BATTLE_ACTION_EFFECT_MS = 1000;
const SPECIAL_DICE = {
  d12: {
    id: "d12",
    name: "十二面サイコロ",
    sides: 12,
    uses: 3,
    price: 140,
    image: "./assets/d12-dice.png",
  },
};
const happenings = {
  minefield: { label: "地雷原", icon: "💥", className: "happening-minefield" },
  clover: { label: "クローバー", icon: "🍀", className: "happening-clover" },
  tax: { label: "脱税発覚", icon: "🚨", className: "happening-tax" },
  sideJob: { label: "副業マスター山下", icon: "💼", className: "happening-sidejob" },
};

let state = newGameState();
let selectedItem = null;
let selectedSynthesis = [];
let placementPreview = null;
let touchDrag = null;
let dragSource = null;
let isAnimatingMove = false;
let uiEffects = {
  space: null,
  happening: null,
};
let battleTimerHandle = null;
let battleTickHandle = null;
let renderTimerHandle = null;
let resizeRenderHandle = null;
let online = {
  enabled: false,
  ready: false,
  clientId: localStorage.getItem("sugoroku-client-id") || uid(),
  roomId: "",
  playerId: Number(localStorage.getItem(ONLINE_SEAT_KEY)) || null,
  isHost: false,
  isApplyingRemote: false,
  isPushing: false,
  pushQueued: false,
  localDirtyUntil: 0,
  lastAppliedVersion: 0,
  saveTimer: null,
  modules: null,
  app: null,
  auth: null,
  db: null,
  roomRef: null,
  unsubscribe: null,
};
localStorage.setItem("sugoroku-client-id", online.clientId);

const els = {
  onlinePanel: document.getElementById("onlinePanel"),
  onlineStatus: document.getElementById("onlineStatus"),
  firebaseConfigInput: document.getElementById("firebaseConfigInput"),
  roomCodeInput: document.getElementById("roomCodeInput"),
  createRoomButton: document.getElementById("createRoomButton"),
  joinRoomButton: document.getElementById("joinRoomButton"),
  leaveRoomButton: document.getElementById("leaveRoomButton"),
  seatSelect: document.getElementById("seatSelect"),
  onlineHelp: document.getElementById("onlineHelp"),
  setupPanel: document.getElementById("setupPanel"),
  playerCountGroup: document.getElementById("playerCountGroup"),
  boardSizeInput: document.getElementById("boardSizeInput"),
  boardSizeValue: document.getElementById("boardSizeValue"),
  nameFields: document.getElementById("nameFields"),
  startGameButton: document.getElementById("startGameButton"),
  boardWrap: document.querySelector(".board-wrap"),
  boardGrid: document.getElementById("boardGrid"),
  legend: document.getElementById("legend"),
  phaseBadge: document.getElementById("phaseBadge"),
  eventCounter: document.getElementById("eventCounter"),
  statusPanel: document.getElementById("statusPanel"),
  playersList: document.getElementById("playersList"),
  turnTitle: document.getElementById("turnTitle"),
  diceFace: document.getElementById("diceFace"),
  actionArea: document.getElementById("actionArea"),
  editorSelect: document.getElementById("editorSelect"),
  editLock: document.getElementById("editLock"),
  stashList: document.getElementById("stashList"),
  trashZone: document.getElementById("trashZone"),
  backpackGrid: document.getElementById("backpackGrid"),
  itemDetail: document.getElementById("itemDetail"),
  shopPanel: document.getElementById("shopPanel"),
  shopTitle: document.getElementById("shopTitle"),
  shopContent: document.getElementById("shopContent"),
  battlePanel: document.getElementById("battlePanel"),
  battleTimer: document.getElementById("battleTimer"),
  battleArena: document.getElementById("battleArena"),
  logList: document.getElementById("logList"),
  topActions: document.querySelector(".top-actions"),
  saveButton: document.getElementById("saveButton"),
  loadButton: document.getElementById("loadButton"),
  resetButton: document.getElementById("resetButton"),
  clearLogButton: document.getElementById("clearLogButton"),
};

function newGameState() {
  const board = createBoardPattern(DEFAULT_BOARD_SIZE);
  return {
    phase: "setup",
    setupCount: 3,
    boardSize: DEFAULT_BOARD_SIZE,
    board,
    branches: createBoardBranches(board),
    names: ["プレイヤー1", "プレイヤー2", "プレイヤー3", "プレイヤー4"],
    avatars: ["😀", "😎", "🤠", "🧙"],
    players: [],
    orderIndex: 0,
    currentIndex: 0,
    editorPlayerId: null,
    pendingShop: [],
    pendingShopDice: [],
    battle: null,
    winnerId: null,
    syncVersion: 0,
    effects: {
      itemGains: [],
      battleActions: [],
    },
    nextEventTurn: 1,
    log: [],
  };
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function weightedChoice(entries) {
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);
  let roll = Math.random() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function ensureEffects(targetState = state) {
  if (!targetState.effects || typeof targetState.effects !== "object") {
    targetState.effects = { itemGains: [], battleActions: [] };
  }
  if (!Array.isArray(targetState.effects.itemGains)) {
    targetState.effects.itemGains = [];
  }
  if (!Array.isArray(targetState.effects.battleActions)) {
    targetState.effects.battleActions = [];
  }
  targetState.effects.itemGains = targetState.effects.itemGains.slice(-16);
  targetState.effects.battleActions = targetState.effects.battleActions.slice(-24);
  return targetState.effects;
}

function createBoardPattern(size = DEFAULT_BOARD_SIZE) {
  const safeSize = clamp(Number(size) || DEFAULT_BOARD_SIZE, MIN_BOARD_SIZE, MAX_BOARD_SIZE);
  const board = ["start"];
  for (let index = 1; index < safeSize - 1; index += 1) {
    const weights = index < 14
      ? randomSpaceWeights.filter(([type]) => type !== "combat" && type !== "forge")
      : randomSpaceWeights;
    board.push(weightedChoice(weights));
  }
  board.push("goal");
  ensureMinimumSpaces(board);
  return board;
}

function createBoardBranches(board) {
  const length = Array.isArray(board) ? board.length : Number(board) || DEFAULT_BOARD_SIZE;
  const count = clamp(Math.floor(length / 45), 1, 4);
  const branches = [];
  const used = new Set();
  for (let index = 0; index < count; index += 1) {
    const startMin = Math.max(14, Math.floor(length * 0.18));
    const startMax = Math.max(startMin, length - 8);
    let from = rand(startMin, startMax);
    let guard = 0;
    while (used.has(from) && guard < 20) {
      from = rand(startMin, startMax);
      guard += 1;
    }
    used.add(from);
    const branchLength = rand(3, 5);
    branches.push({
      id: `branch-${from}`,
      from,
      to: clamp(from + branchLength + 1, 1, length - 1),
      side: index % 2 === 0 ? "top" : "bottom",
      spaces: Array.from({ length: branchLength }, (_, branchIndex) => {
        if (branchIndex === branchLength - 1) return weightedChoice([["plus", 55], ["lucky", 25], ["forge", 12], ["shop", 8]]);
        return weightedChoice(randomSpaceWeights.filter(([type]) => type !== "combat"));
      }),
    });
  }
  return branches.sort((a, b) => a.from - b.from);
}

function ensureMinimumSpaces(board) {
  const minimums = {
    plus: Math.ceil(board.length * 0.26),
    shop: Math.max(3, Math.floor(board.length / 13)),
    lucky: Math.max(2, Math.floor(board.length / 24)),
    combat: Math.max(2, Math.floor(board.length / 24)),
    forge: Math.max(2, Math.floor(board.length / 18)),
  };
  Object.entries(minimums).forEach(([type, minimum]) => {
    while (countSpaces(board, type) < minimum) {
      const index = type === "combat" || type === "forge" ? rand(14, board.length - 2) : rand(1, board.length - 2);
      board[index] = type;
    }
  });
}

function sanitizeBoard(board) {
  if (!Array.isArray(board)) return board;
  for (let index = 1; index < Math.min(14, board.length - 1); index += 1) {
    if (board[index] === "forge" || board[index] === "combat") {
      board[index] = weightedChoice(randomSpaceWeights.filter(([type]) => type !== "combat" && type !== "forge"));
    }
  }
  return board;
}

function sanitizeBranches(branches, boardLength = activeBoard().length) {
  if (!Array.isArray(branches)) return branches;
  return branches
    .filter((branch) => Number(branch.from) >= 14)
    .map((branch) => ({
      ...branch,
      id: branch.id || `branch-${Number(branch.from)}`,
      from: Number(branch.from),
      to: clamp(Number(branch.to) || Number(branch.from) + (branch.spaces?.length || 3) + 1, Number(branch.from) + 1, boardLength - 1),
      spaces: Array.isArray(branch.spaces)
        ? branch.spaces.map((type) => (type === "combat" ? "plus" : type))
        : [],
    }));
}

function countSpaces(board, type) {
  return board.filter((space) => space === type).length;
}

function activeBoard() {
  if (!Array.isArray(state.board) || state.board.length < MIN_BOARD_SIZE) {
    state.board = createBoardPattern(state.boardSize || DEFAULT_BOARD_SIZE);
    state.branches = createBoardBranches(state.board);
  }
  sanitizeBoard(state.board);
  return state.board;
}

function activeBranches() {
  activeBoard();
  if (!Array.isArray(state.branches)) state.branches = createBoardBranches(state.board);
  state.branches = sanitizeBranches(state.branches, state.board.length);
  return state.branches;
}

function queueItemGain(player, items) {
  if (!player || !items?.length) return;
  const effects = ensureEffects();
  const icons = items.map((item) => itemIcons[item.itemId] || "?").join("");
  effects.itemGains.push({
    id: uid(),
    playerId: player.id,
    icons,
    at: Date.now(),
  });
  effects.itemGains = effects.itemGains.slice(-16);
  window.setTimeout(renderBoard, ITEM_GAIN_EFFECT_MS + 80);
}

function recentItemGainFor(player) {
  if (!player || !canControlPlayer(player)) return null;
  const now = Date.now();
  const effects = ensureEffects();
  const gain = [...effects.itemGains]
    .reverse()
    .find((entry) => entry.playerId === player.id && now - entry.at < ITEM_GAIN_EFFECT_MS);
  return gain ? { ...gain, elapsed: now - gain.at } : null;
}

function showSpaceEffect(position, type) {
  uiEffects.space = {
    id: uid(),
    position,
    type,
  };
  renderBoard();
  const effectId = uiEffects.space.id;
  window.setTimeout(() => {
    if (uiEffects.space?.id === effectId) {
      uiEffects.space = null;
      renderBoard();
    }
  }, 900);
}

function showHappeningEffect(player, key) {
  const info = happenings[key];
  if (!player || !info) return;
  uiEffects.happening = {
    id: uid(),
    playerId: player.id,
    key,
    icon: info.icon,
    label: info.label,
    className: info.className,
  };
  renderBoard();
  const effectId = uiEffects.happening.id;
  window.setTimeout(() => {
    if (uiEffects.happening?.id === effectId) {
      uiEffects.happening = null;
      renderBoard();
    }
  }, 1800);
}

function queueBattleAction(action) {
  const effects = ensureEffects();
  effects.battleActions.push({
    id: uid(),
    at: Date.now(),
    ...action,
  });
  effects.battleActions = effects.battleActions.slice(-24);
  window.setTimeout(renderBattle, BATTLE_ACTION_EFFECT_MS + 80);
}

function recentBattleActionFor(playerId, role) {
  const now = Date.now();
  const effects = ensureEffects();
  const action = [...effects.battleActions].reverse().find((entry) => {
    if (now - entry.at > BATTLE_ACTION_EFFECT_MS) return false;
    if (role === "actor" && entry.type === "damage") return false;
    if (role === "actor") return entry.actorId === playerId;
    if (role === "target") return entry.targetIds?.includes(playerId);
    return false;
  });
  return action ? { ...action, elapsed: now - action.at } : null;
}

function normalizeGameState(gameState) {
  gameState.syncVersion = Number(gameState.syncVersion) || 0;
  gameState.boardSize = clamp(Number(gameState.boardSize) || DEFAULT_BOARD_SIZE, MIN_BOARD_SIZE, MAX_BOARD_SIZE);
  if (!Array.isArray(gameState.board) || gameState.board.length !== gameState.boardSize) {
    gameState.board = createBoardPattern(gameState.boardSize);
  }
  sanitizeBoard(gameState.board);
  if (!Array.isArray(gameState.branches)) {
    gameState.branches = createBoardBranches(gameState.board);
  }
  gameState.branches = sanitizeBranches(gameState.branches, gameState.board.length);
  if (!Array.isArray(gameState.pendingShopDice)) gameState.pendingShopDice = [];
  if (!Number.isFinite(Number(gameState.nextEventTurn)) || Number(gameState.nextEventTurn) < 1) {
    gameState.nextEventTurn = 1;
  }
  ensureEffects(gameState);
  if (!Array.isArray(gameState.avatars)) {
    gameState.avatars = ["😀", "😎", "🤠", "🧙"];
  }
  if (Array.isArray(gameState.players)) {
    gameState.players.forEach((player, index) => {
      player.position = clamp(Number(player.position) || 0, 0, gameState.board.length - 1);
      player.avatar = player.avatar || gameState.avatars[index] || avatarOptions[index] || "😀";
      if (player.branch && !gameState.branches.some((branch) => branch.id === player.branch.id)) player.branch = null;
      if (player.branch) player.branch.index = clamp(Number(player.branch.index) || 0, 0, 12);
      normalizeSpecialDice(player);
      normalizeBackpack(player);
    });
  }
  return gameState;
}

function normalizeSpecialDice(player) {
  if (!player) return;
  if (!Array.isArray(player.specialDice)) player.specialDice = [];
  player.specialDice = player.specialDice
    .map((die) => {
      const info = SPECIAL_DICE[die.type || die.id];
      if (!info) return null;
      return {
        uid: die.uid || uid(),
        type: info.id,
        usesLeft: clamp(Number(die.usesLeft) || info.uses, 1, info.uses),
      };
    })
    .filter(Boolean);
}

function normalizeBackpack(player) {
  if (!player) return;
  player.backpackW = clamp(Number(player.backpackW) || 4, 4, 6);
  player.backpackH = clamp(Number(player.backpackH) || 4, 4, 6);
  if (!Array.isArray(player.backpack)) player.backpack = [];
  if (!Array.isArray(player.stash)) player.stash = [];
  player.backpack = player.backpack
    .map((entry) => {
      const item = itemById(entry.itemId);
      if (!item) return null;
      return {
        ...entry,
        x: clamp(Number(entry.x) || 0, 0, player.backpackW - 1),
        y: clamp(Number(entry.y) || 0, 0, player.backpackH - 1),
        w: item.w,
        h: item.h,
      };
    })
    .filter(Boolean)
    .filter((entry) => entry.x + entry.w <= player.backpackW && entry.y + entry.h <= player.backpackH);
}

function itemById(id) {
  return itemCatalog.find((item) => item.id === id);
}

function makeItem(itemId) {
  return {
    uid: uid(),
    itemId,
    level: 1,
  };
}

function rarityValue(rarity) {
  return rarityOrder.indexOf(rarity) + 1;
}

function randomRarity(minimum = "white") {
  const minIndex = rarityOrder.indexOf(minimum);
  const entries = rarityOrder
    .slice(minIndex)
    .map((rarity) => [rarity, rarityWeights[rarity]]);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return entries[entries.length - 1][0];
}

function randomItem(minimum = "white") {
  const rarity = randomRarity(minimum);
  const pool = itemCatalog.filter((item) => item.rarity === rarity);
  return makeItem(choice(pool).id);
}

function addRandomItems(player, count, minimum = "white") {
  const items = Array.from({ length: count }, () => randomItem(minimum));
  player.stash.push(...items);
  queueItemGain(player, items);
  return items;
}

function makeSpecialDice(type = "d12") {
  const info = SPECIAL_DICE[type];
  return {
    uid: uid(),
    type: info.id,
    usesLeft: info.uses,
  };
}

function addSpecialDice(player, type = "d12", reason = "") {
  if (!player || !SPECIAL_DICE[type]) return null;
  normalizeSpecialDice(player);
  const die = makeSpecialDice(type);
  player.specialDice.push(die);
  const info = SPECIAL_DICE[type];
  addLog(`${player.name} は ${info.name}${reason ? `を${reason}` : "を手に入れました"}。`);
  return die;
}

function createPlayers() {
  return Array.from({ length: state.setupCount }, (_, index) => ({
    id: index + 1,
    name: state.names[index] || `プレイヤー${index + 1}`,
    avatar: state.avatars[index] || avatarOptions[index],
    color: playerColors[index],
    position: 0,
    money: 120,
    turnCount: 0,
    orderRoll: null,
    rollBonus: 0,
    specialDice: [],
    shopDiscount: false,
    nextBattlePenalty: 0,
    backpackW: 4,
    backpackH: 4,
    backpack: [],
    stash: [makeItem("rusty_sword")],
    defeated: false,
    branch: null,
  }));
}

function addLog(text) {
  state.log.push({ id: uid(), text });
  if (state.log.length > 90) state.log = state.log.slice(-90);
  markChanged();
  renderLog();
}

function markChanged() {
  if (!online.isApplyingRemote) {
    state.syncVersion = (Number(state.syncVersion) || 0) + 1;
    online.localDirtyUntil = Date.now() + 1600;
  }
  if (!online.enabled || !online.ready || online.isApplyingRemote || !online.roomRef) return;
  if (online.isPushing) {
    online.pushQueued = true;
    return;
  }
  window.clearTimeout(online.saveTimer);
  online.saveTimer = window.setTimeout(pushOnlineState, 80);
}

async function pushOnlineState() {
  if (!online.enabled || !online.ready || online.isApplyingRemote || !online.roomRef) return;
  if (online.isPushing) {
    online.pushQueued = true;
    return;
  }
  online.isPushing = true;
  online.pushQueued = false;
  try {
    const { setDoc, serverTimestamp } = online.modules;
    const snapshotState = structuredCloneForSync(state);
    await setDoc(
      online.roomRef,
      {
        state: snapshotState,
        updatedAt: serverTimestamp(),
        updatedBy: online.clientId,
        syncVersion: snapshotState.syncVersion,
      },
      { merge: true },
    );
  } catch (error) {
    setOnlineStatus(`同期失敗: ${error.message}`);
  } finally {
    online.isPushing = false;
    if (online.pushQueued) {
      window.clearTimeout(online.saveTimer);
      online.saveTimer = window.setTimeout(pushOnlineState, 80);
    }
  }
}

function phaseLabel() {
  const labels = {
    setup: "準備中",
    order: "順番決定",
    turn: "行動ターン",
    shop: "ショップ",
    forge: "鍛造",
    combatChoice: "戦闘相手選択",
    battlePrep: "戦闘準備",
    battle: "戦闘中",
    battleResult: "戦闘結果",
    final: "最終対決",
    gameover: "決着",
  };
  return labels[state.phase] || state.phase;
}

function localNotice(text) {
  setOnlineStatus(text);
  els.onlineHelp.textContent = text;
}

function canControlSetup() {
  return !online.enabled || online.isHost;
}

function canControlPlayer(player) {
  if (!online.enabled) return true;
  return Boolean(player && online.playerId === player.id);
}

function requireSetupControl() {
  if (canControlSetup()) return true;
  localNotice("部屋主の端末だけが人数変更とゲーム開始を行えます。");
  return false;
}

function requirePlayerControl(player) {
  if (canControlPlayer(player)) return true;
  localNotice("この端末の担当プレイヤーではありません。");
  return false;
}

function livingPlayers() {
  return state.players.filter((player) => !player.defeated);
}

function currentPlayer() {
  return livingPlayers()[state.currentIndex % Math.max(1, livingPlayers().length)];
}

function init() {
  els.firebaseConfigInput.value = JSON.stringify(DEFAULT_FIREBASE_CONFIG, null, 2);
  if (online.playerId) els.seatSelect.value = String(online.playerId);
  moveTopActionsBelowLog();
  renderSetup();
  renderBoard();
  renderLegend();
  bindEvents();
  renderAll();
  renderTimerHandle = window.setInterval(() => {
    if (state.phase === "battlePrep") renderBattle();
  }, 300);
}

function moveTopActionsBelowLog() {
  const logPanel = document.querySelector(".log-panel");
  if (!logPanel || !els.topActions || logPanel.contains(els.topActions)) return;
  logPanel.append(els.topActions);
}

function bindEvents() {
  els.playerCountGroup.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-count]");
    if (!button) return;
    if (!requireSetupControl()) return;
    state.setupCount = Number(button.dataset.count);
    markChanged();
    renderSetup();
  });

  els.nameFields.addEventListener("input", (event) => {
    const input = event.target.closest("input[data-index]");
    if (!input) return;
    if (!requireSetupControl()) return;
    state.names[Number(input.dataset.index)] = input.value;
    markChanged();
  });
  els.nameFields.addEventListener("change", (event) => {
    const select = event.target.closest("select[data-avatar-index]");
    if (!select) return;
    if (!requireSetupControl()) return;
    state.avatars[Number(select.dataset.avatarIndex)] = select.value;
    markChanged();
    renderAll();
  });

  els.boardSizeInput.addEventListener("input", () => {
    if (!requireSetupControl()) {
      els.boardSizeInput.value = state.boardSize;
      return;
    }
    state.boardSize = clamp(Number(els.boardSizeInput.value), MIN_BOARD_SIZE, MAX_BOARD_SIZE);
    state.board = createBoardPattern(state.boardSize);
    state.branches = createBoardBranches(state.board);
    els.boardSizeValue.textContent = `${state.boardSize}マス`;
    markChanged();
    renderBoard();
  });

  els.startGameButton.addEventListener("click", startOrderPhase);
  els.editorSelect.addEventListener("change", () => {
    state.editorPlayerId = Number(els.editorSelect.value);
    selectedItem = null;
    renderBackpack();
  });
  els.trashZone.addEventListener("click", trashSelectedItem);
  els.trashZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    els.trashZone.classList.add("drag-over");
  });
  els.trashZone.addEventListener("dragleave", () => {
    els.trashZone.classList.remove("drag-over");
  });
  els.trashZone.addEventListener("drop", (event) => {
    event.preventDefault();
    els.trashZone.classList.remove("drag-over");
    selectedItem = event.dataTransfer.getData("text/plain") || selectedItem;
    trashSelectedItem();
  });
  els.backpackGrid.addEventListener("dragleave", (event) => {
    if (!els.backpackGrid.contains(event.relatedTarget)) clearPlacementPreview();
  });
  els.saveButton.addEventListener("click", saveGame);
  els.loadButton.addEventListener("click", loadGame);
  els.resetButton.addEventListener("click", resetGame);
  els.clearLogButton.addEventListener("click", () => {
    state.log = [];
    markChanged();
    renderLog();
  });
  els.createRoomButton.addEventListener("click", createOnlineRoom);
  els.joinRoomButton.addEventListener("click", joinOnlineRoom);
  els.leaveRoomButton.addEventListener("click", leaveOnlineRoom);
  els.seatSelect.addEventListener("change", () => {
    online.playerId = Number(els.seatSelect.value) || null;
    if (online.playerId) localStorage.setItem(ONLINE_SEAT_KEY, String(online.playerId));
    else localStorage.removeItem(ONLINE_SEAT_KEY);
    renderAll();
  });
  els.firebaseConfigInput.addEventListener("change", () => {
    localStorage.setItem(ONLINE_CONFIG_KEY, els.firebaseConfigInput.value.trim());
  });
  els.roomCodeInput.addEventListener("input", () => {
    els.roomCodeInput.value = els.roomCodeInput.value.replace(/\D/g, "").slice(0, 4);
  });
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeRenderHandle);
    resizeRenderHandle = window.setTimeout(renderBackpack, 120);
  });
}

function renderSetup() {
  const setupEditable = canControlSetup();
  [...els.playerCountGroup.querySelectorAll("button")].forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.count) === state.setupCount);
    button.disabled = !setupEditable || online.enabled;
  });

  els.nameFields.innerHTML = "";
  for (let index = 0; index < state.setupCount; index += 1) {
    const label = document.createElement("label");
    const avatarOptionsHtml = avatarOptions
      .map((avatar) => `<option value="${avatar}" ${avatar === state.avatars[index] ? "selected" : ""}>${avatar}</option>`)
      .join("");
    label.innerHTML = `<span>P${index + 1}</span><input data-index="${index}" maxlength="12" value="${escapeHtml(state.names[index])}" ${setupEditable ? "" : "disabled"} /><select data-avatar-index="${index}" ${setupEditable ? "" : "disabled"}>${avatarOptionsHtml}</select>`;
    els.nameFields.append(label);
  }
  els.boardSizeInput.value = state.boardSize || DEFAULT_BOARD_SIZE;
  els.boardSizeInput.disabled = !setupEditable;
  els.boardSizeValue.textContent = `${state.boardSize || DEFAULT_BOARD_SIZE}マス`;
  els.startGameButton.disabled = !setupEditable;
}

function startOrderPhase() {
  if (!requireSetupControl()) return;
  state.boardSize = clamp(Number(state.boardSize) || DEFAULT_BOARD_SIZE, MIN_BOARD_SIZE, MAX_BOARD_SIZE);
  state.board = createBoardPattern(state.boardSize);
  state.branches = createBoardBranches(state.board);
  state.players = createPlayers();
  state.phase = "order";
  state.orderIndex = 0;
  state.currentIndex = 0;
  state.nextEventTurn = 1;
  state.editorPlayerId = state.players[0].id;
  addLog("ゲーム開始。まずは1〜100ダイスで行動順を決めます。");
  renderAll();
}

function rollOrderDice() {
  const player = state.players[state.orderIndex];
  if (!requirePlayerControl(player)) return;
  const roll = rand(1, 100);
  player.orderRoll = roll;
  els.diceFace.textContent = roll;
  addLog(`${player.name} が順番決定ダイスで ${roll} を出しました。`);
  state.orderIndex += 1;
  if (state.orderIndex >= state.players.length) {
    state.players.sort((a, b) => b.orderRoll - a.orderRoll);
    state.currentIndex = 0;
    state.phase = "turn";
    addLog(`行動順が確定しました: ${state.players.map((p) => p.name).join(" → ")}`);
    beginTurn();
  }
  renderAll();
}

function beginTurn() {
  const player = currentPlayer();
  if (!player) return;
  purgeOverflow(player);
  const income = placedItems(player).reduce((sum, placed) => {
    const item = itemById(placed.itemId);
    return sum + (item.income || 0) + (placed.level - 1) * 3;
  }, 0);
  if (income > 0) {
    player.money += income;
    addLog(`${player.name} はバックパック効果で ${income}G 得ました。`);
  }
}

function purgeOverflow(player) {
  if (player.stash.length <= 3) return;
  const removed = [];
  while (player.stash.length > 3) {
    const index = rand(0, player.stash.length - 1);
    const [item] = player.stash.splice(index, 1);
    removed.push(itemById(item.itemId).name);
  }
  addLog(`${player.name} の手持ちが多すぎたため、${removed.join("、")} が失われました。`);
}

function branchForPlayer(player) {
  if (!player?.branch) return null;
  return activeBranches().find((branch) => branch.id === player.branch.id) || null;
}

function currentSpaceTypeFor(player) {
  const branch = branchForPlayer(player);
  if (branch) return branch.spaces[player.branch.index] || "plus";
  return activeBoard()[player.position];
}

function nextBranchFrom(position) {
  return activeBranches().find((branch) => branch.from === position) || null;
}

function stepPlayerForward(player) {
  const branch = branchForPlayer(player);
  if (branch) {
    if (player.branch.index < branch.spaces.length - 1) {
      player.branch.index += 1;
      return;
    }
    player.position = branch.to;
    player.branch = null;
    return;
  }

  const next = clamp(player.position + 1, 0, activeBoard().length - 1);
  const enteringBranch = nextBranchFrom(next);
  if (enteringBranch?.spaces?.length && next < activeBoard().length - 1) {
    player.position = enteringBranch.from;
    player.branch = { id: enteringBranch.id, index: 0 };
    addLog(`${player.name} は分岐ルートに入りました。`);
    return;
  }
  player.position = next;
}

function maybeTriggerHappening(player, spaceType) {
  if (!["plus", "minus"].includes(spaceType)) return false;
  if (Math.random() >= HAPPENING_CHANCE) return false;
  const key = choice(Object.keys(happenings));
  showHappeningEffect(player, key);

  if (key === "minefield") {
    const rate = choice([0.5, 0.25]);
    const loss = Math.floor(player.money * rate);
    player.money = Math.max(0, player.money - loss);
    addLog(`ハプニング「地雷原」! ${player.name} は ${loss}G を失いました。`);
  } else if (key === "clover") {
    const gain = Math.floor(player.money * 0.5);
    player.money += gain;
    addLog(`ハプニング「クローバー」! ${player.name} の所持金が1.5倍になり、${gain}G 増えました。`);
  } else if (key === "tax") {
    const count = player.stash.length;
    player.stash = [];
    selectedItem = null;
    addLog(`ハプニング「脱税発覚」! ${player.name} は手持ちアイテム ${count} 個をすべて失いました。`);
  } else if (key === "sideJob") {
    player.money += 200;
    addLog(`ハプニング「副業マスター山下」! ${player.name} は 200G を得ました。`);
  }
  return true;
}

async function rollMoveDice(dieUid = null) {
  const player = currentPlayer();
  if (!player || state.phase !== "turn") return;
  if (!requirePlayerControl(player)) return;
  if (isAnimatingMove) return;
  normalizeSpecialDice(player);
  const specialDie = dieUid ? player.specialDice.find((die) => die.uid === dieUid) : null;
  const dieInfo = specialDie ? SPECIAL_DICE[specialDie.type] : null;
  const sides = dieInfo?.sides || 6;
  const baseRoll = rand(1, sides);
  const bonus = player.rollBonus || 0;
  player.rollBonus = 0;
  const total = baseRoll + bonus;
  els.diceFace.textContent = total;
  if (specialDie) {
    specialDie.usesLeft -= 1;
    addLog(`${player.name} は ${dieInfo.name} を使いました。残り ${Math.max(0, specialDie.usesLeft)} 回。`);
    if (specialDie.usesLeft <= 0) {
      player.specialDice = player.specialDice.filter((die) => die.uid !== specialDie.uid);
      addLog(`${dieInfo.name} は使い切りました。`);
    }
  }
  isAnimatingMove = true;
  for (let step = 0; step < total; step += 1) {
    const before = player.position;
    stepPlayerForward(player);
    renderBoard();
    await sleep(180);
    if (!player.branch && player.position === activeBoard().length - 1) break;
    if (!player.branch && player.position === before && before === activeBoard().length - 1) break;
  }
  isAnimatingMove = false;
  player.turnCount += 1;
  addLog(`${player.name} は ${baseRoll}${bonus ? ` + ${bonus}` : ""} マス進みました。`);
  showSpaceEffect(player.position, currentSpaceTypeFor(player));
  resolveSpace(player);
  renderAll();
}

function resolveSpace(player) {
  const type = currentSpaceTypeFor(player);
  const name = spaceTypes[type].label;
  const landedPosition = player.position;
  const landedBranch = player.branch ? { ...player.branch } : null;
  addLog(`${player.name} は「${name}」に止まりました。`);

  if (type === "plus") {
    const money = rand(25, 70);
    player.money += money;
    const items = addRandomItems(player, rand(2, 3), "white");
    addLog(`${player.name} は ${money}G と ${items.map((item) => itemById(item.itemId).name).join("、")} を得ました。`);
    maybeTriggerHappening(player, type);
    player.position = landedPosition;
    player.branch = landedBranch;
    finishAction();
  } else if (type === "minus") {
    const loss = Math.min(player.money, rand(20, 60));
    player.money -= loss;
    player.nextBattlePenalty += 0.12;
    addLog(`${player.name} は ${loss}G を失い、次の戦闘で攻撃力が下がります。`);
    maybeTriggerHappening(player, type);
    player.position = landedPosition;
    player.branch = landedBranch;
    finishAction();
  } else if (type === "lucky") {
    const effect = choice(["item", "dash", "discount", "dice"]);
    if (effect === "item") {
      const items = addRandomItems(player, 2, "green");
      addLog(`${player.name} は幸運で ${items.map((item) => itemById(item.itemId).name).join("、")} を得ました。`);
    } else if (effect === "dash") {
      player.rollBonus += 3;
      addLog(`${player.name} は次の移動ダイスに +3 を得ました。`);
    } else if (effect === "dice") {
      addSpecialDice(player, "d12", "ラッキーマスで手に入れました");
    } else {
      player.shopDiscount = true;
      addLog(`${player.name} は次のショップで半額券を使えます。`);
    }
    finishAction();
  } else if (type === "shop") {
    openShop(player);
  } else if (type === "forge") {
    openForge(player);
  } else if (type === "combat") {
    openCombatChoice(player);
  } else if (type === "goal") {
    const prizes = [randomItem("purple"), randomItem("gold")];
    player.stash.push(...prizes);
    queueItemGain(player, prizes);
    addLog(`${player.name} がゴールに到達し、${prizes.map((item) => itemById(item.itemId).name).join("、")} を得ました。最終対決へ移行します。`);
    startBattle(livingPlayers().map((p) => p.id), true, "最終対決");
  } else {
    finishAction();
  }
}

function finishAction() {
  if (state.phase !== "turn") return;
  maybeTriggerEvent();
  if (state.phase !== "turn") return;
  advanceTurn();
}

function advanceTurn() {
  const alive = livingPlayers();
  if (alive.length < 2) {
    state.phase = "gameover";
    state.winnerId = alive[0]?.id || null;
    addLog(`${alive[0]?.name || "最後のプレイヤー"} が勝者です。`);
    markChanged();
    renderAll();
    return;
  }
  state.currentIndex = (state.currentIndex + 1) % alive.length;
  beginTurn();
  renderAll();
  markChanged();
}

function maybeTriggerEvent() {
  const minTurns = Math.min(...state.players.map((player) => player.turnCount));
  if (minTurns < state.nextEventTurn) return;
  state.nextEventTurn += 1;
  triggerEvent();
}

function triggerEvent() {
  const event = choice(["bonus", "tax", "drop", "brawl"]);
  if (event === "bonus") {
    state.players.forEach((player) => {
      if (!player.defeated) player.money += 50;
    });
    addLog("全体イベント: 祝祭。全員が 50G を得ました。");
  } else if (event === "tax") {
    state.players.forEach((player) => {
      if (!player.defeated) player.money = Math.max(0, player.money - 35);
    });
    addLog("全体イベント: 大徴税。全員が 35G を失いました。");
  } else if (event === "drop") {
    state.players.forEach((player) => {
      if (!player.defeated) addRandomItems(player, 2, "green");
    });
    addLog("全体イベント: 補給便。全員がアイテムを2つ得ました。");
  } else {
    addLog("全体イベント: 大乱戦。全員参加の戦闘が始まります。");
    startBattle(livingPlayers().map((player) => player.id), false, "大乱戦イベント");
  }
}

function openShop(player) {
  state.phase = "shop";
  state.pendingShop = [randomItem("white"), randomItem("green"), randomItem("blue")];
  state.pendingShopDice = Math.random() < 0.78 ? [makeSpecialDice("d12")] : [];
  els.shopPanel.classList.remove("hidden");
  addLog(`${player.name} はショップに入りました。`);
  renderAll();
}

function buySpecialDice(uidValue) {
  const player = currentPlayer();
  if (!player || !requirePlayerControl(player)) return;
  if (!Array.isArray(state.pendingShopDice)) state.pendingShopDice = [];
  const index = state.pendingShopDice.findIndex((die) => die.uid === uidValue);
  if (index < 0) return;
  const die = state.pendingShopDice[index];
  const info = SPECIAL_DICE[die.type];
  if (!info) return;
  if (player.money < info.price) {
    addLog(`${player.name} は ${info.name} を買うお金が足りません。`);
    return;
  }
  player.money -= info.price;
  normalizeSpecialDice(player);
  player.specialDice.push(die);
  state.pendingShopDice.splice(index, 1);
  addLog(`${player.name} は ${info.name} を ${info.price}G で購入しました。`);
  renderAll();
}

function buyShopItem(uidValue) {
  const player = currentPlayer();
  if (!requirePlayerControl(player)) return;
  const index = state.pendingShop.findIndex((item) => item.uid === uidValue);
  if (!player || index < 0) return;
  const item = state.pendingShop[index];
  const catalog = itemById(item.itemId);
  const price = Math.floor(catalog.price * (player.shopDiscount ? 0.5 : 1));
  if (player.money < price) {
    addLog(`${player.name} は ${catalog.name} を買うお金が足りません。`);
    return;
  }
  player.money -= price;
  player.shopDiscount = false;
  player.stash.push(item);
  queueItemGain(player, [item]);
  state.pendingShop.splice(index, 1);
  addLog(`${player.name} は ${catalog.name} を ${price}G で購入しました。`);
  renderAll();
}

function buyBackpackExpansion() {
  const player = currentPlayer();
  if (!player) return;
  if (!requirePlayerControl(player)) return;
  const upgrades = Math.max(0, player.backpackW + player.backpackH - 8);
  const cost = 200 + upgrades * 100;
  if (player.money < cost) {
    addLog(`${player.name} はバックパック拡張のお金が足りません。`);
    return;
  }
  if (player.backpackW >= 6 && player.backpackH >= 6) {
    addLog("バックパックはこれ以上拡張できません。");
    return;
  }
  player.money -= cost;
  if (player.backpackW <= player.backpackH) player.backpackW += 1;
  else player.backpackH += 1;
  addLog(`${player.name} のバックパックが ${player.backpackW}×${player.backpackH} になりました。`);
  renderAll();
}

function closeShopOrForge() {
  const player = currentPlayer();
  if (!requirePlayerControl(player)) return;
  state.phase = "turn";
  finishAction();
}

function openForge(player) {
  state.phase = "forge";
  selectedSynthesis = [];
  addLog(`${player.name} は鍛造マスで装備を整えられます。`);
  renderAll();
}

function sellStashItem(uidValue) {
  const player = currentPlayer();
  if (!requirePlayerControl(player)) return;
  const index = player?.stash.findIndex((item) => item.uid === uidValue) ?? -1;
  if (!player || index < 0) return;
  const [item] = player.stash.splice(index, 1);
  const catalog = itemById(item.itemId);
  const price = catalog.sell + (item.level - 1) * 15;
  player.money += price;
  addLog(`${player.name} は ${catalog.name} を売却し ${price}G を得ました。`);
  renderAll();
}

function upgradePlacedItem(uidValue) {
  const player = currentPlayer();
  if (!requirePlayerControl(player)) return;
  const placed = player?.backpack.find((item) => item.uid === uidValue);
  if (!player || !placed) return;
  const cost = 70 + placed.level * 45;
  if (player.money < cost) {
    addLog(`${player.name} は強化費用が足りません。`);
    return;
  }
  player.money -= cost;
  placed.level += 1;
  addLog(`${player.name} は ${itemById(placed.itemId).name} を +${placed.level - 1} に強化しました。`);
  renderAll();
}

function synthesisCandidates(player) {
  return [
    ...player.stash.map((entry) => ({ entry, source: "手持ち" })),
    ...player.backpack.map((entry) => ({ entry, source: "バッグ" })),
  ];
}

function findSynthesisCandidate(player, uidValue) {
  return synthesisCandidates(player).find((candidate) => candidate.entry.uid === uidValue) || null;
}

function synthesizeItems() {
  const player = currentPlayer();
  if (!player) return;
  if (!requirePlayerControl(player)) return;
  const used = selectedSynthesis
    .map((uidValue) => findSynthesisCandidate(player, uidValue)?.entry)
    .filter(Boolean);
  if (used.length !== 2) {
    addLog("合成するアイテムを2つ選んでください。");
    return;
  }
  const rarity = itemById(used[0].itemId).rarity;
  if (rarity === "gold" || itemById(used[1].itemId).rarity !== rarity) {
    addLog("同じレアリティのアイテム2つだけ合成できます。");
    return;
  }
  player.stash = player.stash.filter((item) => !used.includes(item));
  player.backpack = player.backpack.filter((item) => !used.includes(item));
  const nextRarity = rarityOrder[rarityOrder.indexOf(rarity) + 1];
  const pool = itemCatalog.filter((item) => item.rarity === nextRarity);
  const created = makeItem(choice(pool).id);
  player.stash.push(created);
  selectedSynthesis = [];
  queueItemGain(player, [created]);
  addLog(`${player.name} は ${rarityNames[rarity]}アイテム2つを合成し、${itemById(created.itemId).name} を得ました。`);
  renderAll();
}

function toggleSynthesisItem(uidValue) {
  const player = currentPlayer();
  if (!player || !requirePlayerControl(player)) return;
  if (!findSynthesisCandidate(player, uidValue)) return;
  if (selectedSynthesis.includes(uidValue)) {
    selectedSynthesis = selectedSynthesis.filter((id) => id !== uidValue);
  } else {
    selectedSynthesis = [...selectedSynthesis, uidValue].slice(-2);
  }
  renderShop();
}

function openCombatChoice(player) {
  state.phase = "combatChoice";
  addLog(`${player.name} は戦闘相手を選びます。`);
}

function startBattle(playerIds, isFinal, title) {
  clearBattleLoops();
  state.phase = "battlePrep";
  const hpMultiplier = playerIds.length >= 3 ? playerIds.length - 1 : 1;
  const participants = playerIds.map((id) => {
    const player = state.players.find((p) => p.id === id);
    const shield = placedItems(player).reduce((sum, placed) => {
      const item = itemById(placed.itemId);
      return sum + (item.shield || 0) + (placed.level - 1) * 2;
    }, 0);
    const baseHp = Math.max(50, 100 - Math.round(player.nextBattlePenalty * 100));
    const maxHp = baseHp * hpMultiplier;
    return {
      playerId: player.id,
      hp: maxHp,
      maxHp,
      shield,
      alive: true,
      rank: null,
      cooldowns: {},
      lastTickAt: Date.now(),
    };
  });

  state.battle = {
    title,
    isFinal,
    prepStartedAt: Date.now(),
    ready: Object.fromEntries(playerIds.map((id) => [id, false])),
    participants,
    feed: [`${title} の準備時間が始まりました。`],
  };
  state.editorPlayerId = playerIds[0];
  renderAll();
  markChanged();
}

function battleParticipantIds() {
  return state.battle?.participants.map((fighter) => fighter.playerId) || [];
}

function isBattleReady() {
  const ids = battleParticipantIds();
  return Boolean(ids.length && ids.every((id) => state.battle.ready?.[id]));
}

function battleReadyPlayer() {
  if (!state.battle) return null;
  if (online.enabled) {
    return state.battle.participants.some((fighter) => fighter.playerId === online.playerId)
      ? state.players.find((player) => player.id === online.playerId)
      : null;
  }
  const selected = selectedEditorPlayer();
  if (selected && state.battle.participants.some((fighter) => fighter.playerId === selected.id)) return selected;
  const player = currentPlayer();
  if (player && state.battle.participants.some((fighter) => fighter.playerId === player.id)) return player;
  return state.players.find((player) => state.battle.participants.some((fighter) => fighter.playerId === player.id));
}

function markBattleReady() {
  if (!state.battle || state.phase !== "battlePrep") return;
  const player = battleReadyPlayer();
  if (!player) {
    localNotice("この戦闘に参加しているプレイヤーだけ準備完了できます。");
    return;
  }
  if (online.enabled && !canControlPlayer(player)) {
    requirePlayerControl(player);
    return;
  }
  state.battle.ready = state.battle.ready || {};
  state.battle.ready[player.id] = true;
  state.battle.feed.unshift(`${player.name} が準備完了しました。`);
  queueBattleAction({ type: "ready", actorId: player.id, targetIds: [], label: "READY" });
  renderAll();
  markChanged();
  if (isBattleReady() && (!online.enabled || online.isHost)) {
    window.setTimeout(runBattle, 250);
  }
}

function runBattle() {
  if (!state.battle) return;
  if (state.phase !== "battlePrep") return;
  if (online.enabled && !online.isHost) return;
  if (!isBattleReady()) return;
  state.phase = "battle";
  state.battle.feed.unshift("戦闘開始。バックパック内のアイテムが自動で発動します。");
  state.battle.participants.forEach((fighter) => {
    const player = state.players.find((p) => p.id === fighter.playerId);
    player.nextBattlePenalty = 0;
    fighter.lastTickAt = Date.now();
    fighter.cooldowns = {};
    placedItems(player).forEach((entry) => {
      const item = itemById(entry.itemId);
      if (item.damage || item.poison || item.heal) {
        fighter.cooldowns[entry.uid] = Math.max(600, item.interval || 2500);
      }
    });
  });
  renderAll();
  markChanged();
  battleTickHandle = window.setInterval(battleTick, 250);
}

function battleTick() {
  if (!state.battle) return;
  if (online.enabled && !online.isHost) return;
  const battle = state.battle;
  const alive = battle.participants.filter((fighter) => fighter.alive);
  if (alive.length <= 1) {
    finishBattle();
    return;
  }

  for (const fighter of alive) {
    if (!fighter.alive) continue;
    const now = Date.now();
    const delta = Math.min(1000, now - (fighter.lastTickAt || now));
    fighter.lastTickAt = now;
    const player = state.players.find((p) => p.id === fighter.playerId);
    const placed = placedItems(player);
    const targetPool = battle.participants.filter((target) => target.alive && target.playerId !== player.id);
    if (!targetPool.length) continue;
    const weaken = placed.reduce((sum, entry) => sum + (itemById(entry.itemId).weaken || 0), 0);
    if (weaken > 0) {
      targetPool.forEach((target) => {
        target.cooldowns.weaken = Math.max(target.cooldowns.weaken || 0, weaken);
      });
    }

    for (const entry of placed) {
      const item = itemById(entry.itemId);
      const key = entry.uid;
      fighter.cooldowns[key] = Math.max(0, (fighter.cooldowns[key] ?? item.interval ?? 2500) - delta);
      if (fighter.cooldowns[key] > 0) continue;

      if (item.damage || item.poison) {
        fighter.cooldowns[key] = Math.max(600, item.interval || 2500);
        const damage = calculateDamage(player, entry, item);
        const finalDamage = Math.max(1, Math.round(damage * (1 - (player.nextBattlePenalty || 0))));
        targetPool
          .filter((target) => target.alive)
          .forEach((target) => {
            applyDamage(target, finalDamage, `${player.name} の ${item.name}`, player.id);
            settleDefeat(target);
          });
        if (item.healOnHit) {
          const amount = item.healOnHit + entry.level - 1;
          fighter.hp = Math.min(fighter.maxHp || 100, fighter.hp + amount);
          queueBattleAction({ type: "heal", actorId: player.id, targetIds: [player.id], label: `+${amount}` });
        }
      }

      if (item.heal) {
        fighter.cooldowns[key] = Math.max(600, item.interval || 3500);
        const amount = item.heal + entry.level * 2;
        fighter.hp = Math.min(fighter.maxHp || 100, fighter.hp + amount);
        battle.feed.unshift(`${player.name} は ${item.name} で ${amount} 回復。`);
        queueBattleAction({ type: "heal", actorId: player.id, targetIds: [player.id], label: `+${amount}` });
      }
    }

    targetPool.forEach((target) => settleDefeat(target));
  }
  markChanged();
  renderBattle();
}

function calculateDamage(player, entry, item) {
  let damage = (item.damage || item.poison || 0) + (entry.level - 1) * 2 + Math.ceil(rarityValue(item.rarity) / 2);
  const placed = placedItems(player);
  const adjacentBoost = placed.reduce((sum, other) => {
    const otherItem = itemById(other.itemId);
    if (!otherItem.boost || other.uid === entry.uid) return sum;
    return areAdjacent(entry, other) ? sum + otherItem.boost : sum;
  }, 0);
  const globalBoost = placed.reduce((sum, other) => sum + (itemById(other.itemId).boostAll || 0), 0);
  damage *= 1 + adjacentBoost + globalBoost;
  return damage;
}

function areAdjacent(a, b) {
  const aCells = occupiedCells(a);
  const bCells = occupiedCells(b);
  return aCells.some((cellA) =>
    bCells.some(
      (cellB) => Math.abs(cellA.x - cellB.x) + Math.abs(cellA.y - cellB.y) === 1,
    ),
  );
}

function applyDamage(target, amount, label, actorId = null) {
  const battle = state.battle;
  const blocked = Math.min(target.shield, amount);
  target.shield -= blocked;
  target.hp -= amount - blocked;
  const player = state.players.find((p) => p.id === target.playerId);
  battle.feed.unshift(`${label} が ${player.name} に ${amount - blocked} ダメージ。`);
  queueBattleAction({ type: "damage", actorId, targetIds: [target.playerId], label: `-${amount - blocked}` });
}

function settleDefeat(target) {
  if (!target || target.hp > 0 || !target.alive) return;
  target.alive = false;
  target.rank = state.battle.participants.filter((entry) => !entry.rank).length;
  const targetPlayer = state.players.find((p) => p.id === target.playerId);
  state.battle.feed.unshift(`${targetPlayer.name} は倒れました。`);
}

function finishBattle() {
  clearBattleLoops();
  if (!state.battle) return;
  const battle = state.battle;
  const winner = battle.participants.find((fighter) => fighter.alive) || battle.participants[0];
  const winnerPlayer = state.players.find((player) => player.id === winner.playerId);
  battle.feed.unshift(`${winnerPlayer.name} が勝利しました。`);

  if (battle.isFinal) {
    state.phase = "gameover";
    state.winnerId = winnerPlayer.id;
    addLog(`最終対決の勝者は ${winnerPlayer.name}。ゲーム終了です。`);
  } else {
    winnerPlayer.money += 90;
    addRandomItems(winnerPlayer, 2, "green");
    addSpecialDice(winnerPlayer, "d12", "戦闘報酬で手に入れました");
    battle.participants.forEach((fighter) => {
      if (fighter.playerId !== winner.playerId) {
        const player = state.players.find((p) => p.id === fighter.playerId);
        player.money = Math.max(0, player.money - 35);
        player.nextBattlePenalty += 0.08;
      }
    });
    state.phase = "battleResult";
    addLog(`${winnerPlayer.name} が戦闘に勝利し、90G と報酬アイテムを得ました。`);
  }
  renderAll();
}

function continueAfterBattle() {
  state.battle = null;
  state.phase = "turn";
  markChanged();
  advanceTurn();
}

function clearBattleLoops() {
  window.clearTimeout(battleTimerHandle);
  window.clearInterval(battleTickHandle);
  battleTimerHandle = null;
  battleTickHandle = null;
}

function canEditBackpack(player) {
  if (!player) return false;
  if (state.phase === "battlePrep" || state.phase === "battle") return true;
  const active = currentPlayer();
  return !active || player.id !== active.id || state.phase === "setup" || state.phase === "order";
}

function selectedEditorPlayer() {
  return state.players.find((player) => player.id === state.editorPlayerId) || state.players[0];
}

function placedItems(player) {
  return player?.backpack || [];
}

function occupiedCells(placed) {
  const cells = [];
  for (let y = placed.y; y < placed.y + placed.h; y += 1) {
    for (let x = placed.x; x < placed.x + placed.w; x += 1) {
      cells.push({ x, y });
    }
  }
  return cells;
}

function canPlace(player, stashItem, x, y, ignoreUid = null) {
  const item = itemById(stashItem.itemId);
  if (x + item.w > player.backpackW || y + item.h > player.backpackH) return false;
  const newCells = [];
  for (let yy = y; yy < y + item.h; yy += 1) {
    for (let xx = x; xx < x + item.w; xx += 1) {
      newCells.push(`${xx},${yy}`);
    }
  }
  const occupied = new Set(
    player.backpack
      .filter((entry) => entry.uid !== ignoreUid)
      .flatMap((entry) => occupiedCells(entry).map((cell) => `${cell.x},${cell.y}`)),
  );
  return newCells.every((cell) => !occupied.has(cell));
}

function selectedStashItem(player) {
  return player?.stash.find((item) => item.uid === selectedItem) || null;
}

function selectedBackpackItem(player) {
  return player?.backpack.find((item) => item.uid === selectedItem) || null;
}

function selectedPlacementItem(player) {
  return selectedStashItem(player) || selectedBackpackItem(player);
}

function footprintCells(item, x, y) {
  const cells = [];
  if (!item) return cells;
  for (let yy = y; yy < y + item.h; yy += 1) {
    for (let xx = x; xx < x + item.w; xx += 1) cells.push(`${xx},${yy}`);
  }
  return cells;
}

function clearPlacementPreview() {
  placementPreview = null;
  renderPlacementPreview();
}

function setPlacementPreview(x, y) {
  placementPreview = { x, y };
  renderPlacementPreview();
}

function renderPlacementPreview() {
  const player = selectedEditorPlayer();
  const stashItem = selectedPlacementItem(player);
  els.backpackGrid.querySelectorAll(".grid-cell").forEach((cell) => {
    cell.classList.remove("preview-valid", "preview-invalid", "preview-anchor");
  });
  if (!player || !stashItem || !placementPreview) return;
  const item = itemById(stashItem.itemId);
  const valid = canPlace(player, stashItem, placementPreview.x, placementPreview.y, selectedBackpackItem(player)?.uid || null);
  const cells = footprintCells(item, placementPreview.x, placementPreview.y);
  cells.forEach((key) => {
    const cell = els.backpackGrid.querySelector(`.grid-cell[data-cell="${key}"]`);
    if (!cell) return;
    cell.classList.add(valid ? "preview-valid" : "preview-invalid");
    if (key === `${placementPreview.x},${placementPreview.y}`) cell.classList.add("preview-anchor");
  });
}

function autoScrollDuringDrag(clientY) {
  const edge = Math.min(120, window.innerHeight * 0.22);
  let delta = 0;
  if (clientY < edge) delta = -Math.round((edge - clientY) / 4);
  else if (clientY > window.innerHeight - edge) delta = Math.round((clientY - (window.innerHeight - edge)) / 4);
  if (delta) window.scrollBy({ top: delta, behavior: "auto" });
}

function cellFromPoint(clientX, clientY) {
  const dragElement = touchDrag?.element;
  const previousPointerEvents = dragElement?.style.pointerEvents;
  if (dragElement) dragElement.style.pointerEvents = "none";
  const target = document.elementFromPoint(clientX, clientY);
  if (dragElement) dragElement.style.pointerEvents = previousPointerEvents || "";
  return target?.closest?.(".grid-cell") || null;
}

function placeFromCell(cell) {
  if (!cell) {
    clearPlacementPreview();
    return false;
  }
  const x = Number(cell.dataset.x);
  const y = Number(cell.dataset.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    clearPlacementPreview();
    return false;
  }
  placeSelectedItem(x, y);
  clearPlacementPreview();
  return true;
}

function positionPlacedTile(tile, entry) {
  const start = els.backpackGrid.querySelector(`.grid-cell[data-cell="${entry.x},${entry.y}"]`);
  const end = els.backpackGrid.querySelector(`.grid-cell[data-cell="${entry.x + entry.w - 1},${entry.y + entry.h - 1}"]`);
  if (!start || !end) return false;
  tile.style.left = `${start.offsetLeft}px`;
  tile.style.top = `${start.offsetTop}px`;
  tile.style.width = `${end.offsetLeft + end.offsetWidth - start.offsetLeft}px`;
  tile.style.height = `${end.offsetTop + end.offsetHeight - start.offsetTop}px`;
  return true;
}

function placeSelectedItem(x, y) {
  const player = selectedEditorPlayer();
  if (!player || !selectedItem || !canEditBackpack(player)) return;
  if (online.enabled && !canControlPlayer(player)) {
    localNotice("担当プレイヤーのバックパックだけ編集できます。");
    return;
  }
  const placed = player.backpack.find((item) => item.uid === selectedItem);
  if (placed) {
    if (!canPlace(player, placed, x, y, placed.uid)) {
      addLog("その場所にはアイテムを移動できません。");
      return;
    }
    placed.x = x;
    placed.y = y;
    addLog(`${player.name} は ${itemById(placed.itemId).name} をバックパック内で移動しました。`);
    renderBackpack();
    markChanged();
    return;
  }
  const stashIndex = player.stash.findIndex((item) => item.uid === selectedItem);
  if (stashIndex < 0) return;
  const stashItem = player.stash[stashIndex];
  if (!canPlace(player, stashItem, x, y)) {
    addLog("その場所にはアイテムを配置できません。");
    return;
  }
  const item = itemById(stashItem.itemId);
  player.stash.splice(stashIndex, 1);
  player.backpack.push({
    ...stashItem,
    x,
    y,
    w: item.w,
    h: item.h,
  });
  selectedItem = null;
  addLog(`${player.name} は ${item.name} をバックパックに配置しました。`);
  renderBackpack();
  markChanged();
}

function removePlacedItem(uidValue) {
  const player = selectedEditorPlayer();
  if (!player || !canEditBackpack(player)) return;
  if (online.enabled && !canControlPlayer(player)) {
    localNotice("担当プレイヤーのバックパックだけ編集できます。");
    return;
  }
  const index = player.backpack.findIndex((item) => item.uid === uidValue);
  if (index < 0) return;
  const [item] = player.backpack.splice(index, 1);
  player.stash.push({ uid: item.uid, itemId: item.itemId, level: item.level });
  addLog(`${player.name} は ${itemById(item.itemId).name} を手持ちに戻しました。`);
  renderBackpack();
  markChanged();
}

function trashSelectedItem() {
  const player = selectedEditorPlayer();
  if (!player || !selectedItem || !canEditBackpack(player)) return;
  if (online.enabled && !canControlPlayer(player)) {
    localNotice("担当プレイヤーのアイテムだけ捨てられます。");
    return;
  }
  const index = player.stash.findIndex((item) => item.uid === selectedItem);
  if (index < 0) {
    const backpackIndex = player.backpack.findIndex((item) => item.uid === selectedItem);
    if (backpackIndex < 0) {
      localNotice("捨てるアイテムを選んでください。");
      return;
    }
    const item = player.backpack[backpackIndex];
    const catalog = itemById(item.itemId);
    const ok = window.confirm(`${catalog.name} を捨てますか？`);
    if (!ok) return;
    player.backpack.splice(backpackIndex, 1);
    selectedItem = null;
    addLog(`${player.name} は ${catalog.name} を捨てました。`);
    renderBackpack();
    markChanged();
    return;
  }
  const item = player.stash[index];
  const catalog = itemById(item.itemId);
  const ok = window.confirm(`${catalog.name} を捨てますか？`);
  if (!ok) return;
  player.stash.splice(index, 1);
  selectedItem = null;
  addLog(`${player.name} は ${catalog.name} を捨てました。`);
  renderBackpack();
  markChanged();
}

function renderAll() {
  renderOnline();
  if (state.phase === "setup") renderSetup();
  renderSetupVisibility();
  state.players.forEach(normalizeSpecialDice);
  state.players.forEach(normalizeBackpack);
  renderBoard();
  renderPlayers();
  renderTurn();
  renderBackpack();
  renderShop();
  renderBattle();
  renderLog();
  els.phaseBadge.textContent = phaseLabel();
  els.eventCounter.textContent = `次イベント: 全員${state.nextEventTurn}回行動後`;
}

function renderOnline() {
  const seat = online.playerId ? ` / P${online.playerId}担当` : "";
  if (online.enabled) {
    els.onlineStatus.textContent = `${online.roomId}${seat}${online.isHost ? " / 部屋主" : ""}`;
    els.roomCodeInput.value = online.roomId;
    els.onlineHelp.textContent = `部屋コード ${online.roomId} で接続中です。他端末も同じサイトを開き、この部屋コードで参加できます。`;
  } else {
    els.onlineStatus.textContent = "未接続";
  }
  els.seatSelect.value = online.playerId ? String(online.playerId) : "";
  els.seatSelect.disabled = online.enabled;
}

function participantCountFromSeats(seats) {
  return new Set(
    Object.values(seats || {})
      .map((value) => Number(value))
      .filter((value) => value >= 1 && value <= 4),
  ).size;
}

function setupCountFromSeats(seats) {
  return clamp(Math.max(2, participantCountFromSeats(seats)), 2, 4);
}

async function createOnlineRoom() {
  try {
    await setupOnlineFirebase();
    online.roomId = makeRoomCode();
    online.isHost = true;
    online.enabled = true;
    online.ready = true;
    online.playerId = 1;
    state.setupCount = setupCountFromSeats({ [online.clientId]: 1 });
    els.seatSelect.value = String(online.playerId);
    localStorage.setItem(ONLINE_SEAT_KEY, String(online.playerId));
    const { doc, setDoc, serverTimestamp } = online.modules;
    online.roomRef = doc(online.db, "sugorokuRooms", online.roomId);
    await setDoc(online.roomRef, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      hostId: online.clientId,
      seats: { [online.clientId]: 1 },
      state: structuredCloneForSync(state),
      updatedBy: online.clientId,
      syncVersion: state.syncVersion,
    });
    subscribeOnlineRoom();
    setOnlineStatus(`部屋 ${online.roomId} を作成しました。`);
    renderAll();
  } catch (error) {
    setOnlineStatus(`接続失敗: ${error.message}`);
  }
}

async function joinOnlineRoom() {
  try {
    await setupOnlineFirebase();
    const roomId = els.roomCodeInput.value.trim().toUpperCase();
    if (!roomId) throw new Error("部屋コードを入力してください。");
    const { doc } = online.modules;
    online.roomRef = doc(online.db, "sugorokuRooms", roomId);
    const data = await claimOnlineSeat();
    online.roomId = roomId;
    online.isHost = data.hostId === online.clientId;
    online.enabled = true;
    online.ready = true;
    online.playerId = data.playerId;
    if (online.playerId) localStorage.setItem(ONLINE_SEAT_KEY, String(online.playerId));
    else localStorage.removeItem(ONLINE_SEAT_KEY);
    if (data.state) applyRemoteState(data.state);
    subscribeOnlineRoom();
    setOnlineStatus(online.playerId ? `部屋 ${roomId} に P${online.playerId} として参加しました。` : `部屋 ${roomId} に観戦で参加しました。`);
    renderAll();
  } catch (error) {
    setOnlineStatus(`参加失敗: ${error.message}`);
  }
}

async function leaveOnlineRoom() {
  await releaseOnlineSeat();
  if (online.unsubscribe) online.unsubscribe();
  online.unsubscribe = null;
  online.enabled = false;
  online.ready = false;
  online.roomId = "";
  online.roomRef = null;
  online.isHost = false;
  window.clearTimeout(online.saveTimer);
  clearBattleLoops();
  setOnlineStatus("退出しました。");
  renderAll();
}

async function claimOnlineSeat() {
  const { runTransaction } = online.modules;
  let result = null;
  await runTransaction(online.db, async (transaction) => {
    const snapshot = await transaction.get(online.roomRef);
    if (!snapshot.exists()) throw new Error("部屋が見つかりません。");
    const data = snapshot.data();
    const seats = data.seats || {};
    const maxPlayers = clamp(Number(data.state?.setupCount) || 4, 2, 4);
    let playerId = Number(seats[online.clientId]) || null;
    if (!playerId) {
      const used = new Set(Object.values(seats).map((value) => Number(value)));
      for (let index = 1; index <= maxPlayers; index += 1) {
        if (!used.has(index)) {
          playerId = index;
          break;
        }
      }
      if (playerId) {
        const nextSeats = { ...seats, [online.clientId]: playerId };
        const nextState =
          data.state?.phase === "setup"
            ? { ...data.state, setupCount: setupCountFromSeats(nextSeats) }
            : data.state;
        transaction.set(online.roomRef, { seats: nextSeats, state: nextState }, { merge: true });
      }
    }
    result = { ...data, playerId };
  });
  return result;
}

async function releaseOnlineSeat() {
  if (!online.enabled || !online.roomRef || !online.modules) return;
  try {
    const { runTransaction } = online.modules;
    await runTransaction(online.db, async (transaction) => {
      const snapshot = await transaction.get(online.roomRef);
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      const seats = { ...(data.seats || {}) };
      delete seats[online.clientId];
      const nextState =
        data.state?.phase === "setup"
          ? { ...data.state, setupCount: setupCountFromSeats(seats) }
          : data.state;
      transaction.set(online.roomRef, { seats, state: nextState }, { merge: true });
    });
  } catch (error) {
    setOnlineStatus(`退出時の席解除に失敗: ${error.message}`);
  }
}

async function setupOnlineFirebase() {
  const configText = els.firebaseConfigInput.value.trim();
  const firebaseConfig = configText ? parseFirebaseConfig(configText) : DEFAULT_FIREBASE_CONFIG;
  if (configText) localStorage.setItem(ONLINE_CONFIG_KEY, configText);
  if (!online.modules) {
    const appModule = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`);
    const authModule = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`);
    const firestoreModule = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`);
    online.modules = { ...appModule, ...authModule, ...firestoreModule };
  }
  if (!online.app) {
    const { initializeApp, getAuth, signInAnonymously, getFirestore } = online.modules;
    online.app = initializeApp(firebaseConfig);
    online.auth = getAuth(online.app);
    online.db = getFirestore(online.app);
    await signInAnonymously(online.auth);
  }
}

function subscribeOnlineRoom() {
  if (online.unsubscribe) online.unsubscribe();
  const { onSnapshot } = online.modules;
  online.unsubscribe = onSnapshot(online.roomRef, (snapshot) => {
    const data = snapshot.data();
    if (!data?.state) return;
    online.isHost = data.hostId === online.clientId;
    const remoteVersion = Number(data.state.syncVersion ?? data.syncVersion) || 0;
    const localVersion = Number(state.syncVersion) || 0;
    if (data.state.phase === "setup") {
      data.state.setupCount = setupCountFromSeats(data.seats || {});
    }
    if (data.updatedBy === online.clientId && state.phase !== "setup") return;
    if (remoteVersion < localVersion) return;
    if (Date.now() < online.localDirtyUntil && remoteVersion <= localVersion) return;
    applyRemoteState(data.state);
  });
}

function applyRemoteState(remoteState) {
  online.isApplyingRemote = true;
  clearBattleLoops();
  state = normalizeGameState(remoteState);
  online.lastAppliedVersion = Number(state.syncVersion) || 0;
  online.localDirtyUntil = 0;
  selectedItem = null;
  scheduleOnlineBattleLoops();
  renderAll();
  online.isApplyingRemote = false;
}

function scheduleOnlineBattleLoops() {
  if (!online.enabled || !online.isHost || !state.battle) return;
  if (state.phase === "battlePrep") {
    if (isBattleReady()) battleTimerHandle = window.setTimeout(runBattle, 250);
  } else if (state.phase === "battle") {
    battleTickHandle = window.setInterval(battleTick, 250);
  }
}

function setOnlineStatus(text) {
  els.onlineStatus.textContent = text;
}

function makeRoomCode() {
  let code = "";
  for (let index = 0; index < 4; index += 1) code += String(rand(0, 9));
  return code;
}

function parseFirebaseConfig(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const configIndex = trimmed.indexOf("firebaseConfig");
  const searchStart = configIndex >= 0 ? configIndex : 0;
  const objectText = extractObjectLiteral(trimmed, searchStart);
  if (!objectText) throw new Error("Firebase 設定の { ... } 部分が見つかりません。");
  return Function(`"use strict"; return (${objectText});`)();
}

function extractObjectLiteral(text, searchStart) {
  const start = text.indexOf("{", searchStart);
  if (start < 0) return "";
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return "";
}

function structuredCloneForSync(value) {
  return JSON.parse(JSON.stringify(value));
}

function renderSetupVisibility() {
  const prepView = state.phase === "setup" || state.phase === "order";
  document.body.classList.toggle("prep-view", prepView);
  document.body.classList.toggle("game-view", !prepView);
  els.setupPanel.classList.toggle("hidden", state.phase !== "setup");
}

function renderBoard() {
  els.boardGrid.innerHTML = "";
  const board = activeBoard();
  const branches = activeBranches();
  els.boardGrid.style.gridTemplateColumns = "";
  const makeToken = (player) => {
    const token = document.createElement("span");
    token.className = "token";
    token.style.background = player.color;
    const avatar = document.createElement("span");
    avatar.className = "token-avatar";
    avatar.textContent = player.avatar || player.name.slice(-1);
    token.append(avatar);
    const gain = recentItemGainFor(player);
    if (gain) {
      const popup = document.createElement("span");
      popup.className = "item-gain-pop";
      popup.style.animationDelay = `-${Math.min(gain.elapsed, ITEM_GAIN_EFFECT_MS)}ms`;
      popup.textContent = gain.icons;
      token.append(popup);
    }
    if (uiEffects.happening?.playerId === player.id) {
      const happening = document.createElement("span");
      happening.className = `happening-pop ${uiEffects.happening.className}`;
      happening.innerHTML = `<span>${escapeHtml(uiEffects.happening.icon)}</span><strong>${escapeHtml(uiEffects.happening.label)}</strong>`;
      token.append(happening);
    }
    return token;
  };
  board.forEach((type, index) => {
    const info = spaceTypes[type];
    const space = document.createElement("div");
    space.className = "space";
    space.classList.add(`space-${type}`);
    if (currentPlayer()?.position === index) space.classList.add("active-space");
    if (uiEffects.space?.position === index) {
      space.classList.add("space-effect", `effect-${uiEffects.space.type}`);
    }
    space.style.setProperty("--space-color", info.color);
    space.innerHTML = `<div class="tokens"></div>`;
    const branch = branches.find((entry) => entry.from === index);
    if (branch) {
      space.classList.add("has-branch", `has-branch-${branch.side}`);
      const branchPath = document.createElement("div");
      branchPath.className = `branch-path branch-${branch.side}`;
      branch.spaces.forEach((branchType, branchIndex) => {
        const node = document.createElement("span");
        node.className = "branch-node";
        node.style.setProperty("--space-color", spaceTypes[branchType]?.color || spaceTypes.plus.color);
        const branchTokens = document.createElement("span");
        branchTokens.className = "branch-tokens";
        state.players
          .filter((player) => player.branch?.id === branch.id && player.branch.index === branchIndex)
          .forEach((player) => branchTokens.append(makeToken(player)));
        node.append(branchTokens);
        branchPath.append(node);
      });
      space.append(branchPath);
    }
    const tokens = space.querySelector(".tokens");
    state.players
      .filter((player) => !player.branch && player.position === index)
      .forEach((player) => {
        tokens.append(makeToken(player));
      });
    els.boardGrid.append(space);
  });
  const followPlayer = currentPlayer();
  if (followPlayer && els.boardWrap && !document.body.classList.contains("prep-view")) {
    const target = els.boardGrid.children[followPlayer.position];
    if (target) {
      window.requestAnimationFrame(() => {
        const left = target.offsetLeft + target.offsetWidth / 2 - els.boardWrap.clientWidth / 2;
        els.boardWrap.scrollTo({ left: Math.max(0, left), behavior: isAnimatingMove ? "auto" : "smooth" });
      });
    }
  }
}

function renderLegend() {
  els.legend.innerHTML = "";
  Object.entries(spaceTypes).forEach(([key, info]) => {
    if (key === "start") return;
    const item = document.createElement("div");
    item.className = "legend-item";
    item.style.setProperty("--space-color", info.color);
    item.innerHTML = `<span class="legend-chip"></span><span>${info.label}</span>`;
    els.legend.append(item);
  });
}

function renderPlayers() {
  els.playersList.innerHTML = "";
  state.players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "player-row";
    row.style.setProperty("--player-color", player.color);
    const active = currentPlayer()?.id === player.id && ["turn", "shop", "forge"].includes(state.phase);
    row.innerHTML = `
      <div class="player-main">
        <div class="player-name"><span class="avatar-dot" style="background:${player.color}">${player.avatar || ""}</span><span>${escapeHtml(player.name)}${active ? " / 行動中" : ""}</span></div>
        <div class="round-pill">順${index + 1}${player.orderRoll ? ` / ${player.orderRoll}` : ""}</div>
      </div>
      <div class="stats compact-stats">
        <span>💰 ${player.money}G</span>
        <span>📍 ${player.position + 1}</span>
        <span>🎒 ${player.stash.length}/3</span>
        <span>🎲 ${player.specialDice.length}</span>
        <span>▦ ${player.backpackW}×${player.backpackH}</span>
        <span>↻ ${player.turnCount}</span>
        <span>${player.nextBattlePenalty ? "⚠ 不利" : "✓ 通常"}</span>
      </div>
    `;
    els.playersList.append(row);
  });
}

function renderTurn() {
  const player = currentPlayer();
  els.diceFace.textContent = els.diceFace.textContent || "?";
  els.actionArea.innerHTML = "";

  if (state.phase === "setup") {
    els.turnTitle.textContent = online.enabled ? "参加待ち" : "ゲーム準備";
    return;
  }

  if (state.phase === "order") {
    const target = state.players[state.orderIndex];
    els.turnTitle.textContent = `${target.name} の順番決定`;
    const button = actionButton("1〜100ダイスを振る", "primary-button", rollOrderDice, !canControlPlayer(target));
    els.actionArea.append(button);
    return;
  }

  if (state.phase === "turn") {
    els.turnTitle.textContent = `${player.name} の行動ターン`;
    els.actionArea.append(actionButton("1〜6ダイスを振る", "primary-button", rollMoveDice, !canControlPlayer(player) || isAnimatingMove));
    normalizeSpecialDice(player);
    player.specialDice.forEach((die) => {
      const info = SPECIAL_DICE[die.type];
      if (!info) return;
      const button = actionButton(`${info.name} 残り${die.usesLeft}`, "secondary-button special-dice-button", () => rollMoveDice(die.uid), !canControlPlayer(player) || isAnimatingMove);
      button.innerHTML = `<img src="${info.image}" alt="" /> <span>${info.name}</span><small>残り${die.usesLeft}</small>`;
      els.actionArea.append(button);
    });
    return;
  }

  if (state.phase === "combatChoice") {
    els.turnTitle.textContent = `${player.name} の戦闘相手選択`;
    const opponents = livingPlayers().filter((other) => other.id !== player.id);
    const row = document.createElement("div");
    row.className = "action-row";
    opponents.forEach((opponent) => {
      row.append(actionButton(opponent.name, "danger-button", () => startBattle([player.id, opponent.id], false, "戦闘マス"), !canControlPlayer(player)));
    });
    els.actionArea.append(row);
    return;
  }

  if (state.phase === "shop" || state.phase === "forge") {
    els.turnTitle.textContent = `${player.name} の${state.phase === "shop" ? "ショップ" : "鍛造"}`;
    els.actionArea.append(actionButton("行動を終了", "secondary-button", closeShopOrForge, !canControlPlayer(player)));
    return;
  }

  if (state.phase === "battlePrep") {
    const ids = battleParticipantIds();
    const readyCount = ids.filter((id) => state.battle?.ready?.[id]).length;
    const readyPlayer = battleReadyPlayer();
    const isReady = readyPlayer ? Boolean(state.battle?.ready?.[readyPlayer.id]) : false;
    els.turnTitle.textContent = `戦闘準備 ${readyCount}/${ids.length}`;
    els.actionArea.append(actionButton(isReady ? "準備完了済み" : "準備完了", "danger-button", markBattleReady, !readyPlayer || isReady));
    return;
  }

  if (state.phase === "battle") {
    els.turnTitle.textContent = "自動戦闘中";
    return;
  }

  if (state.phase === "battleResult") {
    els.turnTitle.textContent = "戦闘結果";
    els.actionArea.append(actionButton("次のプレイヤーへ", "primary-button", continueAfterBattle));
    return;
  }

  if (state.phase === "gameover") {
    els.turnTitle.textContent = "ゲーム終了";
  }
}

function actionButton(label, className, handler, disabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener("click", handler);
  return button;
}

function ensureBackpackLimitNote() {
  if (document.getElementById("stashLimitNote")) return;
  const existing = document.querySelector(".backpack-panel .stash-limit-note");
  if (existing) {
    existing.id = "stashLimitNote";
    existing.textContent = "手持ちアイテムは3つまで";
    return;
  }
  const note = document.createElement("div");
  note.id = "stashLimitNote";
  note.className = "stash-limit-note";
  note.textContent = "手持ちアイテムは3つまで";
  els.editorSelect.insertAdjacentElement("afterend", note);
}

function renderBackpack() {
  ensureBackpackLimitNote();
  els.editorSelect.innerHTML = "";
  els.itemDetail.textContent = "";
  const visiblePlayers =
    online.enabled && online.playerId
      ? state.players.filter((player) => player.id === online.playerId)
      : online.enabled
        ? []
        : state.players;
  if (online.enabled && online.playerId) state.editorPlayerId = online.playerId;
  visiblePlayers.forEach((player) => {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = player.name;
    option.selected = player.id === state.editorPlayerId;
    els.editorSelect.append(option);
  });

  const player = selectedEditorPlayer();
  if (!player || (online.enabled && !canControlPlayer(player))) {
    els.stashList.innerHTML = "";
    els.backpackGrid.innerHTML = "";
    els.itemDetail.textContent = "";
    els.editLock.textContent = online.enabled ? "担当プレイヤーを選ぶと自分のバックパックだけ確認できます。" : "";
    return;
  }
  normalizeBackpack(player);

  const editable = canEditBackpack(player);
  els.editLock.textContent = editable
    ? ""
    : "";

  els.stashList.innerHTML = "";
  player.stash.forEach((stashItem) => {
    const item = itemById(stashItem.itemId);
    const card = renderItemCard(stashItem, item);
    card.disabled = !editable;
    card.draggable = editable;
    card.addEventListener("dragstart", (event) => {
      selectedItem = stashItem.uid;
      dragSource = "stash";
      event.dataTransfer.setData("text/plain", stashItem.uid);
      event.dataTransfer.effectAllowed = "move";
      showItemDetail(stashItem, item);
    });
    card.addEventListener("drag", (event) => {
      if (!event.clientX && !event.clientY) return;
      autoScrollDuringDrag(event.clientY);
      const cell = cellFromPoint(event.clientX, event.clientY);
      if (cell) setPlacementPreview(Number(cell.dataset.x), Number(cell.dataset.y));
    });
    card.addEventListener("dragend", () => {
      dragSource = null;
      clearPlacementPreview();
    });
    card.addEventListener("pointerdown", (event) => {
      if (!editable || event.pointerType === "mouse") return;
      selectedItem = stashItem.uid;
      dragSource = "stash";
      touchDrag = { uid: stashItem.uid, pointerId: event.pointerId, element: card };
      card.setPointerCapture?.(event.pointerId);
      card.classList.add("touch-dragging");
      showItemDetail(stashItem, item);
      event.preventDefault();
    });
    card.addEventListener("pointermove", (event) => {
      if (!touchDrag || touchDrag.uid !== stashItem.uid) return;
      autoScrollDuringDrag(event.clientY);
      const cell = cellFromPoint(event.clientX, event.clientY);
      if (cell) setPlacementPreview(Number(cell.dataset.x), Number(cell.dataset.y));
      event.preventDefault();
    });
    card.addEventListener("pointerup", (event) => {
      if (!touchDrag || touchDrag.uid !== stashItem.uid) return;
      const cell = cellFromPoint(event.clientX, event.clientY);
      card.releasePointerCapture?.(event.pointerId);
      card.classList.remove("touch-dragging");
      touchDrag = null;
      dragSource = null;
      placeFromCell(cell);
      event.preventDefault();
    });
    card.addEventListener("pointercancel", () => {
      card.classList.remove("touch-dragging");
      touchDrag = null;
      dragSource = null;
      clearPlacementPreview();
    });
    card.addEventListener("touchstart", (event) => {
      if (!editable || touchDrag) return;
      selectedItem = stashItem.uid;
      dragSource = "stash";
      touchDrag = { uid: stashItem.uid, touch: true, element: card };
      card.classList.add("touch-dragging");
      showItemDetail(stashItem, item);
      event.preventDefault();
    }, { passive: false });
    card.addEventListener("touchmove", (event) => {
      if (!touchDrag || touchDrag.uid !== stashItem.uid) return;
      const touch = event.touches[0];
      if (!touch) return;
      autoScrollDuringDrag(touch.clientY);
      const cell = cellFromPoint(touch.clientX, touch.clientY);
      if (cell) setPlacementPreview(Number(cell.dataset.x), Number(cell.dataset.y));
      event.preventDefault();
    }, { passive: false });
    card.addEventListener("touchend", (event) => {
      if (!touchDrag || touchDrag.uid !== stashItem.uid) return;
      const touch = event.changedTouches[0];
      const cell = touch ? cellFromPoint(touch.clientX, touch.clientY) : null;
      card.classList.remove("touch-dragging");
      touchDrag = null;
      dragSource = null;
      placeFromCell(cell);
      event.preventDefault();
    }, { passive: false });
    card.classList.toggle("selected", selectedItem === stashItem.uid);
    card.addEventListener("click", () => {
      selectedItem = selectedItem === stashItem.uid ? null : stashItem.uid;
      renderBackpack();
    });
    els.stashList.append(card);
  });
  if (!player.stash.length) {
    els.stashList.innerHTML = `<div class="message-box">手持ちアイテムはありません。</div>`;
  }

  els.backpackGrid.style.gridTemplateColumns = `repeat(${player.backpackW}, minmax(40px, 1fr))`;
  els.backpackGrid.style.gridTemplateRows = `repeat(${player.backpackH}, minmax(40px, 1fr))`;
  els.backpackGrid.innerHTML = "";
  for (let y = 0; y < player.backpackH; y += 1) {
    for (let x = 0; x < player.backpackW; x += 1) {
      const cell = document.createElement("button");
      cell.className = "grid-cell";
      cell.type = "button";
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      cell.dataset.cell = `${x},${y}`;
      cell.style.gridColumn = `${x + 1}`;
      cell.style.gridRow = `${y + 1}`;
      cell.setAttribute("aria-label", `slot ${x + 1}-${y + 1}`);
      cell.addEventListener("dragover", (event) => {
        if (!editable) return;
        event.preventDefault();
        setPlacementPreview(x, y);
      });
      cell.addEventListener("drop", (event) => {
        if (!editable) return;
        event.preventDefault();
        selectedItem = event.dataTransfer.getData("text/plain") || selectedItem;
        placeSelectedItem(x, y);
        clearPlacementPreview();
      });
      const placed = player.backpack.find((entry) =>
        occupiedCells(entry).some((spot) => spot.x === x && spot.y === y),
      );
      if (placed) {
        const item = itemById(placed.itemId);
        cell.classList.add("occupied", `rare-${item.rarity}`);
        if (placed.x === x && placed.y === y) cell.classList.add("anchor");
        cell.addEventListener("click", () => {
          selectedItem = placed.uid;
          renderBackpack();
        });
      } else {
        cell.disabled = !editable;
        cell.addEventListener("click", () => placeSelectedItem(x, y));
      }
      els.backpackGrid.append(cell);
    }
  }
  player.backpack.forEach((entry) => {
    const item = itemById(entry.itemId);
    if (!item) return;
    const width = item.w;
    const height = item.h;
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `placed-item-tile rare-${item.rarity}`;
    tile.innerHTML = `
      <span class="placed-item-icon">${itemIcons[item.id] || "🎁"}</span>
      <span class="placed-item-name">${escapeHtml(item.name)}</span>
      <span class="placed-item-level">+${entry.level - 1}</span>
    `;
    tile.draggable = editable;
    tile.addEventListener("click", () => {
      selectedItem = selectedItem === entry.uid ? null : entry.uid;
      showItemDetail(entry, item);
      renderBackpack();
    });
    tile.addEventListener("dragstart", (event) => {
      if (!editable) return;
      selectedItem = entry.uid;
      dragSource = "backpack";
      event.dataTransfer.setData("text/plain", entry.uid);
      showItemDetail(entry, item);
    });
    tile.addEventListener("drag", (event) => {
      if (!event.clientY) return;
      autoScrollDuringDrag(event.clientY);
    });
    tile.addEventListener("dragend", () => {
      dragSource = null;
      clearPlacementPreview();
    });
    tile.addEventListener("pointerdown", (event) => {
      if (!editable || event.pointerType === "mouse") return;
      selectedItem = entry.uid;
      dragSource = "backpack";
      touchDrag = { uid: entry.uid, pointerId: event.pointerId, element: tile };
      tile.setPointerCapture?.(event.pointerId);
      tile.classList.add("touch-dragging");
      showItemDetail(entry, item);
    });
    tile.addEventListener("pointermove", (event) => {
      if (!touchDrag || touchDrag.uid !== entry.uid) return;
      autoScrollDuringDrag(event.clientY);
      const cell = cellFromPoint(event.clientX, event.clientY);
      if (cell) setPlacementPreview(Number(cell.dataset.x), Number(cell.dataset.y));
    });
    tile.addEventListener("pointerup", (event) => {
      if (!touchDrag || touchDrag.uid !== entry.uid) return;
      const cell = cellFromPoint(event.clientX, event.clientY);
      tile.releasePointerCapture?.(event.pointerId);
      tile.classList.remove("touch-dragging");
      touchDrag = null;
      dragSource = null;
      placeFromCell(cell);
    });
    tile.addEventListener("pointercancel", () => {
      tile.classList.remove("touch-dragging");
      touchDrag = null;
      dragSource = null;
      clearPlacementPreview();
    });
    tile.addEventListener("touchstart", (event) => {
      if (!editable || touchDrag) return;
      selectedItem = entry.uid;
      dragSource = "backpack";
      touchDrag = { uid: entry.uid, touch: true, element: tile };
      tile.classList.add("touch-dragging");
      showItemDetail(entry, item);
      event.preventDefault();
    }, { passive: false });
    tile.addEventListener("touchmove", (event) => {
      if (!touchDrag || touchDrag.uid !== entry.uid) return;
      const touch = event.touches[0];
      if (!touch) return;
      autoScrollDuringDrag(touch.clientY);
      const cell = cellFromPoint(touch.clientX, touch.clientY);
      if (cell) setPlacementPreview(Number(cell.dataset.x), Number(cell.dataset.y));
      event.preventDefault();
    }, { passive: false });
    tile.addEventListener("touchend", (event) => {
      if (!touchDrag || touchDrag.uid !== entry.uid) return;
      const touch = event.changedTouches[0];
      const cell = touch ? cellFromPoint(touch.clientX, touch.clientY) : null;
      tile.classList.remove("touch-dragging");
      touchDrag = null;
      dragSource = null;
      placeFromCell(cell);
      event.preventDefault();
    }, { passive: false });
    tile.addEventListener("touchcancel", () => {
      tile.classList.remove("touch-dragging");
      touchDrag = null;
      dragSource = null;
      clearPlacementPreview();
    });
    tile.classList.toggle("selected", selectedItem === entry.uid);
    els.backpackGrid.append(tile);
    positionPlacedTile(tile, { ...entry, w: width, h: height });
  });
  renderPlacementPreview();

  renderSelectedDetail(player);
}

function renderItemCard(stashItem, item) {
  const card = document.createElement("button");
  card.className = `item-card rare-${item.rarity}`;
  card.type = "button";
  card.innerHTML = `
    <span class="rarity-dot"></span>
    <span class="item-name"><span class="item-icon">${itemIcons[item.id] || "🎁"}</span>${escapeHtml(item.name)} +${stashItem.level - 1}</span>
    <span class="item-meta">${rarityNames[item.rarity]} / ${item.w}×${item.h}<br>${escapeHtml(shortEffect(item))}</span>
  `;
  card.addEventListener("mouseenter", () => showItemDetail(stashItem, item));
  card.addEventListener("focus", () => showItemDetail(stashItem, item));
  return card;
}

function shortEffect(item) {
  if (item.damage) return `攻撃 ${item.damage}`;
  if (item.heal) return `回復 ${item.heal}`;
  if (item.income) return `収入 ${item.income}G`;
  if (item.boost || item.boostAll) return "強化";
  if (item.poison) return `毒 ${item.poison}`;
  return "特殊";
}

function showItemDetail(stashItem, item) {
  els.itemDetail.innerHTML = `<strong>${itemIcons[item.id] || "🎁"} ${escapeHtml(item.name)} +${stashItem.level - 1}</strong><br>${escapeHtml(item.description)}<br>価格 ${item.price}G / 売却 ${item.sell + (stashItem.level - 1) * 15}G`;
}

function renderSelectedDetail(player) {
  const item =
    player.stash.find((entry) => entry.uid === selectedItem) ||
    player.backpack.find((entry) => entry.uid === selectedItem);
  if (!item) return;
  showItemDetail(item, itemById(item.itemId));
}

function renderShop() {
  const player = currentPlayer();
  const visible = ["shop", "forge"].includes(state.phase) && (!online.enabled || canControlPlayer(player));
  els.shopPanel.classList.toggle("hidden", !visible);
  els.shopContent.innerHTML = "";
  if (!player || !visible) return;
  const moneyBadge = document.createElement("div");
  moneyBadge.className = "shop-money";
  moneyBadge.innerHTML = `<span>所持金</span><strong>${player.money}G</strong>`;
  els.shopContent.append(moneyBadge);

  if (state.phase === "shop") {
    els.shopTitle.textContent = "ショップ";
    const grid = document.createElement("div");
    grid.className = "shop-grid";
    state.pendingShop.forEach((shopItem) => {
      const item = itemById(shopItem.itemId);
      const price = Math.floor(item.price * (player.shopDiscount ? 0.5 : 1));
      const card = document.createElement("div");
      card.className = "shop-item";
      card.innerHTML = `<h3><span class="item-icon">${itemIcons[item.id] || "🎁"}</span>${escapeHtml(item.name)}</h3><p>${rarityNames[item.rarity]} / ${item.w}×${item.h}<br>${escapeHtml(item.description)}</p>`;
      card.append(actionButton(`${price}Gで購入`, "secondary-button", () => buyShopItem(shopItem.uid)));
      grid.append(card);
    });
    els.shopContent.append(grid);
    if (Array.isArray(state.pendingShopDice) && state.pendingShopDice.length) {
      const diceTitle = document.createElement("h3");
      diceTitle.className = "shop-subtitle";
      diceTitle.textContent = "特殊サイコロ";
      const diceGrid = document.createElement("div");
      diceGrid.className = "shop-grid dice-shop-grid";
      state.pendingShopDice.forEach((die) => {
        const info = SPECIAL_DICE[die.type];
        if (!info) return;
        const card = document.createElement("div");
        card.className = "shop-item dice-shop-item";
        card.innerHTML = `<img src="${info.image}" alt="" /><h3>${info.name}</h3><p>1〜${info.sides} / ${info.uses}回使用<br>価格 ${info.price}G</p>`;
        card.append(actionButton(`${info.price}Gで購入`, "secondary-button", () => buySpecialDice(die.uid)));
        diceGrid.append(card);
      });
      els.shopContent.append(diceTitle, diceGrid);
    }
    const expansionCost = 200 + Math.max(0, player.backpackW + player.backpackH - 8) * 100;
    els.shopContent.append(actionButton(`バックパック拡張 ${expansionCost}G`, "secondary-button", buyBackpackExpansion));
    const sellGrid = document.createElement("div");
    sellGrid.className = "shop-grid sell-grid";
    player.stash.forEach((stashItem) => {
      const item = itemById(stashItem.itemId);
      const card = document.createElement("div");
      card.className = "shop-item";
      const sell = item.sell + (stashItem.level - 1) * 15;
      card.innerHTML = `<h3><span class="item-icon">${itemIcons[item.id] || "🎁"}</span>${escapeHtml(item.name)}</h3><p>${rarityNames[item.rarity]} / 売却 ${sell}G</p>`;
      card.append(actionButton("売却", "secondary-button", () => sellStashItem(stashItem.uid)));
      sellGrid.append(card);
    });
    if (player.stash.length) {
      const heading = document.createElement("h3");
      heading.className = "shop-subtitle";
      heading.textContent = "手持ち売却";
      els.shopContent.append(heading, sellGrid);
    }
  } else if (state.phase === "forge") {
    els.shopTitle.textContent = "鍛造";
    const synthGrid = document.createElement("div");
    synthGrid.className = "shop-grid synth-grid";
    const candidates = synthesisCandidates(player);
    candidates.forEach((candidate) => {
      const stashItem = candidate.entry;
      const item = itemById(stashItem.itemId);
      const card = document.createElement("div");
      card.className = `shop-item synth-item ${selectedSynthesis.includes(stashItem.uid) ? "selected" : ""}`;
      card.innerHTML = `<h3><span class="item-icon">${itemIcons[item.id] || "🎁"}</span>${escapeHtml(item.name)} +${stashItem.level - 1}</h3><p>${candidate.source} / ${rarityNames[item.rarity]} / ${item.w}×${item.h}</p>`;
      card.append(actionButton(selectedSynthesis.includes(stashItem.uid) ? "選択中" : "合成に選ぶ", "secondary-button", () => toggleSynthesisItem(stashItem.uid)));
      synthGrid.append(card);
    });
    if (candidates.length) {
      const synthTitle = document.createElement("h3");
      synthTitle.className = "shop-subtitle";
      synthTitle.textContent = "合成するアイテムを2つ選択";
      els.shopContent.append(synthTitle, synthGrid);
    }
    const grid = document.createElement("div");
    grid.className = "shop-grid";
    player.backpack.forEach((entry) => {
      const item = itemById(entry.itemId);
      const card = document.createElement("div");
      card.className = "shop-item";
      card.innerHTML = `<h3><span class="item-icon">${itemIcons[item.id] || "🎁"}</span>${escapeHtml(item.name)} +${entry.level - 1}</h3><p>強化費用 ${70 + entry.level * 45}G</p>`;
      card.append(actionButton("強化", "secondary-button", () => upgradePlacedItem(entry.uid)));
      grid.append(card);
    });
    els.shopContent.append(grid);
    els.shopContent.append(actionButton(`選択した2個を合成 (${selectedSynthesis.length}/2)`, "secondary-button", synthesizeItems, selectedSynthesis.length !== 2));
  }
}

function renderVictoryCelebration() {
  const winner = state.players.find((player) => player.id === state.winnerId) || livingPlayers()[0] || state.players[0];
  if (!winner) return;
  els.battleTimer.textContent = "完全勝利";
  const shinePieces = Array.from({ length: 18 }, (_, index) => `<span style="--i:${index}"></span>`).join("");
  els.battleArena.innerHTML = `
    <div class="victory-celebration" style="--winner-color:${winner.color || "#d7a12b"}">
      <div class="victory-confetti">${shinePieces}</div>
      <div class="victory-crown">👑</div>
      <div class="victory-avatar" style="background:${winner.color || "#fff4c4"}">${escapeHtml(winner.avatar || "😀")}</div>
      <h3>勝者</h3>
      <strong>${escapeHtml(winner.name)}</strong>
      <p>死は救済すごろく、人生終了ゲームを制しました。</p>
    </div>
  `;
}

function renderBattle() {
  els.battlePanel.classList.toggle("hidden", !["battlePrep", "battle", "battleResult", "final", "gameover"].includes(state.phase) && !state.battle);
  els.battleArena.innerHTML = "";
  if (state.phase === "gameover") {
    renderVictoryCelebration();
    return;
  }
  if (!state.battle) {
    els.battleTimer.textContent = "待機";
    return;
  }

  const battle = state.battle;
  if (state.phase === "battlePrep" || state.phase === "final") {
    const ids = battleParticipantIds();
    const readyCount = ids.filter((id) => battle.ready?.[id]).length;
    els.battleTimer.textContent = `準備 ${readyCount}/${ids.length}`;
  } else if (state.phase === "battle") {
    els.battleTimer.textContent = "自動戦闘";
  } else {
    els.battleTimer.textContent = "結果";
  }

  battle.participants.forEach((fighter) => {
    const player = state.players.find((p) => p.id === fighter.playerId);
    const row = document.createElement("div");
    row.className = "fighter";
    const actorEffect = recentBattleActionFor(player.id, "actor");
    let targetEffect = recentBattleActionFor(player.id, "target");
    if (actorEffect?.id && actorEffect.id === targetEffect?.id) targetEffect = null;
    if (actorEffect) row.classList.add(actorEffect.type === "heal" || actorEffect.type === "ready" ? "fighter-ready" : "fighter-acting");
    if (targetEffect) row.classList.add(targetEffect.type === "heal" ? "fighter-ready" : "fighter-hit");
    const hpMax = fighter.maxHp || 100;
    const hpPercent = clamp((Math.max(0, fighter.hp) / hpMax) * 100, 0, 100);
    const readyMark = state.phase === "battlePrep"
      ? `<span class="ready-mark ${battle.ready?.[player.id] ? "ready" : ""}">${battle.ready?.[player.id] ? "READY" : "WAIT"}</span>`
      : "";
    row.innerHTML = `
      <div class="fighter-head"><span>${escapeHtml(player.name)} ${readyMark}</span><span>${Math.max(0, Math.round(fighter.hp))}/${hpMax} HP / 盾 ${fighter.shield}</span></div>
      <div class="hp-bar"><span class="hp-fill" style="--hp:${hpPercent}%"></span></div>
      ${targetEffect ? `<div class="battle-pop damage-pop" style="animation-delay:-${Math.min(targetEffect.elapsed, BATTLE_ACTION_EFFECT_MS)}ms">${escapeHtml(targetEffect.label)}</div>` : ""}
      ${actorEffect ? `<div class="battle-pop action-pop" style="animation-delay:-${Math.min(actorEffect.elapsed, BATTLE_ACTION_EFFECT_MS)}ms">${escapeHtml(actorEffect.label)}</div>` : ""}
      <div class="battle-items">${renderBattleItems(player, fighter)}</div>
    `;
    els.battleArena.append(row);
  });

  const feed = document.createElement("div");
  feed.className = "battle-feed";
  feed.innerHTML = battle.feed.slice(0, 12).map((line) => `<div>${escapeHtml(line)}</div>`).join("");
  els.battleArena.append(feed);
}

function renderBattleItems(player, fighter) {
  const entries = placedItems(player).filter((entry) => {
    const item = itemById(entry.itemId);
    return item.damage || item.poison || item.heal || item.boost || item.boostAll || item.shield || item.weaken;
  });
  if (!entries.length) return `<div class="battle-item muted">装備なし</div>`;
  return entries
    .map((entry) => {
      const item = itemById(entry.itemId);
      const cooldown = fighter.cooldowns?.[entry.uid] || 0;
      const interval = item.interval || (item.damage || item.poison || item.heal ? 2500 : 0);
      const progress = interval ? clamp(100 - (cooldown / interval) * 100, 0, 100) : 100;
      const label = interval ? `${Math.ceil(cooldown / 1000)}s` : "常時";
      return `<div class="battle-item rare-${item.rarity}">
        <span>${itemIcons[item.id] || "🎁"}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <em>${label}</em>
        <i style="--ready:${progress}%"></i>
      </div>`;
    })
    .join("");
}

function renderLog() {
  els.logList.innerHTML = state.log
    .slice(-60)
    .map((entry) => `<div class="log-entry">${escapeHtml(entry.text)}</div>`)
    .join("");
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  addLog("ゲームをブラウザに保存しました。");
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) {
    addLog("保存データがありません。");
    return;
  }
  clearBattleLoops();
  state = normalizeGameState(JSON.parse(saved));
  selectedItem = null;
  addLog("保存データを読み込みました。");
  renderAll();
}

function resetGame() {
  clearBattleLoops();
  state = newGameState();
  selectedItem = null;
  els.diceFace.textContent = "?";
  addLog("ゲームをリセットしました。");
  renderSetup();
  renderAll();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("beforeunload", () => {
  window.clearInterval(renderTimerHandle);
  clearBattleLoops();
});

init();
