import { describe, expect, test } from "vitest";
import { move } from "./lib";

describe("move", () => {
  const array = ["a", "b", "c", "d", "e"];

  test("move 1 -> 3", () => {
    const expected = ["a", "c", "d", "b", "e"];
    expect(move(array, 1, 3)).toEqual(expected);
  });

  test("move 3 -> 2", () => {
    const expected = ["a", "b", "d", "c", "e"];
    expect(move(array, 3, 2)).toEqual(expected);
  });

  test("move 2 -> 2", () => {
    expect(move(array, 2, 2)).toBe(array);
  });
});
