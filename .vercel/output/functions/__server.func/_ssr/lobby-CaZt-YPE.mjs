import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { W as isRedirect, b as useNavigate, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as ROOM_CODE_RE, i as FIB_CARDS, n as AVATARS, r as CARD_LABEL } from "./poker-BRGI0D5v.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
import { a as Plus, d as Coffee, f as CircleHelp, m as ArrowRight, n as Sparkles, o as Infinity$1, s as Hash } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lobby-CaZt-YPE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var KEY = "mesa-fibo-profile";
function newId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function emptyProfile() {
	return {
		memberId: newId(),
		name: "",
		emoji: AVATARS[0]
	};
}
function loadProfile() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return emptyProfile();
		const parsed = JSON.parse(raw);
		const emoji = typeof parsed.emoji === "string" && AVATARS.includes(parsed.emoji) ? parsed.emoji : AVATARS[0];
		return {
			memberId: typeof parsed.memberId === "string" && parsed.memberId.length >= 8 ? parsed.memberId : newId(),
			name: typeof parsed.name === "string" ? parsed.name.slice(0, 50) : "",
			emoji
		};
	} catch {
		return emptyProfile();
	}
}
function saveProfile(profile) {
	localStorage.setItem(KEY, JSON.stringify(profile));
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var identityFields = {
	memberId: string().min(8).max(80),
	name: string().trim().min(1).max(50),
	emoji: string().min(1).max(16)
};
var identitySchema = object(identityFields);
var roomIdentitySchema = object({
	...identityFields,
	code: string().regex(ROOM_CODE_RE)
});
var heartbeatSchema = object({
	code: string().regex(ROOM_CODE_RE),
	memberId: string().min(8).max(80)
});
var storySchema = heartbeatSchema.extend({ story: string().max(200) });
var voteSchema = heartbeatSchema.extend({ card: string().min(1).max(16) });
var nextRoundSchema = heartbeatSchema.extend({ story: string().max(200).optional() });
var createRoom = createServerFn({ method: "POST" }).validator((data) => identitySchema.parse(data)).handler(createSsrRpc("25bff56d3ab39c0ea842e207bd91f4976c52f9a7bb441a8fe3590e3fec4460e9"));
var joinRoom = createServerFn({ method: "POST" }).validator((data) => roomIdentitySchema.parse(data)).handler(createSsrRpc("fb7d9aedc321f17bdff61b3dcee87b244419708c904f20739c9b5f8b911743c6"));
var getRoom = createServerFn({ method: "POST" }).validator((data) => heartbeatSchema.parse(data)).handler(createSsrRpc("111e592024735c6e6565d15afe2f34107ca026ba7b34b294522d2e9b7562484c"));
var leaveRoom = createServerFn({ method: "POST" }).validator((data) => heartbeatSchema.parse(data)).handler(createSsrRpc("dd5f2ddd64492531f62e4035db6987eb070e44caf07a100b18fe1b1e0235660e"));
var setStory = createServerFn({ method: "POST" }).validator((data) => storySchema.parse(data)).handler(createSsrRpc("88b2fdfdd38e51b386c9197c5bb0c130409113578c4b52de919bbbfb2e2eeeb0"));
var castVote = createServerFn({ method: "POST" }).validator((data) => voteSchema.parse(data)).handler(createSsrRpc("2bbd6b1bdda510def209a693e7ae247ba133a8c9e6afab392c0f94b0c90a9252"));
var revealVotes = createServerFn({ method: "POST" }).validator((data) => heartbeatSchema.parse(data)).handler(createSsrRpc("6b462f1bbcc897ce0100e7fce03697dc40527d530295ed15b185a4702041d524"));
var nextRound = createServerFn({ method: "POST" }).validator((data) => nextRoundSchema.parse(data)).handler(createSsrRpc("3e2e66a89bf84f19627b4b82264758fec0fab84581bad77ca32ee932ca965f6b"));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline: "border border-border bg-transparent text-foreground hover:bg-accent",
			ghost: "text-foreground hover:bg-accent",
			paper: "bg-paper text-paper-ink hover:bg-paper/90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-lg px-6",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-border bg-secondary px-3 text-base text-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-foreground", className),
		...props
	});
}
function FiboMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("text-ring", className),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 28c-6.627 0-12-5.373-12-12S9.373 4 16 4",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 4c4.418 0 8 3.582 8 8s-3.582 8-8 8",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 20c-2.209 0-4-1.791-4-4s1.791-4 4-4",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "1.4",
				fill: "currentColor"
			})
		]
	});
}
function BrandLockup({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FiboMark, { className: "size-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-lg font-semibold tracking-tight text-foreground",
			children: "Mesa Fibo"
		})]
	});
}
function IdentityForm({ profile, onChange, onSubmit, submitLabel, pending, extra, disabled }) {
	const canSubmit = profile.name.trim().length > 0 && !pending && !disabled;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-5",
		onSubmit: (event) => {
			event.preventDefault();
			if (canSubmit) onSubmit();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "player-name",
						children: "Tu nombre"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "player-name",
						maxLength: 50,
						autoComplete: "nickname",
						placeholder: "Hasta 50 caracteres",
						value: profile.name,
						onChange: (event) => onChange({
							...profile,
							name: event.target.value.slice(0, 50)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground tabular-nums",
						children: [
							profile.name.trim().length,
							"/",
							50
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-sm font-medium text-foreground",
					children: "Elige tu avatar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-7 gap-1.5",
					children: AVATARS.map((emoji) => {
						const selected = profile.emoji === emoji;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Avatar ${emoji}`,
							"aria-pressed": selected,
							onClick: () => onChange({
								...profile,
								emoji
							}),
							className: cn("flex size-11 items-center justify-center rounded-md text-xl transition-[background-color,box-shadow] duration-150", selected ? "bg-paper shadow-[var(--shadow-border-hover)]" : "bg-secondary hover:bg-accent"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: emoji
							})
						}, emoji);
					})
				})]
			}),
			extra,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "lg",
				disabled: !canSubmit,
				className: "w-full",
				children: pending ? "Un momento…" : submitLabel
			})
		]
	});
}
var SIZE = {
	sm: "w-14 h-20",
	md: "w-16 h-24",
	lg: "w-20 h-32"
};
function FaceArt({ card, size }) {
	const iconClass = size === "lg" ? "size-8" : size === "md" ? "size-6" : "size-5";
	const numberClass = size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-xl";
	if (card === "coffee") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, {
			className: iconClass,
			strokeWidth: 1.6
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-2xs font-medium uppercase tracking-wide",
			children: "Café"
		})]
	});
	if (card === "question") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, {
			className: iconClass,
			strokeWidth: 1.6
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-2xs font-medium uppercase tracking-wide",
			children: "Duda"
		})]
	});
	if (card === "infinity") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Infinity$1, {
			className: iconClass,
			strokeWidth: 1.6
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-2xs font-medium uppercase tracking-wide",
			children: "Infinito"
		})]
	});
	if (card === "wildcard") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			className: iconClass,
			strokeWidth: 1.6
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-2xs font-medium uppercase tracking-wide",
			children: "Comodín"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("font-display font-semibold leading-none", numberClass),
		children: card
	});
}
function PaperFace({ card, size }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full flex-col items-center justify-between bg-paper p-1.5 text-paper-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "self-start font-display text-2xs font-semibold leading-none text-paper-muted",
				children: CARD_LABEL[card]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaceArt, {
				card,
				size
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "self-end font-display text-2xs font-semibold leading-none text-paper-muted",
				children: CARD_LABEL[card]
			})
		]
	});
}
function CardBack() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "card-back-pattern flex h-full w-full items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-5 rounded-full border border-ring/40" })
	});
}
function VoteCard({ card, size = "md", selected = false, face = "front", onSelect, disabled = false, label }) {
	const interactive = Boolean(onSelect) && !disabled;
	const className = cn(SIZE[size], "relative overflow-hidden rounded-md shadow-[var(--shadow-border)]", selected && "ring-2 ring-ring ring-offset-2 ring-offset-background", face === "empty" && "border border-dashed border-border bg-transparent shadow-none", interactive && "transition-transform duration-150 ease-out hover:-translate-y-0.5");
	const inner = face === "empty" ? null : face === "back" || !card ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardBack, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperFace, {
		card,
		size
	});
	if (interactive) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onSelect,
		disabled,
		"aria-pressed": selected,
		"aria-label": label ?? (card ? `Votar ${CARD_LABEL[card]}` : "Carta"),
		className,
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		"aria-hidden": !label,
		"aria-label": label,
		children: inner
	});
}
function SeatCard({ card, hasVoted, revealed, name }) {
	if (!hasVoted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoteCard, {
		face: "empty",
		size: "sm",
		label: `${name} aún no vota`
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "card-scene",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("card-3d h-20 w-14", revealed && "is-revealed"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card-face card-face-back overflow-hidden rounded-md shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardBack, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card-face card-face-front overflow-hidden rounded-md shadow-[var(--shadow-border)]",
				children: card ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperFace, {
					card,
					size: "sm"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardBack, {})
			})]
		})
	});
}
function Lobby({ presetCode = "" }) {
	const navigate = useNavigate();
	const createRoomFn = useServerFn(createRoom);
	const joinRoomFn = useServerFn(joinRoom);
	const [profile, setProfile] = (0, import_react.useState)(emptyProfile);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)(presetCode ? "join" : "create");
	const [code, setCode] = (0, import_react.useState)(presetCode);
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setProfile(loadProfile());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (presetCode) {
			setCode(presetCode);
			setMode("join");
		}
	}, [presetCode]);
	const fan = (0, import_react.useMemo)(() => FIB_CARDS.slice(0, 5), []);
	async function handleCreate() {
		setPending(true);
		saveProfile(profile);
		try {
			const result = await createRoomFn({ data: {
				memberId: profile.memberId,
				name: profile.name,
				emoji: profile.emoji
			} });
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			await navigate({
				to: "/sala/$code",
				params: { code: result.room.code }
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo crear la sala.");
		} finally {
			setPending(false);
		}
	}
	async function handleJoin() {
		const trimmed = code.replace(/\D/g, "").slice(0, 6);
		if (!ROOM_CODE_RE.test(trimmed)) {
			toast.error("El código es un número de 6 cifras.");
			return;
		}
		setPending(true);
		saveProfile(profile);
		try {
			const result = await joinRoomFn({ data: {
				code: trimmed,
				memberId: profile.memberId,
				name: profile.name,
				emoji: profile.emoji
			} });
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			await navigate({
				to: "/sala/$code",
				params: { code: result.room.code }
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo entrar a la sala.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "felt-bg mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-8 sm:py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLockup, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "stagger-in flex flex-col gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-widest text-muted-foreground",
						children: "Planning poker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl",
						children: "Vota historias con cartas Fibonacci."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-base text-muted-foreground",
						children: "Crea una sala, comparte el número con tu equipo (hasta 15 personas) y estimad en silencio. Nadie ve el voto del otro hasta que reveláis juntos."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative mt-2 flex h-36 items-end justify-center sm:h-44",
						children: fan.map((card, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute origin-bottom",
							style: { transform: `translateX(${(index - 2) * 28}px) rotate(${(index - 2) * 8}deg)` },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoteCard, {
								card,
								size: "lg",
								face: "front"
							})
						}, card))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "grid gap-3 text-sm text-muted-foreground sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg bg-card p-4 shadow-[var(--shadow-border)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: "1. Entra"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1",
									children: "Nombre corto y un avatar. Luego crea o únete con el código."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg bg-card p-4 shadow-[var(--shadow-border)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: "2. Invita"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1",
									children: "Comparte el número de 6 cifras. El resto entra a la misma mesa."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg bg-card p-4 shadow-[var(--shadow-border)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: "3. Vota"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1",
									children: "1, 2, 3, 5, 8, 13, 21, 100, más comodín, duda, café e infinito."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg bg-card p-4 shadow-[var(--shadow-border)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: "4. Revelad"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1",
									children: "Cuando todos hayan elegido, se dan la vuelta las cartas."
								})]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5 grid grid-cols-2 rounded-lg bg-secondary p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setMode("create"),
							className: `flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 ${mode === "create" ? "bg-paper text-paper-ink" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Crear sala"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setMode("join"),
							className: `flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 ${mode === "join" ? "bg-paper text-paper-ink" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-4" }), "Unirme"]
						})]
					}),
					ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentityForm, {
						profile,
						onChange: setProfile,
						pending,
						submitLabel: mode === "create" ? "Abrir una sala" : "Entrar a la sala",
						onSubmit: mode === "create" ? handleCreate : handleJoin,
						extra: mode === "join" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "room-code",
								children: "Número de sala"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "room-code",
								inputMode: "numeric",
								autoComplete: "off",
								maxLength: 6,
								placeholder: "123456",
								value: code,
								onChange: (event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6)),
								className: "font-display text-center text-xl tracking-widest"
							})]
						}) : null
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-lg bg-secondary" }),
					mode === "create" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 flex items-center gap-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" }), "Tú serás el anfitrión: escribes la historia y abres cada ronda."]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs text-muted-foreground",
						children: "Pide el número de 6 cifras a quien creó la sala."
					})
				]
			})]
		})]
	});
}
function JoinOnly({ code, onJoined }) {
	const navigate = useNavigate();
	const joinRoomFn = useServerFn(joinRoom);
	const [profile, setProfile] = (0, import_react.useState)(emptyProfile);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setProfile(loadProfile());
		setReady(true);
	}, []);
	async function handleJoin() {
		setPending(true);
		saveProfile(profile);
		try {
			const result = await joinRoomFn({ data: {
				code,
				memberId: profile.memberId,
				name: profile.name,
				emoji: profile.emoji
			} });
			if (!result.ok) {
				toast.error(result.message);
				if (result.reason === "not-found") await navigate({ to: "/" });
				return;
			}
			onJoined(result.room);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo entrar.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "felt-bg mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-4 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLockup, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-widest text-muted-foreground",
					children: "Invitación"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-2 font-display text-3xl font-semibold tracking-tight",
					children: ["Sala ", code]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 mb-6 text-sm text-muted-foreground",
					children: "Entra con tu nombre y avatar para sentarte a votar."
				}),
				ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentityForm, {
					profile,
					onChange: setProfile,
					pending,
					submitLabel: "Sentarme en la mesa",
					onSubmit: handleJoin
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-lg bg-secondary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "mt-3 w-full",
					onClick: () => navigate({ to: "/" }),
					children: "Ir al inicio"
				})
			]
		})]
	});
}
//#endregion
export { Lobby as a, castVote as c, leaveRoom as d, loadProfile as f, useServerFn as g, setStory as h, JoinOnly as i, cn as l, revealVotes as m, Button as n, SeatCard as o, nextRound as p, Input as r, VoteCard as s, BrandLockup as t, getRoom as u };
