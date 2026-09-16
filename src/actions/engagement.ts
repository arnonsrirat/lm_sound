"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function scoreOf(value: unknown) {
  const score = Number(value);
  return Number.isInteger(score) && score >= 1 && score <= 5 ? score : null;
}

export async function getPublishedRelaxationTracks() {
  const [assets, playlists] = await Promise.all([
    prisma.mediaAsset.findMany({ where: { folder: "relaxation", isPublished: true }, orderBy: { createdAt: "desc" } }),
    prisma.relaxationPlaylist.findMany({ where: { isPublished: true }, orderBy: { updatedAt: "desc" }, include: { tracks: { orderBy: { position: "asc" }, include: { asset: true } } } }),
  ]);
  return {
    tracks: assets.map((asset) => ({ id: asset.id, title: asset.originalName || asset.name, note: asset.note, timeTag: asset.timeTag, url: asset.url, playCount: asset.playCount, averageRating: asset.averageRating, ratingCount: asset.ratingCount })),
    playlists: playlists.map((playlist) => ({ id: playlist.id, name: playlist.name, description: playlist.description, coverUrl: playlist.coverUrl, tracks: playlist.tracks.map(({ asset }) => ({ id: asset.id, title: asset.originalName || asset.name, note: asset.note, timeTag: asset.timeTag, url: asset.url, playCount: asset.playCount, averageRating: asset.averageRating, ratingCount: asset.ratingCount })) })),
  };
}

export async function getAdminRelaxationData() {
  const session = await requireAuth();
  if (session.role !== "ADMIN") throw new Error("เฉพาะผู้ดูแลระบบเท่านั้น");
  const [tracks, playlists] = await Promise.all([
    prisma.mediaAsset.findMany({ where: { folder: "relaxation" }, orderBy: { createdAt: "desc" } }),
    prisma.relaxationPlaylist.findMany({ orderBy: { updatedAt: "desc" }, include: { tracks: { orderBy: { position: "asc" }, select: { assetId: true, position: true } } } }),
  ]);
  return { tracks, playlists };
}

export async function saveRelaxationPlaylist(input: { id?: string; name: string; description?: string; coverUrl?: string; isPublished?: boolean; assetIds: string[] }) {
  const session = await requireAuth();
  if (session.role !== "ADMIN") throw new Error("เฉพาะผู้ดูแลระบบเท่านั้น");
  if (!input.name.trim()) throw new Error("กรุณาระบุชื่อเพลย์ลิสต์");
  const assets = await prisma.mediaAsset.findMany({ where: { id: { in: input.assetIds }, folder: "relaxation" }, select: { id: true } });
  const allowed = new Set(assets.map((asset) => asset.id));
  const assetIds = input.assetIds.filter((id) => allowed.has(id));
  return prisma.$transaction(async (tx) => {
    const playlist = input.id
      ? await tx.relaxationPlaylist.update({ where: { id: input.id }, data: { name: input.name.trim(), description: input.description?.trim() || null, coverUrl: input.coverUrl?.trim() || null, isPublished: Boolean(input.isPublished) } })
      : await tx.relaxationPlaylist.create({ data: { name: input.name.trim(), description: input.description?.trim() || null, coverUrl: input.coverUrl?.trim() || null, isPublished: Boolean(input.isPublished) } });
    await tx.relaxationPlaylistTrack.deleteMany({ where: { playlistId: playlist.id } });
    if (assetIds.length) await tx.relaxationPlaylistTrack.createMany({ data: assetIds.map((assetId, position) => ({ playlistId: playlist.id, assetId, position })) });
    return playlist;
  });
}

export async function deleteRelaxationPlaylist(id: string) {
  const session = await requireAuth();
  if (session.role !== "ADMIN") throw new Error("เฉพาะผู้ดูแลระบบเท่านั้น");
  await prisma.relaxationPlaylist.delete({ where: { id } });
  return { success: true };
}

export async function recordTrackPlay(assetId: string) {
  const asset = await prisma.mediaAsset.findFirst({ where: { id: assetId, folder: "relaxation", isPublished: true }, select: { id: true } });
  if (!asset) return { success: false };
  await prisma.mediaAsset.update({ where: { id: assetId }, data: { playCount: { increment: 1 } } });
  return { success: true };
}

export async function rateTrack(assetId: string, rawScore: unknown) {
  const session = await requireAuth();
  const score = scoreOf(rawScore);
  if (!score) return { success: false, error: "คะแนนต้องอยู่ระหว่าง 1 ถึง 5" };
  const asset = await prisma.mediaAsset.findFirst({ where: { id: assetId, folder: "relaxation", isPublished: true }, select: { id: true } });
  if (!asset) return { success: false, error: "ไม่พบเพลงนี้" };
  await prisma.trackRating.upsert({ where: { assetId_userId: { assetId, userId: session.userId } }, create: { assetId, userId: session.userId, score }, update: { score } });
  const aggregate = await prisma.trackRating.aggregate({ where: { assetId }, _avg: { score: true }, _count: { _all: true } });
  await prisma.mediaAsset.update({ where: { id: assetId }, data: { averageRating: aggregate._avg.score ?? 0, ratingCount: aggregate._count._all } });
  return { success: true, averageRating: aggregate._avg.score ?? 0, ratingCount: aggregate._count._all };
}

export async function rateSpot(spotId: string, rawScore: unknown) {
  const session = await requireAuth();
  const score = scoreOf(rawScore);
  if (!score) return { success: false, error: "คะแนนต้องอยู่ระหว่าง 1 ถึง 5" };
  await prisma.spotRating.upsert({ where: { spotId_userId: { spotId, userId: session.userId } }, create: { spotId, userId: session.userId, score }, update: { score } });
  const aggregate = await prisma.spotRating.aggregate({ where: { spotId }, _avg: { score: true }, _count: { _all: true } });
  await prisma.spot.update({ where: { id: spotId }, data: { averageRating: aggregate._avg.score ?? 0, ratingCount: aggregate._count._all } });
  return { success: true, averageRating: aggregate._avg.score ?? 0, ratingCount: aggregate._count._all };
}

export async function toggleSpotFavorite(spotId: string) {
  const session = await requireAuth();
  const existing = await prisma.spotFavorite.findUnique({ where: { spotId_userId: { spotId, userId: session.userId } } });
  if (existing) { await prisma.spotFavorite.delete({ where: { id: existing.id } }); return { success: true, liked: false }; }
  await prisma.spotFavorite.create({ data: { spotId, userId: session.userId } });
  return { success: true, liked: true };
}
