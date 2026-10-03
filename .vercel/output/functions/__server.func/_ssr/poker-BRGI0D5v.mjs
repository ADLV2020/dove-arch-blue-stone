//#region node_modules/.nitro/vite/services/ssr/assets/poker-BRGI0D5v.js
var ROOM_CODE_RE = /^\d{6}$/;
var FIB_CARDS = [
	"1",
	"2",
	"3",
	"5",
	"8",
	"13",
	"21",
	"100"
];
var SPECIAL_CARDS = [
	"wildcard",
	"question",
	"coffee",
	"infinity"
];
var ALL_CARDS = [...FIB_CARDS, ...SPECIAL_CARDS];
var CARD_NUMERIC = {
	"1": 1,
	"2": 2,
	"3": 3,
	"5": 5,
	"8": 8,
	"13": 13,
	"21": 21,
	"100": 100
};
var CARD_LABEL = {
	"1": "1",
	"2": "2",
	"3": "3",
	"5": "5",
	"8": "8",
	"13": "13",
	"21": "21",
	"100": "100",
	wildcard: "Comodín",
	question: "?",
	coffee: "Café",
	infinity: "∞"
};
var AVATARS = [
	"🦊",
	"🐺",
	"🐱",
	"🐯",
	"🦁",
	"🐻",
	"🐼",
	"🐨",
	"🐸",
	"🦉",
	"🐧",
	"🐤",
	"🐙",
	"🦄",
	"🐲",
	"🦋",
	"🐢",
	"🐝",
	"🐳",
	"🌸",
	"🍀",
	"🌙",
	"🔥",
	"⚡",
	"🎩",
	"🎲",
	"🧭",
	"🎯"
];
function isCardId(value) {
	return ALL_CARDS.includes(value);
}
function isAvatar(value) {
	return AVATARS.includes(value);
}
function computeStats(votes) {
	const counts = /* @__PURE__ */ new Map();
	for (const card of votes) counts.set(card, (counts.get(card) ?? 0) + 1);
	const tally = ALL_CARDS.filter((card) => counts.has(card)).map((card) => ({
		card,
		count: counts.get(card) ?? 0
	}));
	const nums = votes.map((card) => CARD_NUMERIC[card]).filter((n) => typeof n === "number");
	if (nums.length === 0) return {
		average: null,
		min: null,
		max: null,
		consensus: false,
		tally
	};
	const sum = nums.reduce((a, b) => a + b, 0);
	const min = Math.min(...nums);
	const max = Math.max(...nums);
	return {
		average: Math.round(sum / nums.length * 10) / 10,
		min,
		max,
		consensus: nums.every((n) => n === nums[0]),
		tally
	};
}
//#endregion
export { ROOM_CODE_RE as a, isCardId as c, FIB_CARDS as i, AVATARS as n, computeStats as o, CARD_LABEL as r, isAvatar as s, ALL_CARDS as t };
