"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function scoreOf(value: unknown) {
  const score = Number(value);
  return Number.isInteger(score) && score >= 1 && score <= 5 ? score : null;
}

export async function getPublishedRelaxationTracks() {
  const assets = await prisma.mediaAsset.findMany({ where: { folder: "relaxation", isPublished: true }, orderBy: { createdAt: "desc" } });
  return assets.map((asset) => ({ id: asset.id, title: asset.name, note: asset.note, timeTag: asset.timeTag, url: asset.url, playCount: asset.playCount, averageRating: asset.averageRating, ratingCount: asset.ratingCount }));
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
