import { describe, expect, test } from "vitest";
import { FEATURE_PATTERN, move, NAME_PATTERN, parsePathname } from "./lib";

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

describe("parsePathname", () => {
  test("should have valid regular expressions", () => {
    expect(() => new RegExp(NAME_PATTERN)).not.toThrow();
    expect(() => new RegExp(FEATURE_PATTERN)).not.toThrow();
  });

  test.each([
    {
      input: "/groups/my-group",
      expected: { path: "my-group", feature: undefined },
    },
    {
      input: "/groups/my-group/my-subgroup",
      expected: { path: "my-group/my-subgroup", feature: undefined },
    },
    {
      input: "/my-group",
      expected: { path: "my-group", feature: undefined },
    },
    {
      input: "/my-group/my-subgroup",
      expected: { path: "my-group/my-subgroup", feature: undefined },
    },
  ])("should parse group paths ($input)", ({ input, expected }) => {
    expect(parsePathname(input)).toEqual(expected);
  });

  test.each([
    {
      input: "/my-group/my-project",
      expected: { path: "my-group/my-project", feature: undefined },
    },
    {
      input: "/my-group/my-subgroup/my-project",
      expected: { path: "my-group/my-subgroup/my-project", feature: undefined },
    },
  ])("should parse project paths ($input)", ({ input, expected }) => {
    expect(parsePathname(input)).toEqual(expected);
  });

  test.each([
    {
      input: "/my-group/my-project/-/issues",
      expected: { path: "my-group/my-project", feature: "issues" },
    },
    {
      input: "/my-group/my-project/-/settings/integrations",
      expected: {
        path: "my-group/my-project",
        feature: "settings/integrations",
      },
    },
  ])("should parse paths with feature ($input)", ({ input, expected }) => {
    expect(parsePathname(input)).toEqual(expected);
  });

  test("should parse dashboard feature", () => {
    expect(parsePathname("/dashboard/issues")).toEqual({
      path: undefined,
      feature: "issues",
    });
  });
});
