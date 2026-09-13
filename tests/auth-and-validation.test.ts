import assert from "node:assert/strict";
import { test } from "node:test";
import { assertSpotOwnership, ForbiddenError } from "../src/lib/auth";
import { spotSchema } from "../src/lib/validations/spot";

test("ownership guard permits the resource owner", () => {
  assert.doesNotThrow(() => assertSpotOwnership("user-1", "user-1"));
});

test("ownership guard rejects another user", () => {
  assert.throws(
    () => assertSpotOwnership("user-1", "user-2"),
    (error: unknown) => error instanceof ForbiddenError
  );
});

test("ownership guard permits an admin override", () => {
  assert.doesNotThrow(() => assertSpotOwnership("user-1", "admin-1", true));
});

test("spot validation rejects invalid noise levels", () => {
  const result = spotSchema.safeParse({
    title: "Library",
    description: "Quiet desk",
    location: "Building A",
    noiseLevel: "loud",
    imageUrl: "/library.jpg",
    audioUrl: "/library.ogg",
  });

  assert.equal(result.success, false);
});

test("spot validation accepts a complete spot", () => {
  const result = spotSchema.safeParse({
    title: "Library",
    description: "Quiet desk",
    location: "Building A",
    noiseLevel: "quiet",
    imageUrl: "/library.jpg",
    audioUrl: "/library.ogg",
  });

  assert.equal(result.success, true);
});
