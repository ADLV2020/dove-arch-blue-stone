import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { r as CARD_LABEL, t as ALL_CARDS } from "./poker-BRGI0D5v.mjs";
import { c as Eye, i as RotateCcw, l as DoorOpen, p as Check, r as Share2, u as Copy } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route } from "./router-6zsIXMps.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { c as castVote, d as leaveRoom, f as loadProfile, g as useServerFn, h as setStory, i as JoinOnly, l as cn, m as revealVotes, n as Button, o as SeatCard, p as nextRound, r as Input, s as VoteCard, t as BrandLockup, u as getRoom } from "./lobby-CaZt-YPE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sala._code-CG49COhF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums", {
	variants: { variant: {
		default: "bg-accent text-accent-foreground",
		paper: "bg-paper text-paper-ink",
		outline: "border border-border text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({
			variant,
			className
		})),
		...props
	});
}
function inviteUrl(code) {
	if (typeof window === "undefined") return "";
	return `${window.location.origin}/sala/${code}`;
}
function StatsPanel({ room }) {
	if (room.phase !== "revealed" || !room.stats) return null;
	const { stats } = room;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:px-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground",
					children: "Resultado"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-3xl font-semibold tabular-nums leading-none",
					children: stats.average === null ? "—" : stats.average
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Media de las cartas numéricas"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [stats.consensus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "paper",
					children: "Consenso"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Hay dispersión" }), stats.min !== null && stats.max !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					children: [
						"Rango ",
						stats.min,
						"–",
						stats.max
					]
				}) : null]
			})]
		}), stats.tally.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 flex flex-wrap gap-2",
			children: stats.tally.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1.5 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display font-semibold",
					children: CARD_LABEL[item.card]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums text-muted-foreground",
					children: ["×", item.count]
				})]
			}, item.card))
		}) : null]
	});
}
function RoomTable({ room, profile, onRoom }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const castVoteFn = useServerFn(castVote);
	const revealFn = useServerFn(revealVotes);
	const nextRoundFn = useServerFn(nextRound);
	const setStoryFn = useServerFn(setStory);
	const leaveFn = useServerFn(leaveRoom);
	const [storyDraft, setStoryDraft] = (0, import_react.useState)(room.story);
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setStoryDraft(room.story);
	}, [room.story]);
	const voting = room.phase === "voting";
	const votedCount = room.members.filter((m) => m.hasVoted).length;
	const voteMut = useMutation({
		mutationFn: (card) => castVoteFn({ data: {
			code: room.code,
			memberId: profile.memberId,
			card
		} }),
		onSuccess: (result) => {
			if (!result.ok) toast.error(result.message);
			else onRoom(result.room);
		},
		onError: () => toast.error("No se pudo registrar el voto.")
	});
	const revealMut = useMutation({
		mutationFn: () => revealFn({ data: {
			code: room.code,
			memberId: profile.memberId
		} }),
		onSuccess: (result) => {
			if (!result.ok) toast.error(result.message);
			else onRoom(result.room);
		},
		onError: () => toast.error("No se pudieron revelar los votos.")
	});
	const nextMut = useMutation({
		mutationFn: () => nextRoundFn({ data: {
			code: room.code,
			memberId: profile.memberId,
			story: storyDraft
		} }),
		onSuccess: (result) => {
			if (!result.ok) toast.error(result.message);
			else onRoom(result.room);
		},
		onError: () => toast.error("No se pudo abrir la ronda.")
	});
	async function saveStory() {
		const result = await setStoryFn({ data: {
			code: room.code,
			memberId: profile.memberId,
			story: storyDraft
		} });
		if (!result.ok) toast.error(result.message);
		else onRoom(result.room);
	}
	async function copyInvite() {
		const url = inviteUrl(room.code);
		const text = `Únete a mi sala de Mesa Fibo: ${room.code}\n${url}`;
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			toast.success("Invitación copiada");
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			toast.error("No se pudo copiar. El número de sala es " + room.code);
		}
	}
	async function shareInvite() {
		const url = inviteUrl(room.code);
		if (typeof navigator.share === "function") try {
			await navigator.share({
				title: "Mesa Fibo",
				text: `Únete a la sala ${room.code}`,
				url
			});
			return;
		} catch {}
		await copyInvite();
	}
	async function handleLeave() {
		await leaveFn({ data: {
			code: room.code,
			memberId: profile.memberId
		} });
		queryClient.removeQueries({ queryKey: ["room", room.code] });
		await navigate({ to: "/" });
	}
	const canReveal = voting && (room.isHost || room.allVoted) && votedCount > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "felt-bg flex min-h-dvh flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between gap-3 px-4 py-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLockup, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					children: [
						room.members.length,
						"/",
						15
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: handleLeave,
					className: "gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Salir"
					})]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 pb-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-3 rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center sm:justify-between sm:px-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-widest text-muted-foreground",
						children: "Código de sala"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-semibold tracking-widest tabular-nums",
						children: room.code
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: copyInvite,
							className: "flex-1 sm:flex-none",
							children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copiar invitación"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: shareInvite,
							className: "flex-1 sm:flex-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Compartir"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:px-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground",
						children: "Historia a estimar"
					}), room.isHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						onSubmit: (event) => {
							event.preventDefault();
							saveStory();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: storyDraft,
							maxLength: 200,
							placeholder: "Ej. Como usuario, quiero filtrar el listado…",
							onChange: (event) => setStoryDraft(event.target.value.slice(0, 200))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "secondary",
							className: "sm:w-auto",
							children: "Guardar"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl font-semibold leading-snug",
						children: room.story.trim() ? room.story : "El anfitrión aún no ha escrito la historia."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-baseline justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-foreground",
						children: "Mesa"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm tabular-nums text-muted-foreground",
						children: [
							votedCount,
							"/",
							room.members.length,
							" votos"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6",
					children: room.members.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col items-center gap-2 rounded-lg bg-card/70 px-2 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeatCard, {
							card: member.vote,
							hasVoted: member.hasVoted,
							revealed: room.phase === "revealed",
							name: member.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg leading-none",
									"aria-hidden": "true",
									children: member.emoji
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-1 max-w-full truncate text-xs font-medium",
									children: [member.name, member.id === profile.memberId ? " (tú)" : ""]
								}),
								member.isHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xs uppercase tracking-wide text-muted-foreground",
									children: "Anfitrión"
								}) : null
							]
						})]
					}, member.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsPanel, { room }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "sticky bottom-0 z-10 -mx-4 mt-auto border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:-mx-0 sm:rounded-xl sm:border sm:shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: voting ? room.myVote ? `Tu voto: ${CARD_LABEL[room.myVote]}. Puedes cambiarlo hasta revelar.` : "Elige una carta. Nadie la verá todavía." : "Ronda revelada. El anfitrión abre la siguiente."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: voting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => revealMut.mutate(),
								disabled: !canReveal || revealMut.isPending,
								variant: room.allVoted ? "default" : "secondary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), "Revelar"]
							}) : room.isHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => nextMut.mutate(),
								disabled: nextMut.isPending,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Nueva ronda"]
							}) : null
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap justify-center gap-2",
						children: ALL_CARDS.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoteCard, {
							card,
							size: "md",
							face: "front",
							selected: room.myVote === card,
							disabled: !voting || voteMut.isPending,
							onSelect: () => voteMut.mutate(card)
						}, card))
					})]
				})
			]
		})]
	});
}
function RoomGate({ code }) {
	const [profile, setProfile] = (0, import_react.useState)(null);
	const getRoomFn = useServerFn(getRoom);
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		setProfile(loadProfile());
	}, []);
	const query = useQuery({
		queryKey: [
			"room",
			code,
			profile?.memberId
		],
		enabled: Boolean(profile?.memberId),
		queryFn: () => getRoomFn({ data: {
			code,
			memberId: profile.memberId
		} }),
		refetchInterval: 1400
	});
	function applyRoom(next) {
		if (!profile) return;
		queryClient.setQueryData([
			"room",
			code,
			profile.memberId
		], {
			ok: true,
			room: next
		});
	}
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "felt-bg min-h-dvh",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-md px-4 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-xl bg-card" })
		})
	});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "felt-bg mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLockup, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "No se pudo conectar con la sala. Recarga e inténtalo."
		})]
	});
	if (query.data && !query.data.ok && query.data.reason === "not-found") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "felt-bg mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLockup, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Sala no encontrada"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: query.data.message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => window.history.back(),
				children: "Volver"
			})
		]
	});
	if (query.data?.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomTable, {
		room: query.data.room,
		profile,
		onRoom: applyRoom
	});
	if (query.data?.reason === "not-member") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JoinOnly, {
		code,
		onJoined: (room) => {
			setProfile(loadProfile());
			applyRoom(room);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "felt-bg min-h-dvh",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-md px-4 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-xl bg-card" })
		})
	});
}
function SalaPage() {
	const { code } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomGate, { code });
}
//#endregion
export { SalaPage as component };
